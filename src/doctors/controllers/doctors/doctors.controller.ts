import { BadRequestException, Body, Controller, Delete, Get, Param, ParseIntPipe, Post, Put, Req, Res, UploadedFile, UseGuards, UseInterceptors, UsePipes, ValidationPipe } from '@nestjs/common';
import { CreateDoctorDto } from 'src/doctors/dtos/CreateDoctor.dto';
import { UpdateDoctorDto } from 'src/doctors/dtos/UpdateDoctor.dto';
import { filterDocrotsDto } from 'src/doctors/dtos/filterDocrots.dto';
import { DoctorsService } from 'src/doctors/services/doctors/doctors.service';
import { Response } from 'express';
import { FileInterceptor } from '@nestjs/platform-express';
import { CreateWorkTimeParams, UpdateDoctorParams } from 'src/utils/types';
import { IsEmail } from 'class-validator';
import { JWTAuthGuardAdmin, JWTAuthGuardDoctor, JWTAuthGuardPatient } from 'src/middleware/auth/jwt-auth.guard';
import { UpdateDoctorForAdminDto } from 'src/doctors/dtos/UpdateDoctorForAdmin.dto';
import { CreateWorkTimeDto } from 'src/doctors/dtos/CreateWorkTime.dto';
import { UpdateDoctoeClinicDto } from 'src/doctors/dtos/updateDoctoeClinic.dto';
import { get } from 'http';
import { AuthLoginDto } from 'src/doctors/dtos/AuthLogin.dto';
import { secondFilterDocrotsDto } from 'src/doctors/dtos/secondFilterDocrots.dto';
import { emailDto } from 'src/doctors/dtos/email.dto';
import { profileDetailsDto } from 'src/doctors/dtos/profileDetails.dto';
import { filterNameDto } from 'src/doctors/dtos/filterName.dto';
import * as jwt from 'jsonwebtoken';
import { JwtPayload } from 'jsonwebtoken';
import { evaluateDto } from 'src/doctors/dtos/evaluate.dto';
@Controller('doctors')
export class DoctorsController {

    constructor(private doctorSrevice : DoctorsService){}




    //////////////////////////////////////////////////////////admin


    //doctor profile
    @Get('admin/doctor-profile/:doctorId')
    @UseGuards(JWTAuthGuardAdmin)
    async getdoctorprofile(
      @Param('doctorId', new ParseIntPipe()) doctorId: number,
    ){
      return this.doctorSrevice.getprofileforadmin(doctorId);
  }

    //create doctor
    @Post()
    @UseGuards(JWTAuthGuardAdmin)
    async  createDoctor(@Body(new ValidationPipe({ whitelist: true })) createDoctorDto : CreateDoctorDto){
        await this.doctorSrevice.createDoctor(createDoctorDto);
        return{message : "doctor created successfully"}
    }


    //filter doctor
    @Post('filter-by-names')
    @UseGuards(JWTAuthGuardAdmin)
    async  filterDoctor(@Body(new ValidationPipe({ whitelist: true })) filterName : filterNameDto){
        return this.doctorSrevice.filterDoctorByName(filterName);
    }



    @Put('update/:doctorId')
    @UseGuards(JWTAuthGuardAdmin)
    async updateDoctorForAdmin(
      @Param('doctorId',ParseIntPipe) doctorId: number,
      @Body(new ValidationPipe({ whitelist: true })) updateDoctorForAdminDto: UpdateDoctorForAdminDto,
    ) {
      await this.doctorSrevice.updateDoctorforAdmin(doctorId,updateDoctorForAdminDto);
      return {message : "doctor updated successfully"}
    }

