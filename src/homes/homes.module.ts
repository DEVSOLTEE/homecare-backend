import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HomesService } from './homes.service';
import { HomesController } from './homes.controller';
import { Home } from '../database/entities/home.entity';

@Module({
    imports: [TypeOrmModule.forFeature([Home])],
    controllers: [HomesController],
    providers: [HomesService],
    exports: [HomesService],
})
export class HomesModule { }
