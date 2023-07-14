import { BadRequestException, Body, Controller, Delete, Get, HttpException, HttpStatus, Param, ParseIntPipe, Post, Put, Req, Res, UploadedFile, UseGuards, UseInterceptors, UsePipes, ValidationPipe } from '@nestjs/common';
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
import { workTimeFilterDto } from 'src/doctors/dtos/workTimeFilter.dto';
import TrusthubBase from 'twilio/lib/rest/TrusthubBase';
import { DeleteWorkTimeDto } from 'src/doctors/dtos/DeleteWorkTime.dto';
import { shiftDto } from 'src/doctors/dtos/shift.dto';
import { join } from 'path';
import * as fs from 'fs';
import * as multer from 'multer'; // import multer here
import { CreateManyWorkTimeDto } from 'src/doctors/dtos/CreateManyWorkTime.dto';

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
      const doctorProfile = await this.doctorSrevice.getprofileforadmin(doctorId);
      return {doctorProfile : doctorProfile}
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
    ) {
      await this.doctorSrevice.addDoctorToInsuranceCompany(doctorId,insuranceId);
      return { message : 'doctor added insurances successfully'}
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

   // Pay in advance
   
    // transction

    //my payment
    @UseGuards(JWTAuthGuardDoctor)
    @Get('pay-in-advance')
    async payInAdvance(@Req() request) {
      const doctorId = request.doctorId; // Accessing the doctorId from the request object
      const mypayment = await this.doctorSrevice.payInAdvance(doctorId);
      return {mypayment : mypayment}
    }



    @UseGuards(JWTAuthGuardDoctor)
    @Get('my-transctions')
    async gettransctions(@Req() request) {
      const doctorId = request.doctorId; // Accessing the doctorId from the request object
      const mytransctions = await this.doctorSrevice.gettransctions(doctorId);
      return {mytransctions : mytransctions}
    }

       




// import multer from 'multer';

      @UseGuards(JWTAuthGuardDoctor)
      @Put('update-profile')
      
      @UseInterceptors(
        FileInterceptor('file', {
          storage: multer.diskStorage({
            destination: './uploads/doctors',
            filename: (req, file, cb) => {
              const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
              cb(null, uniqueSuffix + '-' + file.originalname);
            },
          }),
          fileFilter: (req, file, cb) => {
            if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/)) {
              return cb(null, false);
            }
            cb(null, true);
          },
        }),
      )
      async updateProfile(
        @Req() request,
        @Body(new ValidationPipe({ whitelist: true })) profileDetails: profileDetailsDto,
        @UploadedFile() file: Express.Multer.File,
      ) {
          if(!file)
          {
            throw new HttpException('Only image files are allowed!', HttpStatus.BAD_REQUEST);
          }
          const doctorId = request.doctorId;
          await this.doctorSrevice.updateProfile(doctorId,profileDetails,file);
          return { message: 'doctor updated successfully' }; 
      }


      
    @Get('number-of-paitent-who-came')
    @UseGuards(JWTAuthGuardDoctor)
    async numberOfPaitentWhoCame(
      @Req() request,
      ){
        const doctorId = request.doctorId ;
        const numberOfPaitentWhoCame = await this.doctorSrevice.numberOfPaitentWhoCame(doctorId);
        return {reports : numberOfPaitentWhoCame};
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

    //create work times
    @Post('set-many-work-time/:clinicId')
    @UseGuards(JWTAuthGuardDoctor)
    async setManyWorkTime(
      @Body( new ValidationPipe({ whitelist: true }))workTimeDetails: CreateManyWorkTimeDto,
      @Param('clinicId') clinicId: number,
      @Req() request
    ) {
      CreateManyWorkTimeDto.validate(workTimeDetails); // Call the validate() method as a static method on CreateWorkTimeDto
      const doctorId = request.doctorId; // Accessing the doctorId from the request object
      await this.doctorSrevice.createmanyWorkTime(workTimeDetails,clinicId,doctorId);
      return {message : "work time and appoitments added successfully"}
    }




    //delete work times
    @Delete('delete-work-time/:clinicId')
    @UseGuards(JWTAuthGuardDoctor)
    async deleteWorkTimes(
      @Body( new ValidationPipe({ whitelist: true }))workTimeDetails: DeleteWorkTimeDto,
      @Param('clinicId') clinicId: number,
      @Req() request
    ) {
      const doctorId = request.doctorId; // Accessing the doctorId from the request object
      await this.doctorSrevice.deleteWorkTimes(workTimeDetails,clinicId,doctorId);
      return {message : "work time and appoitments deleted successfully"}
    }
    
    //create work times
    @Delete('delete-one-work-time/:workTimeId')
    @UseGuards(JWTAuthGuardDoctor)
    async deleteWorkTime(
      @Param('workTimeId') workTimeId: number,
      @Req() request
    ) {
      const doctorId = request.doctorId; // Accessing the doctorId from the request object
      await this.doctorSrevice.deleteWorkTime(workTimeId,doctorId);
      return {message : "work time and appoitments deleted successfully"}
    }

    @Post('shiftWorkTimes/:clinicId')
    @UseGuards(JWTAuthGuardDoctor)
    async shiftWorkTimes(
      @Body( new ValidationPipe({ whitelist: true }))shift: shiftDto,
      @Param('clinicId') clinicId: number,
      @Req() request
    ) {
      const doctorId = request.doctorId; // Accessing the doctorId from the request object
      await this.doctorSrevice.shiftWorkTimes(shift.shiftValue,doctorId,clinicId);
      return {message : "work time and appoitments shifted successfully"}
    }
        

    @Get('work-time/:clinicId')
    @UseGuards(JWTAuthGuardDoctor)
    async getWotkTime(@Param('clinicId') clinicId: number, @Req() request) {
      const doctorId = request.doctorId; // Accessing the doctorId from the request object
      return this.doctorSrevice.getWorkTimeForDoctor(clinicId, doctorId);
    }
  
    @Get('appoitment/:workTimeId')
    @UseGuards(JWTAuthGuardDoctor)
    async getAppoitment(@Param('workTimeId') workTimeId: number, @Req() request) {
      const doctorId = request.doctorId; // Accessing the doctorId from the request object
      return this.doctorSrevice.getAppoitment(workTimeId, doctorId);
    }

    @Put('appoitment/:id/:patientId')
    @UseGuards(JWTAuthGuardDoctor)
    async missedAppointment(
      @Param('id', new ParseIntPipe()) id: number,
      @Param('patientId', new ParseIntPipe()) patientId: number,
      @Req() request
    ){
      const doctorId = request.doctorId; // Accessing the doctorId from the request object
      await this.doctorSrevice.missedAppointment(id,patientId,doctorId)
      return {message : 'it has been updaed sucessfully'}
    }

    
    @Put('setAppointment/:id/:patientId')
    @UseGuards(JWTAuthGuardDoctor)
    async setAppointment(
      @Param('id', new ParseIntPipe()) id: number,
      @Param('patientId', new ParseIntPipe()) patientId: number,
      @Req() request
    ){
      const doctorId = request.doctorId; // Accessing the doctorId from the request object
      await this.doctorSrevice.setAppointment(id,patientId,doctorId)
      return {message : 'the appoitment has been booked sucessfully'}
    }

    @Get('patient-histories/:patientId')
    @UseGuards(JWTAuthGuardDoctor)
    async patientHistories(
      @Param('patientId', new ParseIntPipe()) patientId: number,
      @Req() request
    ){
      const doctorId = request.doctorId; // Accessing the doctorId from the request object
      return this.doctorSrevice.patientHistories(patientId,doctorId)
      // return {message : 'the appoitment has been booked sucessfully'}
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
      return await this.doctorSrevice.sendResetEmail(email.email);
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
      let patientId:number|null = null;
      let tokenIsCorrect = false;
      if (request.headers.authorization) {
        try{
          const token = request.headers.authorization.split(' ')[1]; // Get the token from the authorization heade
          const decoded = jwt.verify(token, process.env.JWT_SECRET) as JwtPayload; // Decode the token using the secret key and cast to JwtPayload
          if(decoded.type===4)
          {
            tokenIsCorrect = true
            patientId = decoded.patientId;
          }
        }
        catch{}
      }  
      // The request does not contain an authorization header, so the user is not authenticated
        const doctorProfile = await this.doctorSrevice.getprofileforpatient(doctorId,patientId,tokenIsCorrect);
        return {doctorProfile : doctorProfile}
    }




    // @Get('profile/:doctorId')
    // async getprofile1(
    //   @Param('doctorId', new ParseIntPipe()) doctorId: number,
    //   @Req() request
    // ){
    //   if (request.headers.authorization) {
    //     const token = request.headers.authorization.split(' ')[1]; // Get the token from the authorization heade
    //     let decoded;
    //     try{

    //       decoded = jwt.verify(token, process.env.JWT_SECRET) as JwtPayload; // Decode the token using the secret key and cast to JwtPayload
    //     }
    //     catch{
    //       return this.doctorSrevice.getprofileforpatient(doctorId,null);
    //     }
    //     if(decoded.type!=4)
    //     {
    //       return this.doctorSrevice.getprofileforpatient(doctorId,null);
    //     }
    //     return this.doctorSrevice.getprofileforpatient(doctorId,decoded.patientId);
    //   } else {
    //     // The request does not contain an authorization header, so the user is not authenticated
    //     return this.doctorSrevice.getprofileforpatient(doctorId,null);
    //   }
    // }



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

    @Get('evaluate/:doctorId')
    @UseGuards(JWTAuthGuardPatient)
    getevaluateDoctor(
      @Param('doctorId', new ParseIntPipe()) doctorId: number,
      @Req() request
      ){
      const patientId = request.patientId; // Accessing the doctorId from the request object
        return this.doctorSrevice.getevaluateDoctor(patientId,doctorId);
        
    }     
    
    
    @Get('clinic/:clinicId/:doctorId')
    @UseGuards(JWTAuthGuardPatient)
    async getDoctorClinic(
      @Param('doctorId', new ParseIntPipe()) doctorId: number,
      @Param('clinicId', new ParseIntPipe()) clinicId: number,
    ){
       const doctorClinicDetails = await this.doctorSrevice.getDoctorClinic(doctorId,clinicId);
       return {doctorClinicDetails : doctorClinicDetails}
   }

      
   @Get('work-time/:doctorId/:clinicId')
   @UseGuards(JWTAuthGuardPatient)
   async getworkTimes(
     @Param('doctorId', new ParseIntPipe()) doctorId: number,
     @Param('clinicId', new ParseIntPipe()) clinicId: number,
   ){
      const doctorClinicWorkTime = await this.doctorSrevice.getWorkTime(clinicId,doctorId);
      return {doctorClinicWorkTime : doctorClinicWorkTime}
  }

  @Post('work-time/:clinicId/:doctorId')
  @UseGuards(JWTAuthGuardPatient)
  async getworkTimesWithFilter(
    @Param('doctorId', new ParseIntPipe()) doctorId: number,
    @Param('clinicId', new ParseIntPipe()) clinicId: number,
    @Body(new ValidationPipe({ whitelist: true })) workTimeFilter : workTimeFilterDto,
  ){
    workTimeFilterDto.validate(workTimeFilter); // Call the validate() method as a static method on CreateWorkTimeDto

     const doctorClinicWorkTime = await this.doctorSrevice.getWorkTimeWithFilter(clinicId,doctorId,workTimeFilter);
     return {doctorClinicWorkTime : doctorClinicWorkTime}
 }

  @Get('appoitment/patient/work-time/:workTimeId')
    @UseGuards(JWTAuthGuardPatient)
    async getAppoitments(
      @Param('workTimeId', new ParseIntPipe()) workTimeId: number,
    ){
      return this.doctorSrevice.getAppoitmentForPatient(workTimeId);
  }

  @Post('appoitment/patient/:id')
  @UseGuards(JWTAuthGuardPatient)
  async setAppitments(
    @Param('id', new ParseIntPipe()) id: number,
    @Req() request
    ){
    const patientId = request.patientId; // Accessing the doctorId from the request object

      await this.doctorSrevice.setAppitments(id,patientId);
      return {mesaage : 'you have been booked successfully'}
  }


  @Get('appoitment/patient/:id')
  async getTimeBetweenTodayAndTheAppoitment(
    @Param('id', new ParseIntPipe()) id: number,
  ){
    return this.doctorSrevice.getTimeBetweenTodayAndTheAppoitment(id);
  }


  @Get('testing')
  async test(
  ){
    await this.doctorSrevice.test();
  }

}
