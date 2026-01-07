import { NestFactory } from '@nestjs/core';
import { AppModule } from './src/app.module';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from './src/database/entities/user.entity';
import { Repository } from 'typeorm';
import * as fs from 'fs';
import { join } from 'path';

async function verifyFiles() {
    const app = await NestFactory.createApplicationContext(AppModule);
    const userRepository = app.get<Repository<User>>(getRepositoryToken(User));

    try {
        const contractors = await userRepository.find({ where: { role: 'CONTRACTOR' as any } });
        console.log('--- DB vs Disk Verification ---');
        contractors.forEach(c => {
            console.log(`Email: ${c.email}`);
            console.log(`DB Path: ${c.identificationPath}`);
            if (c.identificationPath) {
                const fullPath = join(process.cwd(), c.identificationPath);
                const exists = fs.existsSync(fullPath);
                console.log(`Disk full path: ${fullPath}`);
                console.log(`File Exists on Disk: ${exists}`);
            }
            console.log('---');
        });

        console.log('\n--- Files in uploads/identifications ---');
        const files = fs.readdirSync(join(process.cwd(), 'uploads/identifications'));
        files.forEach(f => console.log(f));
    } finally {
        await app.close();
    }
}

verifyFiles();
