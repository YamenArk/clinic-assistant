import { BadRequestException, Body, Controller, Delete, Get, Param, Post, Put, Req, Res, UploadedFile, UseGuards, UseInterceptors, UsePipes, ValidationPipe } from '@nestjs/common';
import { CreateDoctorDto } from 'src/doctors/dtos/CreateDoctor.dto';
import { UpdateDoctorDto } from 'src/doctors/dtos/UpdateDoctor.dto';
import { filterDocrotsDto } from 'src/doctors/dtos/filterDocrots.dto';
import { DoctorsService } from 'src/doctors/services/doctors/doctors.service';
import { Response } from 'express';
import { FileInterceptor } from '@nestjs/platform-express';
import { CreateWorkTimeParams, UpdateDoctorParams } from 'src/utils/types';
import { validate } from 'class-validator';
import { JWTAuthGuardAdmin, JWTAuthGuardDoctor } from 'src/middleware/auth/jwt-auth.guard';
import { UpdateDoctorForAdminDto } from 'src/doctors/dtos/UpdateDoctorForAdmin.dto';
import { CreateWorkTimeDto } from 'src/doctors/dtos/CreateWorkTime.dto';
import { UpdateDoctoeClinicDto } from 'src/doctors/dtos/updateDoctoeClinic.dto';
import { get } from 'http';
import { AuthLoginDto } from 'src/doctors/dtos/AuthLogin.dto';

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
    ) {
      await this.doctorSrevice.removeDoctorFromSubSpecialty(doctorId,subSpecialtyId);
      return {message : "doctor deleted subSpecialties successfully"}

    }


    //////////////////////////////////////////////////////////doctor
   
    //create work times
    @Post('set-work-time/:clinicId')
    @UseGuards(JWTAuthGuardDoctor)
    async setWorkTime(
      @Body( new ValidationPipe({ whitelist: true }))workTimeDetails: CreateWorkTimeDto,
      @Param('clinicId') clinicId: number,
      @Req() request
    ) {
      CreateWorkTimeDto.validate(workTimeDetails); // Call the validate() method as a static method on CreateWorkTimeDto
      const doctorId = request.doctorId; // Accessing the doctorId from the request object
      await this.doctorSrevice.createWorkTime(workTimeDetails,clinicId,doctorId);
      return {message : "work time and appoitments added successfully"}
    }

    @Get('work-time/:clinicId')
    @UseGuards(JWTAuthGuardDoctor)
    async getWotkTime(@Param('clinicId') clinicId: number, @Req() request) {
      const doctorId = request.doctorId; // Accessing the doctorId from the request object
      return this.doctorSrevice.getWorkTime(clinicId, doctorId);
    }
  
    @Get('appoitment/:workTimeId')
    @UseGuards(JWTAuthGuardDoctor)
    async getAppoitment(@Param('workTimeId') workTimeId: number, @Req() request) {
      const doctorId = request.doctorId; // Accessing the doctorId from the request object
      return this.doctorSrevice.getAppoitment(workTimeId, doctorId);
    }
  

    //update checkupPrice ,daysToSeeLastAppointment,appointmentDuring
    @Put('updateDoctoeClinicDetails/:clinicId')
    @UseGuards(JWTAuthGuardDoctor)
    async updateDoctoeClinicDetails(
      @Body( new ValidationPipe({ whitelist: true }))doctorClinicDetails: UpdateDoctoeClinicDto,
      @Param('clinicId') clinicId: number,
      @Req() request
    ) {
      const doctorId = request.doctorId; // Accessing the doctorId from the request object
      await this.doctorSrevice.updateDoctoeClinicDetails(doctorClinicDetails,clinicId,doctorId);
    }    

    //get checkupPrice ,daysToSeeLastAppointment,appointmentDuring   
    @Get('getDoctoeClinicDetails/:clinicId')
    @UseGuards(JWTAuthGuardDoctor)
    async getDoctorClinicDetailsWithAuthGuard(@Param('clinicId') clinicId: number, @Req() request) {
      const doctorId = request.doctorId; // Accessing the doctorId from the request object
      return this.doctorSrevice.getDoctoeClinicDetails(clinicId, doctorId);
    }
  
    

    //auth
    @Post('login')
    async login(@Body(new ValidationPipe({ whitelist: true })) authLoginDto: AuthLoginDto) {
      const access_token = await  this.doctorSrevice.login(authLoginDto);
      return {access_token : access_token}
    }

    @Post('send-email')
    async sendResetEmail(@Body('email') email: string) {
        const doctorId = await this.doctorSrevice.sendResetEmail(email);
        return {message : 'message has been sent to your Email',doctorId : doctorId}
    }
  
    @Post('reset-password')
    async resetPassword(
      @Body('doctorId') doctorId: number,
      @Body('code') code: number,
      @Body('newPassword') newPassword: string,
    ): Promise<void> {
      await this.doctorSrevice.resetPassword(doctorId, code, newPassword);
    }






    @Put(':doctorId')
    @UseInterceptors(FileInterceptor('file'))
    async updateDoctor(
      @Param('doctorId') doctorId: number,
      @Body() updateDoctorDto: UpdateDoctorDto,
      @UploadedFile() file: Express.Multer.File,
    ) {
      await this.doctorSrevice.updateDoctor(doctorId,updateDoctorDto,file);
      return {message : "doctor updated successfully"}
    }



    // @Post('send-email')
    // async sendResetEmai1l(@Body('email') email: string): Promise<void> {
    //   const code = await this.doctorSrevice.sendResetEmail(email);
    // }
  
    // @Post('reset-password')
    // async resetPasswor1d(
    //   @Body('doctorId') doctorId: number,
    //   @Body('code') code: number,
    //   @Body('newPassword') newPassword: string,
    // ): Promise<void> {
    //   await this.doctorSrevice.resetPassword(doctorId, code, newPassword);
    // }



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
