import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, OneToMany, OneToOne, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { User } from './user.entity';
import { Service } from './service.entity';
import { Home } from './home.entity';
import { TaskAssignment } from './task-assignment.entity';
import { TaskFile } from './task-file.entity';
import { TaskReport } from './task-report.entity';
import { Invoice } from './invoice.entity';
import { TaskTimeline } from './task-timeline.entity';

export enum TaskStatus {
    DRAFT = 'DRAFT',
    REQUESTED = 'REQUESTED',
    AWAITING_CONTRACTOR_PROPOSAL = 'AWAITING_CONTRACTOR_PROPOSAL',
    PROPOSED = 'PROPOSED',
    APPROVED = 'APPROVED',
    SCHEDULED = 'SCHEDULED',
    IN_PROGRESS = 'IN_PROGRESS',
    COMPLETED = 'COMPLETED',
    CANCELLED = 'CANCELLED',
    REJECTED = 'REJECTED',
}

@Entity('tasks')
export class Task {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    clientId: string;

    @Column()
    serviceId: string;

    @Column()
    homeId: string;

    @Column({
        type: 'enum',
        enum: TaskStatus,
        default: TaskStatus.DRAFT,
    })
    status: TaskStatus;

    @Column({ type: 'timestamp', nullable: true })
    preferredStartDate: Date;

    @Column({ type: 'timestamp', nullable: true })
    preferredEndDate: Date;

    @Column({ type: 'timestamp', nullable: true })
    proposedDate: Date;

    @Column({ type: 'time', nullable: true })
    proposedTime: string;

    @Column({ type: 'timestamp', nullable: true })
    approvedDate: Date;

    @Column({ type: 'timestamp', nullable: true })
    completedDate: Date;

    @Column({ type: 'text', nullable: true })
    clientNotes: string;

    @Column({ type: 'text', nullable: true })
    contractorNotes: string;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;

    @ManyToOne(() => User, (user) => user.tasks)
    @JoinColumn({ name: 'clientId' })
    client: User;

    @ManyToOne(() => Service, (service) => service.tasks)
    @JoinColumn({ name: 'serviceId' })
    service: Service;

    @ManyToOne(() => Home)
    @JoinColumn({ name: 'homeId' })
    home: Home;

    @OneToMany(() => TaskAssignment, (assignment) => assignment.task)
    assignments: TaskAssignment[];

    @OneToMany(() => TaskFile, (file) => file.task)
    files: TaskFile[];

    @OneToOne(() => TaskReport, (report) => report.task)
    report: TaskReport;

    @OneToOne(() => Invoice, (invoice) => invoice.task)
    invoice: Invoice;

    @OneToMany(() => TaskTimeline, (timeline) => timeline.task)
    timeline: TaskTimeline[];
}
