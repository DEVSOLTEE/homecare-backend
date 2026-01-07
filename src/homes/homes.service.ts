import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Home } from '../database/entities/home.entity';

@Injectable()
export class HomesService {
    constructor(
        @InjectRepository(Home)
        private homeRepository: Repository<Home>,
    ) { }

    async create(userId: string, address: string, city: string, state: string, zipCode: string, isDefault: boolean, notes?: string) {
        const home = this.homeRepository.create({
            userId,
            address,
            city,
            state,
            zipCode,
            isDefault,
            notes,
        });

        return this.homeRepository.save(home);
    }

    async findByUser(userId: string) {
        return this.homeRepository.find({
            where: { userId },
            order: { isDefault: 'DESC', createdAt: 'DESC' },
        });
    }

    async findOne(id: string) {
        return this.homeRepository.findOne({ where: { id } });
    }

    async update(id: string, updates: Partial<Home>) {
        await this.homeRepository.update(id, updates);
        return this.findOne(id);
    }

    async delete(id: string) {
        await this.homeRepository.delete(id);
    }
}
