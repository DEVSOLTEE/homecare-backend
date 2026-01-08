import { Controller, Get, Patch, Post, Body, Param, UseGuards, Request } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { User, UserRole } from '../database/entities/user.entity';
import { AdminService } from './admin.service';

@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AdminController {
    constructor(private adminService: AdminService) { }

    @Get('stats')
    @Roles(UserRole.ADMIN)
    getStats() {
        return this.adminService.getSystemStats();
    }

    @Get('users')
    @Roles(UserRole.ADMIN)
    getUsers() {
        return this.adminService.getAllUsers();
    }

    @Patch('users/:id')
    @Roles(UserRole.ADMIN)
    updateUser(@Param('id') id: string, @Body() data: Partial<User>) {
        return this.adminService.updateUser(id, data);
    }

    @Get('tasks')
    @Roles(UserRole.ADMIN)
    getTasks() {
        return this.adminService.getAllTasks();
    }

    @Post('tasks/:id/assign')
    @Roles(UserRole.ADMIN)
    assignTask(
        @Param('id') id: string,
        @Body('contractorId') contractorId: string,
        @Request() req: any
    ) {
        return this.adminService.assignTask(id, contractorId, req.user.id);
    }

    @Patch('tasks/:id/unassign')
    @Roles(UserRole.ADMIN)
    unassignTask(
        @Param('id') id: string,
        @Body('contractorId') contractorId: string
    ) {
        return this.adminService.unassignTask(id, contractorId);
    }

    @Get('pending-contractors')
    @Roles(UserRole.ADMIN)
    getPendingContractors() {
        return this.adminService.getPendingContractors();
    }

    @Post('verify-contractor/:id')
    @Roles(UserRole.ADMIN)
    verifyContractor(
        @Param('id') id: string,
        @Body('approve') approve: any
    ) {
        const isApproved = String(approve) === 'true';
        console.log(`[ADMIN] Controller verify: id=${id}, rawApprove=${approve}, parsed=${isApproved}`);
        return this.adminService.verifyContractor(id, isApproved);
    }
    @Get('debug-users')
    @Roles(UserRole.ADMIN)
    debugUsers() {
        return this.adminService.debugDumpUsers();
    }
}
