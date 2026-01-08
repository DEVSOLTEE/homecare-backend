import { Injectable, UnauthorizedException, ConflictException, OnModuleInit } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User, UserRole } from '../database/entities/user.entity';
import { Category } from '../database/entities/category.entity';
import { Service } from '../database/entities/service.entity';

@Injectable()
export class AuthService {
    constructor(
        @InjectRepository(User)
        private userRepository: Repository<User>,
        @InjectRepository(Category)
        private categoryRepository: Repository<Category>,
        @InjectRepository(Service)
        private serviceRepository: Repository<Service>,
        private jwtService: JwtService,
    ) { }

    async onModuleInit() {
        console.log('🔍 Ensuring demo accounts exist...');
        await this.seedDemoData();
    }

    private async seedDemoData() {
        try {
            const hashedPassword = await bcrypt.hash('Password123!', 10);

            // Robust seeding: Upsert users
            const users = [
                {
                    email: 'admin@homecare.com',
                    password: hashedPassword,
                    firstName: 'Admin',
                    lastName: 'User',
                    role: UserRole.ADMIN,
                    phone: '555-0100',
                    isApproved: true,
                    isActive: true,
                },
                {
                    email: 'client@homecare.com',
                    password: hashedPassword,
                    firstName: 'John',
                    lastName: 'Doe',
                    role: UserRole.CLIENT,
                    phone: '555-0101',
                    isApproved: true,
                    isActive: true,
                },
                {
                    email: 'contractor@homecare.com',
                    password: hashedPassword,
                    firstName: 'Mike',
                    lastName: 'Smith',
                    role: UserRole.CONTRACTOR,
                    phone: '555-0102',
                    isApproved: true,
                    isActive: true,
                },
            ];

            for (const userData of users) {
                let user = await this.userRepository.findOne({ where: { email: userData.email } });
                if (user) {
                    console.log(`[SEED] Syncing existing demo user: ${userData.email}`);
                    const updatedUser = Object.assign(user, userData);
                    await this.userRepository.save(updatedUser);

                    // Verify immediately
                    const verify = await this.userRepository.findOne({ where: { email: userData.email } });
                    console.log(`[SEED] ${userData.email} verified in DB -> isApproved: ${verify?.isApproved}, isActive: ${verify?.isActive}`);
                } else {
                    console.log(`[SEED] Creating new demo user: ${userData.email}`);
                    user = this.userRepository.create(userData);
                    await this.userRepository.save(user);
                }
            }
            console.log('✅ Demo users ensured');

            // Seed Categories (Upsert)
            const categories = [
                {
                    name: 'Standard Services',
                    description: 'Regular maintenance services',
                    icon: 'wrench',
                },
                {
                    name: 'Home Maintenance',
                    description: 'General home upkeep and improvements',
                    icon: 'home',
                }
            ];

            const categoryMap = new Map();
            for (const catData of categories) {
                let cat = await this.categoryRepository.findOne({ where: { name: catData.name } });
                if (cat) {
                    Object.assign(cat, catData);
                } else {
                    cat = this.categoryRepository.create(catData);
                }
                cat = await this.categoryRepository.save(cat);
                categoryMap.set(catData.name, cat.id);
            }
            console.log('✅ Categories ensured');

            // Seed/Update Services
            const services = [
                {
                    name: 'AC Maintenance',
                    categoryId: categoryMap.get('Standard Services'),
                    description: 'Complete air conditioning system inspection, cleaning, and maintenance',
                    estimatedDuration: 120,
                    basePrice: 150,
                },
                {
                    name: 'Water Filter Maintenance',
                    categoryId: categoryMap.get('Standard Services'),
                    description: 'Filter replacement and water quality testing',
                    estimatedDuration: 60,
                    basePrice: 75,
                },
                {
                    name: 'General Upkeep',
                    categoryId: categoryMap.get('Home Maintenance'),
                    description: 'Minor repairs, touch-ups, and general maintenance',
                    estimatedDuration: 120,
                    basePrice: 100,
                },
            ];

            for (const serviceData of services) {
                let service = await this.serviceRepository.findOne({ where: { name: serviceData.name } });
                if (service) {
                    Object.assign(service, serviceData);
                } else {
                    service = this.serviceRepository.create(serviceData);
                }
                await this.serviceRepository.save(service);
            }
            console.log('✅ Services ensured');
            console.log('🎉 Production data sync completed!');
        } catch (error) {
            console.error('❌ Data sync failed:', error);
        }
    }

    async signUp(
        email: string,
        password: string,
        firstName: string,
        lastName: string,
        role: UserRole = UserRole.CLIENT,
        phone?: string,
        identificationPath?: string,
    ) {
        const existingUser = await this.userRepository.findOne({ where: { email } });
        if (existingUser) {
            throw new ConflictException('Email already exists');
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const user = this.userRepository.create({
            email,
            password: hashedPassword,
            firstName,
            lastName,
            role,
            phone,
            isApproved: role !== UserRole.CONTRACTOR,
            identificationPath,
        });

        await this.userRepository.save(user);

        const { password: _, ...result } = user;
        return result;
    }

    async login(email: string, password: string) {
        const user = await this.userRepository.findOne({ where: { email } });
        if (!user) {
            throw new UnauthorizedException('Invalid credentials');
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            throw new UnauthorizedException('Invalid credentials');
        }

        if (!user.isActive) {
            throw new UnauthorizedException('Account is deactivated');
        }

        if (!user.isApproved) {
            throw new UnauthorizedException('Account is pending approval');
        }

        const payload = { sub: user.id, email: user.email, role: user.role };
        const token = this.jwtService.sign(payload);

        const { password: _, ...userWithoutPassword } = user;

        return {
            access_token: token,
            user: userWithoutPassword,
        };
    }

    async validateUser(userId: string) {
        console.log(`Validating user ${userId}`);
        const user = await this.userRepository.findOne({ where: { id: userId } });
        if (!user) {
            console.error(`User ${userId} not found in database`);
            return null;
        }
        if (!user.isActive) {
            console.error(`User ${userId} is not active`);
            return null;
        }
        if (!user.isApproved) {
            console.error(`User ${userId} is not approved`);
            return null;
        }
        const { password: _, ...result } = user;
        return result;
    }

    async updateProfile(
        userId: string,
        data: { firstName?: string; lastName?: string; phone?: string }
    ) {
        console.log(`Updating profile for user ${userId}:`, data);
        const user = await this.userRepository.findOne({ where: { id: userId } });
        if (!user) {
            console.error(`User ${userId} not found for profile update`);
            return null;
        }

        Object.assign(user, data);
        await this.userRepository.save(user);
        console.log(`Profile updated for ${userId}`);
        return this.validateUser(userId);
    }

    async updateAvatar(userId: string, avatarUrl: string) {
        console.log(`Updating avatar for user ${userId}: ${avatarUrl}`);
        const user = await this.userRepository.findOne({ where: { id: userId } });
        if (!user) {
            console.error(`User ${userId} not found for avatar update`);
            return null;
        }

        user.avatarUrl = avatarUrl;
        await this.userRepository.save(user);
        console.log(`Avatar updated in DB for ${userId}`);
        const updated = await this.validateUser(userId);
        console.log('Returning updated user:', updated);
        return updated;
    }
}
