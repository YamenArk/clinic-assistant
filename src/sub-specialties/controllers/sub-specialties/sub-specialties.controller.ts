import { UseGuards,Body, Controller, Delete, Get, Param, Post, Put, Res, ValidationPipe } from '@nestjs/common';
import { CreateSubSpecialtyDto } from 'src/sub-specialties/dtos/CreateSubSpecialty.dto';
import { SubSpecialtiesService } from 'src/sub-specialties/services/sub-specialties/sub-specialties.service';
import { SubSpecialty } from 'src/typeorm/entities/sub-specialty';
import { Response } from 'express';
import { JWTAuthGuardAdmin } from 'src/middleware/auth/jwt-auth.guard';

@Controller('subSpecialties')
export class SubSpecialtiesController {
    constructor(private subSpecialtySrevice : SubSpecialtiesService){}

    ///////////////////////////////////admin
    @Post(':specialtyId')
    @UseGuards(JWTAuthGuardAdmin)
    createSubSpecialty(
        @Param('specialtyId') specialtyId: number,
        @Body(new ValidationPipe({ whitelist: true })) createSubSpecialtyDto: CreateSubSpecialtyDto) 
        : Promise<SubSpecialty> {
        return this.subSpecialtySrevice.createSubSpecialty(specialtyId,createSubSpecialtyDto);
    }
    @Delete(':subSpecialtyId')
    @UseGuards(JWTAuthGuardAdmin)
    async  deletesubSpecialty(
      @Param('subSpecialtyId') 
      subSpecialtyId: number      ){
        await  this.subSpecialtySrevice.deleteSubSpecialty(subSpecialtyId);
      return {message : 'subSpecialty deleted  successfully'}
    }


    @Put(':subSpecialtyId')
    @UseGuards(JWTAuthGuardAdmin)
    async updateSubSpecialty(
      @Param('subSpecialtyId') subSpecialtyId: number,
      @Body(new ValidationPipe({ whitelist: true })) newData: CreateSubSpecialtyDto,
    ) {
      await this.subSpecialtySrevice.updateSubSpecialty(subSpecialtyId, newData);
      return {message : 'subSpecialty updated  successfully'}
    }
}
