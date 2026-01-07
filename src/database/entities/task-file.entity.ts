import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn } from 'typeorm';
import { Task } from './task.entity';

@Entity('task_files')
export class TaskFile {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    taskId: string;

    @Column()
    uploadedBy: string;

    @Column()
    fileType: string;

    @Column()
    filePath: string;

    @Column()
    fileName: string;

    @CreateDateColumn()
    uploadedAt: Date;

    @ManyToOne(() => Task, (task) => task.files)
    @JoinColumn({ name: 'taskId' })
    task: Task;
}
