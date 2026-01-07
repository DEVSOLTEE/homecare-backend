import { Entity, PrimaryGeneratedColumn, Column, OneToOne, JoinColumn, OneToMany, CreateDateColumn } from 'typeorm';
import { Task } from './task.entity';
import { InvoiceItem } from './invoice-item.entity';

export enum InvoiceStatus {
    PENDING = 'PENDING',
    PAID = 'PAID',
    CANCELLED = 'CANCELLED',
}

@Entity('invoices')
export class Invoice {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    taskId: string;

    @Column()
    clientId: string;

    @Column({ type: 'decimal', precision: 10, scale: 2 })
    totalAmount: number;

    @Column({
        type: 'enum',
        enum: InvoiceStatus,
        default: InvoiceStatus.PENDING,
    })
    status: InvoiceStatus;

    @Column({ type: 'timestamp', nullable: true })
    paidAt: Date;

    @CreateDateColumn()
    createdAt: Date;

    @OneToOne(() => Task, (task) => task.invoice)
    @JoinColumn({ name: 'taskId' })
    task: Task;

    @OneToMany(() => InvoiceItem, (item) => item.invoice)
    items: InvoiceItem[];
}
