import { Controller, Post, Body, Get, UseGuards, UseInterceptors, UploadedFile, BadRequestException } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { CurrentUser } from './decorators/current-user.decorator';
import { UserRole } from '../database/entities/user.entity';

@Controller('auth')
export class AuthController {
    constructor(private authService: AuthService) { }

    @Post('signup')
    async signUp(
        @Body('email') email: string,
        @Body('password') password: string,
        @Body('firstName') firstName: string,
        @Body('lastName') lastName: string,
        @Body('role') role: UserRole,
        @Body('phone') phone?: string,
    ) {
        return this.authService.signUp(email, password, firstName, lastName, role, phone);
    }

    @Post('contractor-signup')
    @UseInterceptors(FileInterceptor('identification', {
        storage: diskStorage({
            destination: './uploads/identifications',
            filename: (req, file, cb) => {
                const randomName = Array(32).fill(null).map(() => (Math.round(Math.random() * 16)).toString(16)).join('');
                return cb(null, `${randomName}${extname(file.originalname)}`);
            },
        }),
        fileFilter: (req, file, cb) => {
            const fs = require('fs');
            const logPath = './upload_debug.txt';
            fs.appendFileSync(logPath, `[${new Date().toISOString()}] Checking file: ${file.originalname}, Mimetype: ${file.mimetype}\n`);

            if (file.mimetype.match(/\/(jpg|jpeg|png)$/i)) {
                fs.appendFileSync(logPath, `[${new Date().toISOString()}] -> ACCEPTED\n`);
                cb(null, true);
            } else {
                fs.appendFileSync(logPath, `[${new Date().toISOString()}] -> REJECTED (Invalid Type)\n`);
                cb(new BadRequestException('Only JPG, JPEG, and PNG files are allowed!'), false);
            }
        }
    }))
    async contractorSignUp(
        @Body('email') email: string,
        @Body('password') password: string,
        @Body('firstName') firstName: string,
        @Body('lastName') lastName: string,
        @UploadedFile() file: Express.Multer.File,
        @Body('phone') phone?: string,
    ) {
        console.log('Contractor Signup Request:', { email, firstName, lastName });
        console.log('Uploaded File:', file);

        if (!file) {
            throw new BadRequestException('Identification document is mandatory for contractor signup.');
        }

        const identificationPath = `/uploads/identifications/${file.filename}`;
        return this.authService.signUp(email, password, firstName, lastName, UserRole.CONTRACTOR, phone, identificationPath);
    }

    @Post('login')
    async login(
        @Body('email') email: string,
        @Body('password') password: string,
    ) {
        return this.authService.login(email, password);
    }

    @Get('me')
    @UseGuards(JwtAuthGuard)
    async getMe(@CurrentUser() user: any) {
        return user;
    }

    @Post('profile')
    @UseGuards(JwtAuthGuard)
    async updateProfile(
        @CurrentUser() user: any,
        @Body() data: { firstName?: string; lastName?: string; phone?: string }
    ) {
        return this.authService.updateProfile(user.id, data);
    }

    @Post('avatar')
    @UseGuards(JwtAuthGuard)
    @UseInterceptors(FileInterceptor('file', {
        storage: diskStorage({
            destination: './uploads',
            filename: (req, file, cb) => {
                const randomName = Array(32).fill(null).map(() => (Math.round(Math.random() * 16)).toString(16)).join('');
                return cb(null, `${randomName}${extname(file.originalname)}`);
            },
        }),
    }))
    async uploadAvatar(@CurrentUser() user: any, @UploadedFile() file: Express.Multer.File) {
        const avatarUrl = `/uploads/${file.filename}`;
        return this.authService.updateAvatar(user.id, avatarUrl);
    }
}
