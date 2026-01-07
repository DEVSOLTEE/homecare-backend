import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn } from 'typeorm';
import { Task } from './task.entity';
import { User } from './user.entity';

@Entity('task_assignments')
export class TaskAssignment {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    taskId: string;

    @Column()
    contractorId: string;

    @Column({ nullable: true })
    assignedBy: string;

    @CreateDateColumn()
    assignedAt: Date;

    @ManyToOne(() => Task, (task) => task.assignments)
    @JoinColumn({ name: 'taskId' })
    task: Task;

    @ManyToOne(() => User, (user) => user.assignments)
    @JoinColumn({ name: 'contractorId' })
    contractor: User;
}
