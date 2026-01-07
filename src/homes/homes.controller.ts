import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards, HttpException, HttpStatus } from '@nestjs/common';
import { HomesService } from './homes.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@Controller('homes')
@UseGuards(JwtAuthGuard)
export class HomesController {
    constructor(private homesService: HomesService) { }

    @Post()
    async create(
        @CurrentUser() user: any,
        @Body('address') address: string,
        @Body('city') city: string,
        @Body('state') state: string,
        @Body('zipCode') zipCode: string,
        @Body('isDefault') isDefault: boolean,
        @Body('notes') notes?: string,
    ) {
        try {
            return await this.homesService.create(user.id, address, city, state, zipCode, isDefault, notes);
        } catch (error) {
            throw new HttpException({
                status: HttpStatus.BAD_REQUEST,
                error: 'Failed to create home: ' + (error.message || error),
            }, HttpStatus.BAD_REQUEST);
        }
    }

    @Get()
    async findByUser(@CurrentUser() user: any) {
        return this.homesService.findByUser(user.id);
    }

    @Get(':id')
    async findOne(@Param('id') id: string) {
        return this.homesService.findOne(id);
    }

    @Put(':id')
    async update(@Param('id') id: string, @Body() updates: any) {
        return this.homesService.update(id, updates);
    }

    @Delete(':id')
    async delete(@Param('id') id: string) {
        return this.homesService.delete(id);
    }
}
