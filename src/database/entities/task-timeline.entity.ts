import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn } from 'typeorm';
import { Task } from './task.entity';

@Entity('task_timeline')
export class TaskTimeline {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    taskId: string;

    @Column()
    action: string;

    @Column()
    performedBy: string;

    @Column({ type: 'text', nullable: true })
    details: string;

    @CreateDateColumn()
    createdAt: Date;

    @ManyToOne(() => Task, (task) => task.timeline)
    @JoinColumn({ name: 'taskId' })
    task: Task;
}
