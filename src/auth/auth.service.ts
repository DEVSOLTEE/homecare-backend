import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User, UserRole } from '../database/entities/user.entity';

@Injectable()
export class AuthService {
    constructor(
        @InjectRepository(User)
        private userRepository: Repository<User>,
        private jwtService: JwtService,
    ) { }

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
