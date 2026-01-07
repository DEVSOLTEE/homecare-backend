import { DataSource } from 'typeorm';
import { User } from './database/entities/user.entity';
import { Home } from './database/entities/home.entity';
import { Category } from './database/entities/category.entity';
import { Service } from './database/entities/service.entity';
import { Task } from './database/entities/task.entity';
import { TaskAssignment } from './database/entities/task-assignment.entity';
import { TaskFile } from './database/entities/task-file.entity';
import { TaskReport } from './database/entities/task-report.entity';
import { Invoice } from './database/entities/invoice.entity';
import { InvoiceItem } from './database/entities/invoice-item.entity';
import { TaskTimeline } from './database/entities/task-timeline.entity';
import { ConfigService } from '@nestjs/config';
import { config } from 'dotenv';
import * as path from 'path';

// Load .env
config({ path: path.join(__dirname, '..', '.env') });

const AppDataSource = new DataSource({
    type: 'postgres',
    host: process.env.DATABASE_HOST || 'localhost',
    port: parseInt(process.env.DATABASE_PORT || '5432'),
    username: process.env.DATABASE_USER || 'postgres',
    password: process.env.DATABASE_PASSWORD || 'postgres',
    database: process.env.DATABASE_NAME || 'homecare_db',
    entities: [
        User, Home, Category, Service, Task, TaskAssignment,
        TaskFile, TaskReport, Invoice, InvoiceItem, TaskTimeline
    ],
    synchronize: false,
});

async function diagnose() {
    console.log('------------------------------------------------');
    console.log('DIAGNOSTICS');
    console.log('------------------------------------------------');

    try {
        console.log(`Attempting to connect to database '${AppDataSource.options.database}'...`);
        await AppDataSource.initialize();
        console.log('✅ Database connection SUCCESSFUL');

        const userRepo = AppDataSource.getRepository(User);
        const count = await userRepo.count();
        console.log(`✅ Found ${count} users in the database.`);

        if (count === 0) {
            console.log('❌ PROBLEM: The database is EMPTY. You need to run the seed script.');
            process.exit(1);
        } else {
            const admin = await userRepo.findOne({ where: { email: 'client@homecare.com' } });
            if (admin) {
                console.log('✅ Client account exists.');
                console.log('   Email: client@homecare.com');
                console.log('   Pass:  Password123!');
            } else {
                console.log('❌ PROBLEM: Client account missing.');
            }
        }

        console.log('------------------------------------------------');
        console.log('STATUS: READY FOR LOGIN');
        process.exit(0);

    } catch (error) {
        console.log('❌ CONNECTION FAILED');
        console.error(error);
        process.exit(1);
    }
}

diagnose();
