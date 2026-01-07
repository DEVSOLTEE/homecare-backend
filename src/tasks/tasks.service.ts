import { Injectable, NotFoundException, BadRequestException, ForbiddenException, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Task, TaskStatus } from '../database/entities/task.entity';
import { TaskAssignment } from '../database/entities/task-assignment.entity';
import { TaskTimeline } from '../database/entities/task-timeline.entity';
import { UserRole } from '../database/entities/user.entity';

@Injectable()
export class TasksService {
    constructor(
        @InjectRepository(Task)
        private taskRepository: Repository<Task>,
        @InjectRepository(TaskAssignment)
        private assignmentRepository: Repository<TaskAssignment>,
        @InjectRepository(TaskTimeline)
        private timelineRepository: Repository<TaskTimeline>,
    ) { }

    async create(
        clientId: string,
        serviceId: string,
        homeId: string,
        preferredStartDate: Date,
        preferredEndDate: Date,
        clientNotes?: string,
    ) {
        const task = this.taskRepository.create({
            clientId,
            serviceId,
            homeId,
            status: TaskStatus.REQUESTED,
            preferredStartDate,
            preferredEndDate,
            clientNotes,
        });

        const savedTask = await this.taskRepository.save(task);

        await this.addTimelineEntry(savedTask.id, clientId, 'Task created', 'Client requested service');

        return this.findOne(savedTask.id);
    }

    async findAll(userId: string, userRole: UserRole) {
        const queryBuilder = this.taskRepository
            .createQueryBuilder('task')
            .leftJoinAndSelect('task.client', 'client')
            .leftJoinAndSelect('task.service', 'service')
            .leftJoinAndSelect('task.home', 'home')
            .leftJoinAndSelect('task.assignments', 'assignments')
            .leftJoinAndSelect('assignments.contractor', 'contractor');

        if (userRole === UserRole.CLIENT) {
            queryBuilder.where('task.clientId = :userId', { userId });
        } else if (userRole === UserRole.CONTRACTOR) {
            queryBuilder
                .innerJoin('task.assignments', 'assignment')
                .where('assignment.contractorId = :userId', { userId });
        }

        return queryBuilder.orderBy('task.createdAt', 'DESC').getMany();
    }

    async findOne(id: string) {
        const task = await this.taskRepository.findOne({
            where: { id },
            relations: [
                'client',
                'service',
                'service.category',
                'home',
                'assignments',
                'assignments.contractor',
                'files',
                'report',
                'invoice',
                'invoice.items',
                'timeline',
            ],
        });

        if (!task) {
            throw new NotFoundException('Task not found');
        }

        return task;
    }

    async assignContractor(taskId: string, contractorId: string, assignedBy: string) {
        try {
            const task = await this.findOne(taskId);

            const assignment = this.assignmentRepository.create({
                taskId,
                contractorId,
                assignedBy,
            });

            await this.assignmentRepository.save(assignment);

            task.status = TaskStatus.AWAITING_CONTRACTOR_PROPOSAL;
            await this.taskRepository.save(task);

            await this.addTimelineEntry(taskId, assignedBy, 'Contractor assigned', `Contractor assigned to task`);

            return this.findOne(taskId);
        } catch (error) {
            console.error('Failed to assign contractor:', error);
            throw new InternalServerErrorException(`Failed to assign contractor: ${error.message}`);
        }
    }

    async proposeSchedule(taskId: string, proposedDate: Date, proposedTime: string, contractorId: string) {
        const task = await this.findOne(taskId);

        if (task.status !== TaskStatus.AWAITING_CONTRACTOR_PROPOSAL && task.status !== TaskStatus.REQUESTED) {
            throw new BadRequestException('Task is not awaiting contractor proposal');
        }

        task.proposedDate = proposedDate;
        task.proposedTime = proposedTime;
        task.status = TaskStatus.PROPOSED;

        await this.taskRepository.save(task);

        await this.addTimelineEntry(
            taskId,
            contractorId,
            'Schedule proposed',
            `Proposed date: ${proposedDate.toDateString()} at ${proposedTime}`,
        );

        return this.findOne(taskId);
    }

