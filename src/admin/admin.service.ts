import { Injectable, NotFoundException, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../database/entities/user.entity';
import { Task } from '../database/entities/task.entity';
import { Service } from '../database/entities/service.entity';
import { TaskAssignment } from '../database/entities/task-assignment.entity';

@Injectable()
export class AdminService implements OnModuleInit {
    constructor(
        @InjectRepository(User)
        private userRepository: Repository<User>,
        @InjectRepository(Task)
        private taskRepository: Repository<Task>,
        @InjectRepository(Service)
        private serviceRepository: Repository<Service>,
    ) { }

    async onModuleInit() {
        console.log('👷 AdminService: Definitive Data Normalization...');
        try {
            // Force roles to uppercase
            await this.userRepository.query(`UPDATE users SET role = UPPER(role)`);

            // Log column names for diagnosis
            const columns = await this.userRepository.query(`
                SELECT column_name, data_type 
                FROM information_schema.columns 
                WHERE table_name = 'users' AND column_name ILIKE '%approved%';
            `);
            console.log('📊 Database columns matching "approved":', JSON.stringify(columns));

            console.log('✅ Data normalization script finished.');
        } catch (error) {
            console.error('❌ Data normalization failed:', error);
        }
    }

    async getAllUsers() {
        console.log('[ADMIN] Fetching all users...');
        const users = await this.userRepository.find({
            order: { createdAt: 'DESC' },
        });

        // Normalize for frontend
        const normalized = users.map(u => ({
            ...u,
            role: u.role?.toUpperCase() as any,
            isApproved: !!u.isApproved,
            isActive: !!u.isActive
        }));

        if (normalized.length > 0) {
            const sample = normalized[0];
            console.log(`[ADMIN] Normalized sample: ${sample.email}, role: ${sample.role}, approved: ${sample.isApproved}`);
        }
        return normalized;
    }

    async getSystemStats() {
        const [userCount, taskCount, serviceCount] = await Promise.all([
            this.userRepository.count(),
            this.taskRepository.count(),
            this.serviceRepository.count(),
        ]);

        return {
            totalUsers: userCount,
            totalTasks: taskCount,
            totalServices: serviceCount,
        };
    }

    async getAllTasks() {
        return this.taskRepository.find({
            relations: ['client', 'service', 'home', 'assignments', 'assignments.contractor'],
            order: { createdAt: 'DESC' },
        });
    }

    async assignTask(taskId: string, contractorId: string, adminId: string) {
        const task = await this.taskRepository.findOne({ where: { id: taskId } });
        if (!task) throw new NotFoundException('Task not found');

        const contractor = await this.userRepository.findOne({ where: { id: contractorId, role: 'CONTRACTOR' as any } });
        if (!contractor) throw new NotFoundException('Contractor not found');

        // Check if already assigned
        const existingAssignment = await this.taskRepository.manager.getRepository(TaskAssignment).findOne({
            where: { taskId, contractorId }
        });

        if (!existingAssignment) {
            const assignment = this.taskRepository.manager.getRepository(TaskAssignment).create({
                taskId,
                contractorId,
                assignedBy: adminId,
            });
            await this.taskRepository.manager.getRepository(TaskAssignment).save(assignment);
        }

        task.status = 'AWAITING_CONTRACTOR_PROPOSAL' as any;
        return this.taskRepository.save(task);
    }

    async unassignTask(taskId: string, contractorId: string) {
        await this.taskRepository.manager.getRepository(TaskAssignment).delete({
            taskId,
            contractorId
        });

        const task = await this.taskRepository.findOne({ where: { id: taskId }, relations: ['assignments'] });
        if (task && task.assignments.length === 0 && task.status === 'AWAITING_CONTRACTOR_PROPOSAL') {
            task.status = 'REQUESTED' as any;
            await this.taskRepository.save(task);
        }
        return task;
    }

    async updateUser(id: string, data: Partial<User>) {
        await this.userRepository.update(id, data);
        return this.userRepository.findOne({
            where: { id }
        });
    }

    async getPendingContractors() {
        console.log('[ADMIN] Fetching pending contractors...');
        const users = await this.userRepository.find({
            where: { isApproved: false }, // Role check handled in filter for robustness
            order: { createdAt: 'DESC' },
        });

        // Normalize and filter for contractors (case-insensitive)
        return users
            .filter(u => u.role?.toUpperCase() === 'CONTRACTOR')
            .map(u => ({
                ...u,
                role: 'CONTRACTOR' as any,
                isApproved: !!u.isApproved,
                isActive: !!u.isActive
            }));
    }

    async verifyContractor(userId: string, approve: boolean) {
        console.log(`[ADMIN-FINAL] Force SQL update for ${userId} to isApproved=${approve}`);

        try {
            // Try updating with double quotes (case sensitive)
            await this.userRepository.query(
                `UPDATE users SET "isApproved" = $1, "isActive" = $2, role = 'CONTRACTOR' WHERE id = $3`,
                [approve, approve ? true : undefined, userId]
            );
            console.log(`[ADMIN-FINAL] SQL update with "isApproved" succeeded.`);
        } catch (e1) {
            try {
                // Try updating with lowercase
                await this.userRepository.query(
                    `UPDATE users SET isapproved = $1, isactive = $2, role = 'CONTRACTOR' WHERE id = $3`,
                    [approve, approve ? true : undefined, userId]
                );
                console.log(`[ADMIN-FINAL] SQL update with isapproved succeeded.`);
            } catch (e2) {
                console.error(`[ADMIN-FINAL] ALL SQL UPDATES FAILED:`, { e1: e1.message, e2: e2.message });
                // Last ditch: use query builder one more time
                await this.userRepository.createQueryBuilder().update(User).set({ isApproved: approve }).where("id = :id", { id: userId }).execute();
            }
        }

        const freshUser = await this.userRepository.findOne({ where: { id: userId } });
        if (freshUser) {
            return {
                ...freshUser,
                isApproved: !!freshUser.isApproved,
                isActive: !!freshUser.isActive,
                role: freshUser.role?.toUpperCase() as any
            };
        }
        return freshUser;
    }

    async debugDumpUsers() {
        const entityManager = this.userRepository.manager;

        try {
            const [users, schema, rawData] = await Promise.all([
                this.userRepository.find(),
                entityManager.query(`
                    SELECT column_name, data_type, column_default 
                    FROM information_schema.columns 
                    WHERE table_name = 'users';
                `),
                entityManager.query(`SELECT id, email, role, "isApproved", "isActive" FROM users LIMIT 10;`)
            ]);

            return {
                typeormUsers: users,
                databaseSchema: schema,
                rawDatabaseData: rawData,
                serverTimestamp: new Date().toISOString()
            };
        } catch (error) {
            return { error: error.message, stack: error.stack };
        }
    }
}
