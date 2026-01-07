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

    app.enableCors({
        origin: 'http://localhost:3011',
        credentials: true,
    });

    app.useGlobalPipes(new ValidationPipe());

    const port = 3010;
    await app.listen(port);
    console.log(`🚀 Backend server running on http://localhost:${port}`);
}

bootstrap();
