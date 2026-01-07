import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { ServicesService } from './services.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('services')
@UseGuards(JwtAuthGuard)
export class ServicesController {
    constructor(private servicesService: ServicesService) { }

    @Get()
    async findAll() {
        return this.servicesService.findAll();
    }

    @Get('categories')
    async findAllCategories() {
        return this.servicesService.findAllCategories();
    }

    @Get('category/:categoryId')
    async findByCategory(@Param('categoryId') categoryId: string) {
        return this.servicesService.findByCategory(categoryId);
    }

    @Get(':id')
    async findOne(@Param('id') id: string) {
        return this.servicesService.findOne(id);
    }
}
