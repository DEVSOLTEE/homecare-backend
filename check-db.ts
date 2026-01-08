
import { NestFactory } from '@nestjs/core';
import { AppModule } from './src/app.module';
import { getEntityManagerToken } from '@nestjs/typeorm';
import { EntityManager } from 'typeorm';

async function checkSchema() {
    const app = await NestFactory.createApplicationContext(AppModule);
    const entityManager = app.get<EntityManager>(getEntityManagerToken());

    try {
        console.log('--- Database Schema Check ---');
        const schema = await entityManager.query(`
            SELECT column_name, data_type, column_default 
            FROM information_schema.columns 
            WHERE table_name = 'users' AND column_name IN ('isApproved', 'isActive');
        `);
        console.log(JSON.stringify(schema, null, 2));

        console.log('\n--- Sample Data Check ---');
        const users = await entityManager.query(`
            SELECT email, role, "isApproved", "isActive" 
            FROM users 
            WHERE role = 'CONTRACTOR' 
            LIMIT 5;
        `);
        console.log(JSON.stringify(users, null, 2));

    } catch (error) {
        console.error('Diagnostic error:', error);
    } finally {
        await app.close();
    }
}

checkSchema();
