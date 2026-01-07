import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Service } from '../database/entities/service.entity';
import { Category } from '../database/entities/category.entity';

@Injectable()
export class ServicesService {
    constructor(
        @InjectRepository(Service)
        private serviceRepository: Repository<Service>,
        @InjectRepository(Category)
        private categoryRepository: Repository<Category>,
    ) { }

    async findAll() {
        return this.serviceRepository.find({
            relations: ['category'],
            order: { category: { name: 'ASC' }, name: 'ASC' },
        });
    }

    async findByCategory(categoryId: string) {
        return this.serviceRepository.find({
            where: { categoryId },
            relations: ['category'],
        });
    }

    async findOne(id: string) {
        return this.serviceRepository.findOne({
            where: { id },
            relations: ['category'],
        });
    }

    async findAllCategories() {
        return this.categoryRepository.find({
            relations: ['services'],
        });
    }
}
