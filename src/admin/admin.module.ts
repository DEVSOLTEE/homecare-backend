import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { User } from '../database/entities/user.entity';
import { Task } from '../database/entities/task.entity';
import { Service } from '../database/entities/service.entity';

@Module({
    imports: [TypeOrmModule.forFeature([User, Task, Service])],
    controllers: [AdminController],
    providers: [AdminService],
})
export class AdminModule { }
