import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';

async function bootstrap() {
    const app = await NestFactory.create<NestExpressApplication>(AppModule);
    const express = require('express');
    const uploadsPath = join(process.cwd(), 'uploads');

    app.use('/uploads', express.static(uploadsPath));
    console.log(`[Static] Express serving /uploads from: ${uploadsPath}`);

    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3011';
    app.enableCors({
        origin: [frontendUrl, 'http://localhost:3011'],
        methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
        credentials: true,
    });

    app.useGlobalPipes(new ValidationPipe());

    const port = process.env.PORT || 3010;
    await app.listen(port);
    console.log(`🚀 Backend server running on port ${port}`);
}

bootstrap();
