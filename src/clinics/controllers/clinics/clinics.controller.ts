import {UseGuards, Controller, Get, Post, Put,Delete, Param, Body, Res, ValidationPipe } from '@nestjs/common';
import { ClinicDto } from 'src/clinics/dtos/ClinicDetails.dto';
import { ClinicsService } from 'src/clinics/services/clinics/clinics.service';
import { Response } from 'express';
import { UpdateClinicDto } from 'src/clinics/dtos/updateClinic.dto';
import { JWTAuthGuardAdmin } from 'src/middleware/auth/jwt-auth.guard';

@Controller('clinics')
export class ClinicsController {
    constructor(private clinicSrevice : ClinicsService){}
    ///////////////////////////admin
    @Get()
    async getClinics(){
        const clinics =  await this.clinicSrevice.findClinics()
        return {clinics : clinics}; 
    }

    @Get('/location/:clinicId')
    async getLocation(
      @Param('clinicId') clinicId: number,
    ){
        return  this.clinicSrevice.getLocation(clinicId)
    }

    @Post(':areaId') 
    @UseGuards(JWTAuthGuardAdmin)
    async createClinic(
      @Param('areaId') areaId: number,
      @Body(new ValidationPipe({ whitelist: true })) createSpecialtyDto: ClinicDto)
      {
        await this.clinicSrevice.createClinic(createSpecialtyDto,areaId);
        return {message : 'clinic created successfully'}
    }

    @Delete(':clinicId')
    @UseGuards(JWTAuthGuardAdmin)
    async  deleteClinic(
      @Param('clinicId') 
      clinicId: number,
      ){
        await  this.clinicSrevice.deleteClinic(clinicId);
        return {message : 'clinic deleted successfully'}
    }

    @Put(':clinicId')
    @UseGuards(JWTAuthGuardAdmin)
    async updateClinic(
      @Param('clinicId') clinicId: number,
      @Body(new ValidationPipe({ whitelist: true })) newData: UpdateClinicDto
    ){
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
      await this.clinicSrevice.updateClinicArea(clinicId, areaId);
      return {message : 'clinic area updated successfully'}
    }

      //doctor clinic
      @Post(':clinicId/doctors/:doctorId')
      @UseGuards(JWTAuthGuardAdmin)
      async addDoctorToClinic(
        @Param('clinicId') clinicId: number,
        @Param('doctorId') doctorId: number
              ) {
        await this.clinicSrevice.addDoctorToClinic(doctorId,clinicId);
        return {message : 'doctor added to clinic successfully'}
      }
  
      @Delete(':clinicId/doctors/:doctorId')
      @UseGuards(JWTAuthGuardAdmin)
      async deleteDoctorfromInsurance(
        @Param('clinicId') clinicId: number,
        @Param('doctorId') doctorId: number,
      ){
        await this.clinicSrevice.removeDoctorFromClinic(doctorId,clinicId);
        return {message : 'doctor added to clinic successfully'}
      }
  
      @Get(':clinicId/doctors')
      @UseGuards(JWTAuthGuardAdmin)
      async getDoctorsForClinic( 
        @Param('clinicId') clinicId: number,
        ){
          const doctors =  await this.clinicSrevice.findAllDoctorsForClinics(clinicId)
          return {doctors : doctors};
      }
}
