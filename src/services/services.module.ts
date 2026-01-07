import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ServicesService } from './services.service';
import { ServicesController } from './services.controller';
import { Service } from '../database/entities/service.entity';
import { Category } from '../database/entities/category.entity';

@Module({
    imports: [TypeOrmModule.forFeature([Service, Category])],
    controllers: [ServicesController],
    providers: [ServicesService],
    exports: [ServicesService],
})
export class ServicesModule { }
