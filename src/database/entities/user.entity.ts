import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { Home } from './home.entity';
import { Task } from './task.entity';
import { TaskAssignment } from './task-assignment.entity';

export enum UserRole {
    CLIENT = 'CLIENT',
    CONTRACTOR = 'CONTRACTOR',
    ADMIN = 'ADMIN',
}

@Entity('users')
export class User {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ unique: true })
    email: string;

    @Column()
    password: string;

    @Column()
    firstName: string;

    @Column()
    lastName: string;

    @Column({ nullable: true })
    phone: string;

    @Column({ nullable: true })
    avatarUrl: string;

    @Column({
        type: 'enum',
        enum: UserRole,
        default: UserRole.CLIENT,
    })
    role: UserRole;

    @Column({ default: true })
    isActive: boolean;

    @Column({ default: true })
    isApproved: boolean;

    @Column({ nullable: true })
    identificationPath: string;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;

    @OneToMany(() => Home, (home) => home.user)
    homes: Home[];

    @OneToMany(() => Task, (task) => task.client)
    tasks: Task[];

    @OneToMany(() => TaskAssignment, (assignment) => assignment.contractor)
    assignments: TaskAssignment[];
}