    @Get(':type(1|2|3)')
    @UseGuards(JWTAuthGuardAdmin)//type 1 active doctors 2 not active 3 all
    async getDoctors(@Param('type', ParseIntPipe) type: number) {
      if (type < 1 || type > 3) {
        throw new BadRequestException('Invalid type parameter');
      }
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
   
    //my profile
    @UseGuards(JWTAuthGuardDoctor)
    @Get('get-profile')
    async getProfile(@Req() request) {
      const doctorId = request.doctorId; // Accessing the doctorId from the request object
      return this.doctorSrevice.getprofile(doctorId);
    }

       


    //update my profile
    @UseGuards(JWTAuthGuardDoctor)
    @Put('update-profile')
    async updateProfile(
      @Req() request,
      @Body(new ValidationPipe({ whitelist: true })) profileDetails: profileDetailsDto,
      @UploadedFile() file: Express.Multer.File,
      ) {
      console.log(file)
      console.log("=====================")
      console.log(profileDetails)

      const doctorId = request.doctorId; // Accessing the doctorId from the request object
      this.doctorSrevice.updateprofile(doctorId,profileDetails,file);
      return {message : "doctor updated successfully"}
    }


    //get clinic
    @UseGuards(JWTAuthGuardDoctor)
    @Get('get-clinic')
    async getclinics(@Req() request) {
      const doctorId = request.doctorId; // Accessing the doctorId from the request object
      return this.doctorSrevice.getClinicsForDoctor(doctorId);
    }


    //get sub
    @UseGuards(JWTAuthGuardDoctor)
    @Get('get-sub')
    async getsubs(@Req() request) {
      const doctorId = request.doctorId; // Accessing the doctorId from the request object
      return this.doctorSrevice.getSubs(doctorId);
    }

    //get inurance
    @Get('get-inurance')
    @UseGuards(JWTAuthGuardDoctor)
    async getinurances(@Req() request) {
      const doctorId = request.doctorId; // Accessing the doctorId from the request object
      return this.doctorSrevice.getinurancesForDoctor(doctorId);
    }



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
      const loginDetails = await  this.doctorSrevice.login(authLoginDto);
      return {loginDetails : loginDetails}
    }

    @Post('send-email')
      async sendResetEmail(@Body(new ValidationPipe({ whitelist: true })) email: emailDto) {
      const doctorId = await this.doctorSrevice.sendResetEmail(email.email);
      return { message: 'message has been sent to your Email', doctorId: doctorId };
    }
  
    @Post('reset-password')
    async resetPassword(
      @Body('doctorId') doctorId: number,
      @Body('code') code: number,
      @Body('newPassword') newPassword: string,
    ): Promise<void> {
      await this.doctorSrevice.resetPassword(doctorId, code, newPassword);
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
    filterDocrots(@Body(new ValidationPipe({ whitelist: true })) filterDocrotsDto : filterDocrotsDto){
        return this.doctorSrevice.filterDocrots(filterDocrotsDto);
    }     

    @Post('secondFilterDocrots')
    secondFilterDocrots(@Body(new ValidationPipe({ whitelist: true })) filterDocrotsDto : secondFilterDocrotsDto){
        return this.doctorSrevice.secondFilterDocrots(filterDocrotsDto);
    }     






    @Get('profile/:doctorId')
    async getprofile1(
      @Param('doctorId', new ParseIntPipe()) doctorId: number,
      @Req() request
    ){
      if (request.headers.authorization) {
        const token = request.headers.authorization.split(' ')[1]; // Get the token from the authorization heade
        const decoded = jwt.verify(token, process.env.JWT_SECRET) as JwtPayload; // Decode the token using the secret key and cast to JwtPayload
        if(decoded.type!=4)
        {
          return this.doctorSrevice.getprofileforpatient(doctorId,null);
        }
        return this.doctorSrevice.getprofileforpatient(doctorId,decoded.patientId);
      } else {
        // The request does not contain an authorization header, so the user is not authenticated
        return this.doctorSrevice.getprofileforpatient(doctorId,null);
      }
    }



    @Put('evaluate/:doctorId')
    @UseGuards(JWTAuthGuardPatient)
    evaluateDoctor(
      @Body(new ValidationPipe({ whitelist: true })) evaluateDoctor : evaluateDto,
      @Param('doctorId', new ParseIntPipe()) doctorId: number,
      @Req() request
      ){
      const patientId = request.patientId; // Accessing the doctorId from the request object
        return this.doctorSrevice.evaluateDoctor(evaluateDoctor,patientId,doctorId);
        
    }     

    @Get('withInformation')
     async getDoctorsWithInformation(){
        const doctors = await this.doctorSrevice.getDoctorsWithAllTheirInformation();
        return {doctors : doctors}
    }
}
