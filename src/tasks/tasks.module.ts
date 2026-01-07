import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TasksService } from './tasks.service';
import { TasksController } from './tasks.controller';
import { Task } from '../database/entities/task.entity';
import { TaskAssignment } from '../database/entities/task-assignment.entity';
import { TaskTimeline } from '../database/entities/task-timeline.entity';

@Module({
    imports: [TypeOrmModule.forFeature([Task, TaskAssignment, TaskTimeline])],
    controllers: [TasksController],
    providers: [TasksService],
    exports: [TasksService],
})
export class TasksModule { }
