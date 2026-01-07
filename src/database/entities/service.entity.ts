import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { Category } from './category.entity';
import { Task } from './task.entity';

@Entity('services')
export class Service {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    categoryId: string;

    @Column()
    name: string;

    @Column({ type: 'text' })
    description: string;

    @Column({ type: 'int', comment: 'Estimated duration in minutes' })
    estimatedDuration: number;

    @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
    basePrice: number;

    @ManyToOne(() => Category, (category) => category.services)
    @JoinColumn({ name: 'categoryId' })
    category: Category;

    @OneToMany(() => Task, (task) => task.service)
    tasks: Task[];
}
