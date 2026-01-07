import { NestFactory } from '@nestjs/core';
import { AppModule } from './src/app.module';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from './src/database/entities/user.entity';
import { Repository } from 'typeorm';

async function listUsers() {
    const app = await NestFactory.createApplicationContext(AppModule);
    const userRepository = app.get<Repository<User>>(getRepositoryToken(User));

    try {
        const users = await userRepository.find();
        console.log('--- User List ---');
        users.forEach(u => console.log(`- ${u.email} (${u.role}) [Active: ${u.isActive}, Approved: ${u.isApproved}]`));
    } finally {
        await app.close();
    }
}

listUsers();
