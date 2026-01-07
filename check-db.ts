import { NestFactory } from '@nestjs/core';
import { AppModule } from './src/app.module';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from './src/database/entities/user.entity';
import { Repository } from 'typeorm';

async function checkUser() {
    console.log('--- Database Diagnostic ---');
    const app = await NestFactory.createApplicationContext(AppModule);
    const userRepository = app.get<Repository<User>>(getRepositoryToken(User));

    try {
        const users = await userRepository.find();
        console.log(`Found ${users.length} users in database.`);

        const admin = await userRepository.findOne({ where: { email: 'admin@homecare.com' } });
        if (admin) {
            console.log('✅ Admin user found:');
            console.log(`   ID: ${admin.id}`);
            console.log(`   Role: ${admin.role}`);
            console.log(`   Active: ${admin.isActive}`);
            console.log(`   Approved: ${admin.isApproved}`);
        } else {
            console.log('❌ Admin user NOT found.');
        }

        const ant = await userRepository.findOne({ where: { email: 'ant@gmail.com' } });
        if (ant) {
            console.log('✅ ant@gmail.com found.');
        }

    } catch (error) {
        console.error('❌ Database connection error:', error.message);
    } finally {
        await app.close();
    }
}

checkUser();
