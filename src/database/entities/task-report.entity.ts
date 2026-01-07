import { Entity, PrimaryGeneratedColumn, Column, OneToOne, JoinColumn, CreateDateColumn } from 'typeorm';
import { Task } from './task.entity';

@Entity('task_reports')
export class TaskReport {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    taskId: string;

    @Column({ type: 'text' })
    summary: string;

    @Column({ type: 'text' })
    workPerformed: string;

    @Column({ type: 'text', nullable: true })
    recommendations: string;

    @CreateDateColumn()
    createdAt: Date;

    @OneToOne(() => Task, (task) => task.report)
    @JoinColumn({ name: 'taskId' })
    task: Task;
}