    async acceptTask(taskId: string, contractorId: string) {
        console.log(`Accepting task ${taskId} by contractor ${contractorId}`);
        const task = await this.findOne(taskId);

        if (task.status !== TaskStatus.AWAITING_CONTRACTOR_PROPOSAL && task.status !== TaskStatus.PROPOSED && task.status !== TaskStatus.REQUESTED) {
            console.error(`Task ${taskId} is in status ${task.status}, cannot accept`);
            throw new BadRequestException('Task is not in a state that can be accepted');
        }

        // If it was awaiting proposal or requested, we use preferred dates.
        // If it was already proposed, we keep the proposed values.
        if (task.status === TaskStatus.AWAITING_CONTRACTOR_PROPOSAL || task.status === TaskStatus.REQUESTED) {
            task.proposedDate = task.preferredStartDate;
            task.proposedTime = '09:00';
        }

        task.status = TaskStatus.APPROVED;
        task.approvedDate = new Date();

        try {
            await this.taskRepository.save(task);
            console.log(`Task ${taskId} status updated to APPROVED`);
        } catch (error) {
            console.error(`Failed to save task ${taskId}:`, error);
            throw error;
        }

        try {
            await this.addTimelineEntry(
                taskId,
                contractorId,
                'Task accepted',
                `Contractor accepted the task`,
            );
            console.log(`Timeline entry added for task ${taskId}`);
        } catch (error) {
            console.error(`Failed to add timeline entry for task ${taskId}:`, error);
            throw error;
        }

        return this.findOne(taskId);
    }

    async approveSchedule(taskId: string, clientId: string) {
        const task = await this.findOne(taskId);

        if (task.status !== TaskStatus.PROPOSED) {
            throw new BadRequestException('Task does not have a proposed schedule');
        }

        if (task.clientId !== clientId) {
            throw new ForbiddenException('Only the client can approve the schedule');
        }

        task.status = TaskStatus.APPROVED;
        task.approvedDate = new Date();

        await this.taskRepository.save(task);

        await this.addTimelineEntry(taskId, clientId, 'Schedule approved', 'Client approved the proposed schedule');

        return this.findOne(taskId);
    }

    async rejectSchedule(taskId: string, clientId: string, reason?: string) {
        const task = await this.findOne(taskId);

        if (task.status !== TaskStatus.PROPOSED) {
            throw new BadRequestException('Task does not have a proposed schedule');
        }

        if (task.clientId !== clientId) {
            throw new ForbiddenException('Only the client can reject the schedule');
        }

        task.status = TaskStatus.AWAITING_CONTRACTOR_PROPOSAL;
        task.proposedDate = null;
        task.proposedTime = null;

        await this.taskRepository.save(task);

        await this.addTimelineEntry(taskId, clientId, 'Schedule rejected', reason || 'Client rejected the proposed schedule');

        return this.findOne(taskId);
    }

    async updateStatus(taskId: string, status: TaskStatus, userId: string) {
        const task = await this.findOne(taskId);

        const validTransitions = this.getValidTransitions(task.status);
        if (!validTransitions.includes(status)) {
            throw new BadRequestException(`Cannot transition from ${task.status} to ${status}`);
        }

        task.status = status;

        if (status === TaskStatus.COMPLETED) {
            task.completedDate = new Date();
        }

        await this.taskRepository.save(task);

        await this.addTimelineEntry(taskId, userId, 'Status updated', `Status changed to ${status}`);

        return this.findOne(taskId);
    }

    async cancel(taskId: string, userId: string, reason?: string) {
        const task = await this.findOne(taskId);

        task.status = TaskStatus.CANCELLED;
        await this.taskRepository.save(task);

        await this.addTimelineEntry(taskId, userId, 'Task cancelled', reason || 'Task was cancelled');

        return this.findOne(taskId);
    }

    private async addTimelineEntry(taskId: string, performedBy: string, action: string, details?: string) {
        const timeline = this.timelineRepository.create({
            taskId,
            performedBy,
            action,
            details,
        });

        await this.timelineRepository.save(timeline);
    }

    private getValidTransitions(currentStatus: TaskStatus): TaskStatus[] {
        const transitions: Record<TaskStatus, TaskStatus[]> = {
            [TaskStatus.DRAFT]: [TaskStatus.REQUESTED, TaskStatus.CANCELLED],
            [TaskStatus.REQUESTED]: [TaskStatus.AWAITING_CONTRACTOR_PROPOSAL, TaskStatus.CANCELLED],
            [TaskStatus.AWAITING_CONTRACTOR_PROPOSAL]: [TaskStatus.PROPOSED, TaskStatus.APPROVED, TaskStatus.CANCELLED],
            [TaskStatus.PROPOSED]: [TaskStatus.APPROVED, TaskStatus.REJECTED, TaskStatus.AWAITING_CONTRACTOR_PROPOSAL, TaskStatus.PROPOSED, TaskStatus.CANCELLED],
            [TaskStatus.APPROVED]: [TaskStatus.SCHEDULED, TaskStatus.CANCELLED],
            [TaskStatus.SCHEDULED]: [TaskStatus.IN_PROGRESS, TaskStatus.CANCELLED],
            [TaskStatus.IN_PROGRESS]: [TaskStatus.COMPLETED, TaskStatus.CANCELLED],
            [TaskStatus.COMPLETED]: [],
            [TaskStatus.CANCELLED]: [],
            [TaskStatus.REJECTED]: [TaskStatus.AWAITING_CONTRACTOR_PROPOSAL, TaskStatus.CANCELLED],
        };

        return transitions[currentStatus] || [];
    }
}
