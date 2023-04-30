import { BadRequestException, Body, Controller, Delete, Get, Param, Post, Put, Res, UploadedFile, UseInterceptors, UsePipes, ValidationPipe } from '@nestjs/common';
import { CreateDoctorDto } from 'src/doctors/dtos/CreateDoctor.dto';
import { UpdateDoctorDto } from 'src/doctors/dtos/UpdateDoctor.dto';
import { filterDocrotsDto } from 'src/doctors/dtos/filterDocrots.dto';
import { DoctorsService } from 'src/doctors/services/doctors/doctors.service';
import { Response } from 'express';
import { FileInterceptor } from '@nestjs/platform-express';
import { UpdateDoctorParams } from 'src/utils/types';
import { validate } from 'class-validator';

@Controller('doctors')
export class DoctorsController {

    constructor(private doctorSrevice : DoctorsService){}





    /////////////////////////////////admin

    //create doctor
    @Post()
    // @UsePipes(new ValidationPipe({ forbidNonWhitelisted: true }))
    async  createDoctor(@Body() createDoctorDto : CreateDoctorDto){
      // const errors = await validate(createDoctorDto);
      // console.log(errors)
      // if (errors.length > 0) {
      //   throw new BadRequestException(errors);
      // }
        await this.doctorSrevice.createDoctor(createDoctorDto);
        return{message : "doctor created successfully"}
    }

    //get doctors
    @Get(':type')//type 1 active doctors 2 not active 2 all
    async getDoctors(@Param('type') type?: number) {
      return  this.doctorSrevice.findDoctors(type);
    
    }







   

    @Put(':doctorId')
    @UseInterceptors(FileInterceptor('file'))
    async updateDoctor(
      @Param('doctorId') doctorId: number,
      @Res() res: Response,
      @Body() updateDoctorDto: UpdateDoctorParams,
      @UploadedFile() file: Express.Multer.File,
    ) {
      await this.doctorSrevice.updateDoctor(doctorId,updateDoctorDto,file);
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

    
    @Post('send-email')
    async sendResetEmail(@Body('username') username: string): Promise<void> {
      const code = await this.doctorSrevice.sendResetEmail(username);
    }
  
    @Post('reset-password')
    async resetPassword(
      @Body('doctorId') doctorId: number,
      @Body('code') code: number,
      @Body('newPassword') newPassword: string,
    ): Promise<void> {
      await this.doctorSrevice.resetPassword(doctorId, code, newPassword);
    }



    @Get('withInformation')
     async getDoctorsWithInformation(){
        const doctors = await this.doctorSrevice.getDoctorsWithAllTheirInformation();
        return {doctors : doctors}
    }
}
