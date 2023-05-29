import {UseGuards, Controller, Get, Post, Put,Delete, Param, Body, Res, ValidationPipe, ParseIntPipe, BadRequestException } from '@nestjs/common';
import { ClinicDto } from 'src/clinics/dtos/ClinicDetails.dto';
import { ClinicsService } from 'src/clinics/services/clinics/clinics.service';
import { Response } from 'express';
import { UpdateClinicDto } from 'src/clinics/dtos/updateClinic.dto';
import { JWTAuthGuardAdmin } from 'src/middleware/auth/jwt-auth.guard';
import { filterNameDto } from 'src/doctors/dtos/filterName.dto';

@Controller('clinics')
export class ClinicsController {
    constructor(private clinicSrevice : ClinicsService){}
    ///////////////////////////admin
    @Get()
    async getClinics(){
        const clinics =  await this.clinicSrevice.findClinics()
        return {clinics : clinics}; 
    }
    //filter clinic
    @Post('filter-by-names')
    @UseGuards(JWTAuthGuardAdmin)
    async  filterDoctor(@Body(new ValidationPipe({ whitelist: true })) filterName : filterNameDto){
        return this.clinicSrevice.filterClinicByName(filterName);
    }



    @Get('/location/:clinicId')
    async getLocation(
      @Param('clinicId') clinicId: number,
    ){
        // Check if areaId and specialtyId are numbers
        if (isNaN(+clinicId)) {
          throw new BadRequestException('clinicId must be numbers');
        }
        return  this.clinicSrevice.getLocation(clinicId)
    }

    @Post(':areaId/:specialtyId') 
    @UseGuards(JWTAuthGuardAdmin)
    async createClinic(
      @Param('areaId') areaId: number,
      @Param('specialtyId') specialtyId: number,
      @Body(new ValidationPipe({ whitelist: true })) createSpecialtyDto: ClinicDto)
      {
        ClinicDto.validate(createSpecialtyDto); // Call the validate() method as a static method on CreateWorkTimeDto
        // Check if areaId and specialtyId are numbers
        if (isNaN(+areaId) || isNaN(+specialtyId)) {
          throw new BadRequestException('Area ID and Specialty ID must be numbers');
        }
        await this.clinicSrevice.createClinic(createSpecialtyDto,areaId,specialtyId);
        return {message : 'clinic created successfully'}
    }

    @Delete(':clinicId')
    @UseGuards(JWTAuthGuardAdmin)
    async  deleteClinic(
      @Param('clinicId') 
      clinicId: number,
      ){
         // Check if areaId and specialtyId are numbers
         if (isNaN(+clinicId)) {
          throw new BadRequestException('clinicId must be numbers');
        }
        await  this.clinicSrevice.deleteClinic(clinicId);
        return {message : 'clinic deleted successfully'}
    }

    @Put(':clinicId')
    @UseGuards(JWTAuthGuardAdmin)
    async updateClinic(
      @Param('clinicId') clinicId: number,
      @Body(new ValidationPipe({ whitelist: true })) newData: UpdateClinicDto
    ){
       // Check if areaId and specialtyId are numbers
       if (isNaN(+clinicId)) {
        throw new BadRequestException('clinicId must be numbers');
      }
      await this.clinicSrevice.updateClinic(clinicId, newData);
      return {message : 'clinic updated successfully'}
    }

    //update area
    @Put(':clinicId/:areaId')
    @UseGuards(JWTAuthGuardAdmin)
    async updateClinicArea(
      @Param('clinicId') clinicId: number,
      @Param('areaId') areaId: number
    ){
       // Check if areaId and specialtyId are numbers
       if (isNaN(+areaId) || isNaN(+clinicId)) {
        throw new BadRequestException('Area ID and clinic ID must be numbers');
      }
      await this.clinicSrevice.updateClinicArea(clinicId, areaId);
      return {message : 'clinic area updated successfully'}
    }



    
    //update specialty
    @Put(':clinicId/specialties/:specialtyId')
    @UseGuards(JWTAuthGuardAdmin)
    async updateClinicspecialty(
      @Param('clinicId') clinicId: number,
      @Param('specialtyId') specialtyId: number
    ){
       // Check if areaId and specialtyId are numbers
       if (isNaN(+specialtyId) || isNaN(+clinicId)) {
        throw new BadRequestException('specialty ID and clinic ID must be numbers');
      }
      await this.clinicSrevice.updateClinicSpecialty(clinicId, specialtyId);
      return {message : 'clinic specialty updated successfully'}
    }




      //doctor clinic
      @Post(':clinicId/doctors/:doctorId')
      @UseGuards(JWTAuthGuardAdmin)
      async addDoctorToClinic(
        @Param('clinicId') clinicId: number,
        @Param('doctorId') doctorId: number
              ) {
              // Check if areaId and specialtyId are numbers
            if (isNaN(+doctorId) || isNaN(+clinicId)) {
              throw new BadRequestException('doctor ID and clinic ID must be numbers');
            }
            await this.clinicSrevice.addDoctorToClinic(doctorId,clinicId);
            return {message : 'doctor added to clinic successfully'}
      }
  
      @Delete(':clinicId/doctors/:doctorId')
      @UseGuards(JWTAuthGuardAdmin)
      async deleteDoctorfromInsurance(
        @Param('clinicId') clinicId: number,
        @Param('doctorId') doctorId: number,
      ){
         // Check if areaId and specialtyId are numbers
         if (isNaN(+doctorId) || isNaN(+clinicId)) {
          throw new BadRequestException('doctor ID and clinic ID must be numbers');
        }
        await this.clinicSrevice.removeDoctorFromClinic(doctorId,clinicId);
        return {message : 'doctor added to clinic successfully'}
      }
  
      @Get(':clinicId/doctors')
      @UseGuards(JWTAuthGuardAdmin)
      async getDoctorsForClinic( 
        @Param('clinicId') clinicId: number,
        ){
          // Check if areaId and specialtyId are numbers
          if (isNaN(+clinicId)) {
            throw new BadRequestException('clinicId must be numbers');
          }
          const doctors =  await this.clinicSrevice.findAllDoctorsForClinics(clinicId)
          return {doctors : doctors};
          
      }
      ///////////////////////////////////paitnet
      @Get('patient/:clinicId')
      async getclinicForpatient( 
        @Param('clinicId', new ParseIntPipe()) clinicId: number,
        ){
          // Check if areaId and specialtyId are numbers
         if (isNaN(+clinicId)) {
          throw new BadRequestException('clinicId must be numbers');
        }
          return this.clinicSrevice.getclinicForpatient(clinicId)
      }
}
