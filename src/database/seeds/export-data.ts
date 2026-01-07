import { DataSource } from 'typeorm';
import * as fs from 'fs';
import * as path from 'path';
import { User } from '../entities/user.entity';
import { Category } from '../entities/category.entity';
import { Service } from '../entities/service.entity';
import { Home } from '../entities/home.entity';
import { Task } from '../entities/task.entity';
import { TaskAssignment } from '../entities/task-assignment.entity';
import { Invoice } from '../entities/invoice.entity';
import { InvoiceItem } from '../entities/invoice-item.entity';
import { TaskTimeline } from '../entities/task-timeline.entity';
import { TaskFile } from '../entities/task-file.entity';
import { TaskReport } from '../entities/task-report.entity';

const dataSource = new DataSource({
    type: 'postgres',
    host: 'localhost',
    port: 5432,
    username: 'postgres',
    password: 'postgres',
    database: 'homecare_db',
    entities: [User, Category, Service, Home, Task, TaskAssignment, Invoice, InvoiceItem, TaskTimeline, TaskFile, TaskReport],
});

async function exportData() {
    try {
        await dataSource.initialize();
        console.log('📡 Connected to database for export...');

        const userRepo = dataSource.getRepository(User);
        const users = await userRepo.find({
            select: ['id', 'email', 'firstName', 'lastName', 'phone', 'role', 'isActive', 'createdAt']
        });

        const exportPath = path.join(__dirname, '../../../../database_export.json');
        fs.writeFileSync(exportPath, JSON.stringify(users, null, 2));

        console.log(`✅ Success! Data exported to: ${exportPath}`);
        await dataSource.destroy();
    } catch (error) {
        console.error('❌ Export failed:', error);
    }
}

exportData();
