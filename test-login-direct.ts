import { NestFactory } from '@nestjs/core';
import { AppModule } from './src/app.module';
import { AuthService } from './src/auth/auth.service';

async function testLoginDirect() {
    console.log('--- Direct AuthService Login Test ---');
    const app = await NestFactory.createApplicationContext(AppModule);
    const authService = app.get<AuthService>(AuthService);

    try {
        const result = await authService.login('admin@homecare.com', 'Password123!');
        console.log('✅ Login SUCCESS');
        console.log('Result:', JSON.stringify(result, null, 2));
    } catch (error) {
        console.error('❌ Login FAILED');
        console.error('Error:', error.message);
    } finally {
        await app.close();
    }
}

testLoginDirect();
