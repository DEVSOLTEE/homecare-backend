import { Controller, Get, Post, Put, Body, Param, UseGuards, Query } from '@nestjs/common';
import { TasksService } from './tasks.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { UserRole } from '../database/entities/user.entity';
import { TaskStatus } from '../database/entities/task.entity';

@Controller('tasks')
@UseGuards(JwtAuthGuard, RolesGuard)
export class TasksController {
    constructor(private tasksService: TasksService) { }

    @Post()
    @Roles(UserRole.CLIENT)
    async create(
        @CurrentUser() user: any,
        @Body('serviceId') serviceId: string,
        @Body('homeId') homeId: string,
        @Body('preferredStartDate') preferredStartDate: string,
        @Body('preferredEndDate') preferredEndDate: string,
        @Body('clientNotes') clientNotes?: string,
    ) {
        return this.tasksService.create(
            user.id,
            serviceId,
            homeId,
            new Date(preferredStartDate),
            new Date(preferredEndDate),
            clientNotes,
        );
    }

    @Get()
    async findAll(@CurrentUser() user: any) {
        return this.tasksService.findAll(user.id, user.role);
    }

    @Get(':id')
    async findOne(@Param('id') id: string) {
        return this.tasksService.findOne(id);
    }

    @Post(':id/assign')
    @Roles(UserRole.ADMIN)
    async assignContractor(
        @Param('id') id: string,
        @Body('contractorId') contractorId: string,
        @CurrentUser() user: any,
    ) {
        return this.tasksService.assignContractor(id, contractorId, user.id);
    }

    @Post(':id/propose-schedule')
    @Roles(UserRole.CONTRACTOR)
    async proposeSchedule(
        @Param('id') id: string,
        @Body('proposedDate') proposedDate: string,
        @Body('proposedTime') proposedTime: string,
        @CurrentUser() user: any,
    ) {
        return this.tasksService.proposeSchedule(id, new Date(proposedDate), proposedTime, user.id);
    }

    @Post(':id/accept')
    @Roles(UserRole.CONTRACTOR)
    async acceptTask(
        @Param('id') id: string,
        @CurrentUser() user: any,
    ) {
        return this.tasksService.acceptTask(id, user.id);
    }

    @Post(':id/approve-schedule')
    @Roles(UserRole.CLIENT)
    async approveSchedule(@Param('id') id: string, @CurrentUser() user: any) {
        return this.tasksService.approveSchedule(id, user.id);
    }

    @Post(':id/reject-schedule')
    @Roles(UserRole.CLIENT)
    async rejectSchedule(
        @Param('id') id: string,
        @Body('reason') reason: string,
        @CurrentUser() user: any,
    ) {
        return this.tasksService.rejectSchedule(id, user.id, reason);
    }

    @Put(':id/status')
    async updateStatus(
        @Param('id') id: string,
        @Body('status') status: TaskStatus,
        @CurrentUser() user: any,
    ) {
        return this.tasksService.updateStatus(id, status, user.id);
    }

    @Post(':id/cancel')
    async cancel(
        @Param('id') id: string,
        @Body('reason') reason: string,
        @CurrentUser() user: any,
    ) {
        return this.tasksService.cancel(id, user.id, reason);
    }
}
