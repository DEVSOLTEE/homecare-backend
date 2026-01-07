import { NestFactory } from '@nestjs/core';
import { AppModule } from './src/app.module';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from './src/database/entities/user.entity';
import { Repository } from 'typeorm';

async function checkPaths() {
    const app = await NestFactory.createApplicationContext(AppModule);
    const userRepository = app.get<Repository<User>>(getRepositoryToken(User));

    try {
        const contractors = await userRepository.find({ where: { role: 'CONTRACTOR' as any } });
        console.log('--- Contractor Paths ---');
        contractors.forEach(c => {
            console.log(`Email: ${c.email}`);
            console.log(`Path: ${c.identificationPath}`);
            console.log('---');
        });
    } finally {
        await app.close();
    }
}

checkPaths();
