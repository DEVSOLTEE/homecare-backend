import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../database/entities/user.entity';
import { Task } from '../database/entities/task.entity';
import { Service } from '../database/entities/service.entity';
import { TaskAssignment } from '../database/entities/task-assignment.entity';

@Injectable()
export class AdminService {
    constructor(
        @InjectRepository(User)
        private userRepository: Repository<User>,
        @InjectRepository(Task)
        private taskRepository: Repository<Task>,
        @InjectRepository(Service)
        private serviceRepository: Repository<Service>,
    ) { }

    async getAllUsers() {
        const users = await this.userRepository.find({
            select: ['id', 'email', 'firstName', 'lastName', 'role', 'isActive', 'isApproved', 'phone', 'identificationPath', 'createdAt'],
            order: { createdAt: 'DESC' },
        });
        return users;
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
            where: { id },
            select: ['id', 'email', 'firstName', 'lastName', 'role', 'isActive', 'isApproved', 'identificationPath', 'createdAt']
        });
    }

    async getPendingContractors() {
        return this.userRepository.find({
            where: { role: 'CONTRACTOR' as any, isApproved: false },
            order: { createdAt: 'DESC' },
        });
    }

    async verifyContractor(userId: string, approve: boolean) {
        const user = await this.userRepository.findOne({ where: { id: userId, role: 'CONTRACTOR' as any } });
        if (!user) throw new NotFoundException('Contractor not found');

        if (approve) {
            user.isApproved = true;
            user.isActive = true;
        } else {
            // If rejected, we might want to deactivate or just leave it. 
            // For now, let's keep it simple: approve=true sets isApproved=true.
            user.isApproved = false;
            user.isActive = false; // Deactivate if not approved
        }

        await this.userRepository.save(user);
        return user;
    }
}
