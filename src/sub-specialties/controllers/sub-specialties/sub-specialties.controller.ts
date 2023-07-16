import { UseGuards,Body, Controller, Delete, Get, Param, Post, Put, Res, ValidationPipe, BadRequestException } from '@nestjs/common';
import { CreateSubSpecialtyDto } from 'src/sub-specialties/dtos/CreateSubSpecialty.dto';
import { SubSpecialtiesService } from 'src/sub-specialties/services/sub-specialties/sub-specialties.service';
import { SubSpecialty } from 'src/typeorm/entities/sub-specialty';
import { Response } from 'express';
import {  JWTAuthGuardDoctorAdmin } from 'src/middleware/auth/jwt-auth.guard';
import { filterNameDto } from 'src/sub-specialties/dtos/filterName.dto';

@Controller('subSpecialties')
export class SubSpecialtiesController {
    constructor(private subSpecialtySrevice : SubSpecialtiesService){}

    ///////////////////////////////////admin
    @Post(':specialtyId')
    @UseGuards(JWTAuthGuardDoctorAdmin)
    createSubSpecialty(
        @Param('specialtyId') specialtyId: number,
        @Body(new ValidationPipe({ whitelist: true })) createSubSpecialtyDto: CreateSubSpecialtyDto) 
        : Promise<SubSpecialty> {
        // Check if specialtyId and specialtyId are numbers
        if (isNaN(+specialtyId)) {
          throw new BadRequestException('specialtyId must be numbers');
        }
        return this.subSpecialtySrevice.createSubSpecialty(specialtyId,createSubSpecialtyDto);
    }

      //filter doctor
      @Post('filter-by-names/:specialtyId')
      @UseGuards(JWTAuthGuardDoctorAdmin)
      async  filtesubSpecialties(
        @Param('specialtyId') specialtyId: number,
        @Body(new ValidationPipe({ whitelist: true })) filterName : filterNameDto){
        // Check if specialtyId and specialtyId are numbers
        if (isNaN(+specialtyId)) {
          throw new BadRequestException('specialtyId must be numbers');
        }
          return this.subSpecialtySrevice.filtersubSpecialtiesByName(filterName,specialtyId);
      }
  



    @Delete(':subSpecialtyId')
    @UseGuards(JWTAuthGuardDoctorAdmin)
    async  deletesubSpecialty(
      @Param('subSpecialtyId') 
      subSpecialtyId: number      ){
        // Check if subSpecialtyId and specialtyId are numbers
        if (isNaN(+subSpecialtyId)) {
          throw new BadRequestException('subSpecialtyId must be numbers');
        }
        await  this.subSpecialtySrevice.deleteSubSpecialty(subSpecialtyId);
      return {message : 'subSpecialty deleted  successfully'}
    }


    @Put(':subSpecialtyId')
    @UseGuards(JWTAuthGuardDoctorAdmin)
    async updateSubSpecialty(
      @Param('subSpecialtyId') subSpecialtyId: number,
      @Body(new ValidationPipe({ whitelist: true })) newData: CreateSubSpecialtyDto,
    ) {
      // Check if subSpecialtyId and specialtyId are numbers
      if (isNaN(+subSpecialtyId)) {
        throw new BadRequestException('specialtyId must be numbers');
      }
      await this.subSpecialtySrevice.updateSubSpecialty(subSpecialtyId, newData);
      return {message : 'subSpecialty updated  successfully'}
    }
}
