import {UseGuards, Body, Controller, Delete, Get, Param, Post, Put, Res, ValidationPipe, BadRequestException, Query } from '@nestjs/common';
import { SpecialtyDto } from 'src/specialties/dtos/Specialty.dto';
import { SpecialtiesService } from 'src/specialties/services/specialties/specialties.service';
import { JWTAuthGuardDoctorAdmin } from 'src/middleware/auth/jwt-auth.guard';
import { filterNameDto } from 'src/specialties/dtos/filterName.dto';

@Controller('specialties')
export class SpecialtiesController {
    constructor(private specialtySrevice : SpecialtiesService){}


    //////////////////////////////////admin

    @Post()
    @UseGuards(JWTAuthGuardDoctorAdmin)
    async createSpecialty(@Body(new ValidationPipe({ whitelist: true })) createSpecialtyDto: SpecialtyDto) {
        await this.specialtySrevice.createspecialty(createSpecialtyDto);
        return { message : 'Specialty created sucessfully'}
    }


      //filter Specialty
      @Post('filter-by-names')
      @UseGuards(JWTAuthGuardDoctorAdmin)
      async  filterSpecialty(@Body(new ValidationPipe({ whitelist: true })) filterName : filterNameDto){
          return this.specialtySrevice.filterSpecialtyByName(filterName);
      }


    @Delete(':specialtyId')
    @UseGuards(JWTAuthGuardDoctorAdmin)
    async  deletespecialty(
      @Param('specialtyId') specialtyId: number
      ) {
        // Check if specialtyId and specialtyId are numbers
        if (isNaN(+specialtyId)) {
          throw new BadRequestException('specialtyId must be numbers');
        }
        await  this.specialtySrevice.deletespecialty(specialtyId);
         return {message : 'specialty deleted successfully'}
      } 

    @Put(':specialtyId')
    @UseGuards(JWTAuthGuardDoctorAdmin)
    async updatespecialty(
      @Param('specialtyId') specialtyId: number,
      @Body(new ValidationPipe({ whitelist: true })) newData: SpecialtyDto,
    ) {
      // Check if specialtyId and specialtyId are numbers
      if (isNaN(+specialtyId)) {
        throw new BadRequestException('specialtyId must be numbers');
      }
      await this.specialtySrevice.updatespecialty(+specialtyId, newData);
      return {message : 'specialty updated successfully'}
    }



    //////////////////////////////////
    @Get()
    @UseGuards(JWTAuthGuardDoctorAdmin)
    async getSpecialties(
      @Query('page') page: number ,
      @Query('perPage') perPage: number 
    ) {
      return await this.specialtySrevice.findSpecialties(page, perPage);
      // return result;
    }
    


    @Get(':specialtyId/subSpecialties')
    @UseGuards(JWTAuthGuardDoctorAdmin)
    async findAllSubsByspecialty(@Param('specialtyId') specialtyId: number) {
      // Check if specialtyId and specialtyId are numbers
      if (isNaN(+specialtyId)) {
        throw new BadRequestException('specialtyId must be numbers');
      }
      const subSpecialties = await this.specialtySrevice.findAllSubsByspecialty(specialtyId);
      return {subSpecialties : subSpecialties}
    }
    //////////////////////////////////////////////////



    


    @Get('subspecialties')
    async getSpecialtiesWithSubSpecialties(){
        const specialties = await this.specialtySrevice.getAllSpecialtiesWithSubSpecialties();
        return {specialties : specialties};
    }

  
    
   
  }
