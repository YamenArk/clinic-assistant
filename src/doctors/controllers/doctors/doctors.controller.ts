import { BadRequestException, Body, Controller, Delete, Get, Param, Post, Put, Res, UploadedFile, UseGuards, UseInterceptors, UsePipes, ValidationPipe } from '@nestjs/common';
import { CreateDoctorDto } from 'src/doctors/dtos/CreateDoctor.dto';
import { UpdateDoctorDto } from 'src/doctors/dtos/UpdateDoctor.dto';
import { filterDocrotsDto } from 'src/doctors/dtos/filterDocrots.dto';
import { DoctorsService } from 'src/doctors/services/doctors/doctors.service';
import { Response } from 'express';
import { FileInterceptor } from '@nestjs/platform-express';
import { UpdateDoctorParams } from 'src/utils/types';
import { validate } from 'class-validator';
import { JWTAuthGuardAdmin } from 'src/middleware/auth/jwt-auth.guard';
import { UpdateDoctorForAdminDto } from 'src/doctors/dtos/UpdateDoctorForAdmin.dto';

@Controller('doctors')
export class DoctorsController {

    constructor(private doctorSrevice : DoctorsService){}




    //////////////////////////////////////////////////////////admin

    //create doctor
    @Post()
    @UseGuards(JWTAuthGuardAdmin)
    async  createDoctor(@Body(new ValidationPipe({ whitelist: true })) createDoctorDto : CreateDoctorDto){
        await this.doctorSrevice.createDoctor(createDoctorDto);
        return{message : "doctor created successfully"}
    }


    @Put('update/:doctorId')
    @UseGuards(JWTAuthGuardAdmin)
    async updateDoctorForAdmin(
      @Param('doctorId') doctorId: number,
      @Body(new ValidationPipe({ whitelist: true })) updateDoctorForAdminDto: UpdateDoctorForAdminDto,
    ) {
      await this.doctorSrevice.updateDoctorforAdmin(doctorId,updateDoctorForAdminDto);
      return {message : "doctor updated successfully"}
    }

    //get doctors
    @Get(':type')//type 1 active doctors 2 not active 2 all
    @UseGuards(JWTAuthGuardAdmin)
    async getDoctors(@Param('type') type?: number) {
      return  this.doctorSrevice.findDoctors(type);
    
    }

    //doctor insurances
    @Post(':doctorId/insurances/:insuranceId')
    @UseGuards(JWTAuthGuardAdmin)
    async addDoctorToInsurance(
      @Param('insuranceId') insuranceId: number,
      @Param('doctorId') doctorId: number,
      @Res() res: Response
    ) {
      await this.doctorSrevice.addDoctorToInsuranceCompany(doctorId,insuranceId);
      return res.status(200).json({message :'doctor added insurances successfully'});
    }


    @Delete(':doctorId/insurances/:insuranceId')
    @UseGuards(JWTAuthGuardAdmin)
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
    @UseGuards(JWTAuthGuardAdmin)
    async addDoctorToSubSpecialty(
      @Param('subSpecialtyId') insuranceId: number,
      @Param('doctorId') doctorId: number,
      @Res() res: Response
    ){
      await this.doctorSrevice.addDoctorToSubSpecialty(doctorId,insuranceId);
      return res.status(200).json({message :'doctor added subSpecialties successfully'});

    }

    @Delete(':doctorId/subSpecialties/:subSpecialtyId')
    @UseGuards(JWTAuthGuardAdmin)
    async deleteDoctorfromSubSpecialty(
      @Param('subSpecialtyId') subSpecialtyId: number,
      @Param('doctorId') doctorId: number,
      @Res() res: Response
    ) {
      await this.doctorSrevice.removeDoctorFromSubSpecialty(doctorId,subSpecialtyId);
      return res.status(200).json({message :'doctor deleted subSpecialties successfully'});

    }


    //////////////////////////////////////////////////////////doctor
   

    @Put(':doctorId')
    @UseInterceptors(FileInterceptor('file'))
    async updateDoctor(
      @Param('doctorId') doctorId: number,
      @Res() res: Response,
      @Body() updateDoctorDto: UpdateDoctorParams,
      @UploadedFile() file: Express.Multer.File,
    ) {
      await this.doctorSrevice.updateDoctor(doctorId,updateDoctorDto,file);
      return {message : "doctor updated successfully"}
    }



    @Post('send-email')
    async sendResetEmail(@Body('email') email: string): Promise<void> {
      const code = await this.doctorSrevice.sendResetEmail(email);
    }
  
    @Post('reset-password')
    async resetPassword(
      @Body('doctorId') doctorId: number,
      @Body('code') code: number,
      @Body('newPassword') newPassword: string,
    ): Promise<void> {
      await this.doctorSrevice.resetPassword(doctorId, code, newPassword);
    }



    //////////////////////////////////////////////////////////patient


    @Post('filterDocrots')
    filterDocrots(@Body() filterDocrotsDto : filterDocrotsDto){
        return this.doctorSrevice.filterDocrots(filterDocrotsDto);
    }     



    @Get('withInformation')
     async getDoctorsWithInformation(){
        const doctors = await this.doctorSrevice.getDoctorsWithAllTheirInformation();
        return {doctors : doctors}
    }
}
