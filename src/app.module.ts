import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { TasksModule } from './tasks/tasks.module';
import { ServicesModule } from './services/services.module';
import { HomesModule } from './homes/homes.module';
import { AdminModule } from './admin/admin.module';
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

@Module({
    controllers: [AppController],
    imports: [
        ConfigModule.forRoot({
            isGlobal: true,
        }),
        TypeOrmModule.forRootAsync({
            imports: [ConfigModule],
            useFactory: (configService: ConfigService) => {
                const dbUrl = configService.get<string>('DATABASE_URL');

                if (dbUrl) {
                    console.log('📦 Using DATABASE_URL for connection');
                    return {
                        type: 'postgres',
                        url: dbUrl,
                        entities: [User, Home, Category, Service, Task, TaskAssignment, TaskFile, TaskReport, Invoice, InvoiceItem, TaskTimeline],
                        synchronize: true,
                        ssl: { rejectUnauthorized: false },
                    };
                }

                console.log('📦 Using individual DATABASE variables for connection');
                return {
                    type: 'postgres',
                    host: configService.get<string>('DATABASE_HOST'),
                    port: +configService.get<number>('DATABASE_PORT'),
                    username: configService.get<string>('DATABASE_USER'),
                    password: configService.get<string>('DATABASE_PASSWORD'),
                    database: configService.get<string>('DATABASE_NAME'),
                    entities: [User, Home, Category, Service, Task, TaskAssignment, TaskFile, TaskReport, Invoice, InvoiceItem, TaskTimeline],
                    synchronize: true,
                    ssl: { rejectUnauthorized: false },
                };
            },
            inject: [ConfigService],
        }),
        AuthModule,
        TasksModule,
        ServicesModule,
        HomesModule,
        AdminModule,
    ],
})
export class AppModule { }
