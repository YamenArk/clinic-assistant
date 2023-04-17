import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, Put, Res } from '@nestjs/common';
import { CreateDoctorDto } from 'src/doctors/dtos/CreateDoctor.dto';
import { UpdateDoctorDto } from 'src/doctors/dtos/UpdateDoctor.dto';
import { filterDocrotsDto } from 'src/doctors/dtos/filterDocrots.dto';
import { DoctorsService } from 'src/doctors/services/doctors/doctors.service';
import { Response } from 'express';

@Controller('doctors')
export class DoctorsController {

    constructor(private doctorSrevice : DoctorsService){}

    @Post()
    login(@Body() createDoctorDto : CreateDoctorDto){
        return this.doctorSrevice.createDoctor(createDoctorDto);
    }

    @Get()
    getDoctors(){
        return this.doctorSrevice.findDoctors();
    }



    @Post()
    createDoctor(@Body() createDoctorDto : CreateDoctorDto){
        return this.doctorSrevice.createDoctor(createDoctorDto);
    }

    @Put(':doctorId')
    async updateDoctor(
        @Param('doctorId') doctorId: number,
        @Body() updateDoctorDto : UpdateDoctorDto,
        @Res() res: Response
        ){
        await this.doctorSrevice.updateDoctor(doctorId,updateDoctorDto);
        return res.status(200).json({message :'doctor updated successfully'});
    }

    //filter
    @Post('filterDocrots')
    filterDocrots(@Body() filterDocrotsDto : filterDocrotsDto){
        return this.doctorSrevice.filterDocrots(filterDocrotsDto);
    }

    //doctor insurances
    @Post(':doctorId/insurances/:insuranceId')
    async addDoctorToInsurance(
      @Param('insuranceId') insuranceId: number,
      @Param('doctorId') doctorId: number,
      @Res() res: Response
    ) {
      await this.doctorSrevice.addDoctorToInsuranceCompany(doctorId,insuranceId);
      return res.status(200).json({message :'doctor added insurances successfully'});
    }

    @Delete(':doctorId/insurances/:insuranceId')
    async deleteDoctorfromInsurance(
      @Param('insuranceId') insuranceId: number,
      @Param('doctorId') doctorId: number,
      @Res() res: Response
    ){
      await this.doctorSrevice.removeDoctorFromInsuranceCompany(doctorId,insuranceId);
      return res.status(200).json({message :'doctor deleted insurances successfully'});
    }


     

    //doctor subSpecialties
    @Post(':doctorId/subSpecialties/:subSpecialtyId')
    async addDoctorToSubSpecialty(
      @Param('subSpecialtyId') insuranceId: number,
      @Param('doctorId') doctorId: number,
      @Res() res: Response
    ){
      await this.doctorSrevice.addDoctorToSubSpecialty(doctorId,insuranceId);
      return res.status(200).json({message :'doctor added subSpecialties successfully'});

    }

    @Delete(':doctorId/subSpecialties/:subSpecialtyId')
    async deleteDoctorfromSubSpecialty(
      @Param('subSpecialtyId') subSpecialtyId: number,
      @Param('doctorId') doctorId: number,
      @Res() res: Response
    ) {
      await this.doctorSrevice.removeDoctorFromSubSpecialty(doctorId,subSpecialtyId);
      return res.status(200).json({message :'doctor deleted subSpecialties successfully'});

    }
}
