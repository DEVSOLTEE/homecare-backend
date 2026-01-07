import { NestFactory } from '@nestjs/core';
import { AppModule } from './src/app.module';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from './src/database/entities/user.entity';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';

async function verifyLogin() {
    console.log('--- Login Verification Diagnostic ---');
    const app = await NestFactory.createApplicationContext(AppModule);
    const userRepository = app.get<Repository<User>>(getRepositoryToken(User));

    try {
        const admin = await userRepository.findOne({ where: { email: 'admin@homecare.com' } });
        if (admin) {
            console.log('Admin user found.');
            const isMatch = await bcrypt.compare('Password123!', admin.password);
            console.log(`Password 'Password123!' match: ${isMatch}`);

            if (!isMatch) {
                console.log('Stored hash:', admin.password);
                const newHash = await bcrypt.hash('Password123!', 10);
                console.log('Reference hash for "Password123!":', newHash);
            }
        } else {
            console.log('Admin user NOT found.');
        }
    } catch (error) {
        console.error('Error:', error.message);
    } finally {
        await app.close();
    }
}

verifyLogin();
