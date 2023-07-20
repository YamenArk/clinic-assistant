import { Body, Controller, Post,Get, ValidationPipe,Req, UseGuards, Put, Param, ParseIntPipe, UploadedFile, UseInterceptors, HttpException, HttpStatus } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import * as multer from 'multer'; // import multer here
import { JWTAuthGuardPatient } from 'src/middleware/auth/jwt-auth.guard';
import { AuthLoginDto } from 'src/patients/dtos/AuthLogin.dto';
import { SignUpDto } from 'src/patients/dtos/SignUp.dto';
import { restPasswordDto } from 'src/patients/dtos/restPassword.dto';
import { restPasswordVerifyDto } from 'src/patients/dtos/restPasswordVerify.dto';
import { verifyDto } from 'src/patients/dtos/verify.dto';
import { PatientsService } from 'src/patients/services/patients/patients.service';

@Controller('patients')
export class PatientsController {
    constructor(private patientSrevice : PatientsService){}
     //auth
     @Post('login')
     async login(@Body(new ValidationPipe({ whitelist: true })) authLoginDto: AuthLoginDto) {
       const accessToken = await  this.patientSrevice.login(authLoginDto);
       return {accessToken : accessToken}
     }

     @Get('myAccount')
    @UseGuards(JWTAuthGuardPatient)
     async myAccount(
      @Req() request
     ){
        const patientId = request.patientId; // Accessing the doctorId from the request object
        return this.patientSrevice.getmyAccount(patientId)
     }


     
    //update my profile
    @UseGuards(JWTAuthGuardPatient)
    @Put('update-profilePicture')
    @UseInterceptors(
      FileInterceptor('file', {
        storage: multer.diskStorage({
          destination: './uploads/patients',
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
      @UploadedFile() file: Express.Multer.File,
      ) {
        if(!file)
        {
          throw new HttpException('Only image files are allowed!', HttpStatus.BAD_REQUEST);
        }
      const patientId = request.patientId; // Accessing the patientId from the request object
      this.patientSrevice.updateProfile(patientId,file);
      return {message : "patient profilePicture updated successfully"}
    }

    



    @Post('signup')
    async signUp(@Body(new ValidationPipe({ whitelist: true })) signUpDto: SignUpDto) {
        const patientId =  await this.patientSrevice.signUp(signUpDto);
        return {patientId : patientId}
    }   

    @Post('verify')
    async verify(@Body(new ValidationPipe({ whitelist: true })) verifyDto: verifyDto) {
      await this.patientSrevice.verify(verifyDto);
      return {message : 'account created successfully'}
    } 
  @Get('my-current-appointment')
  @UseGuards(JWTAuthGuardPatient)
   async myCurrentAccount(
    @Req() request
   ){
      const patientId = request.patientId; // Accessing the doctorId from the request object
      const appointments = await this.patientSrevice.myCurrentAppointment(patientId);
      return {appointments : appointments}
   }

   @Get('my-previes-appointment')
   @UseGuards(JWTAuthGuardPatient)
    async myPreviesAppointment(
     @Req() request
    ){
       const patientId = request.patientId; // Accessing the doctorId from the request object
       const appointments = await this.patientSrevice.myPreviesAppointment(patientId);
       return {appointments : appointments}
    }
  
  @Get('24hour-to-appointment/:id')
  @UseGuards(JWTAuthGuardPatient)
    async timetoappointment(
     @Param('id', new ParseIntPipe()) id: number,
    @Req() request
    ){
      const patientId = request.patientId; // Accessing the doctorId from the request object
      const cancelState =  await this.patientSrevice.timetoappointment(patientId,id);
      return {cancelState : cancelState}
    }



  @Put('cancel-appointment/:id')
  @UseGuards(JWTAuthGuardPatient)
    async canelAppointment(
     @Param('id', new ParseIntPipe()) id: number,
    @Req() request
    ){
      const patientId = request.patientId; // Accessing the doctorId from the request object
      await this.patientSrevice.cancelAppointment(patientId,id);
      return {message : 'Appointment has been canceled sucessfully'}
    }






      @Post('rest-password')
      async restPassword(@Body(new ValidationPipe({ whitelist: true })) restPassword: restPasswordDto) {
          const patientId =  await this.patientSrevice.restPassword(restPassword);
          return {patientId : patientId}
      }   
  
      @Post('rest-password-verify')
      async restPasswordVerify(@Body(new ValidationPipe({ whitelist: true })) restPassword: restPasswordVerifyDto) {
        await this.patientSrevice.restPasswordVerify(restPassword);
        return {message : 'password changed successfully'}
      } 



    @Get('patient-delays')
    @UseGuards(JWTAuthGuardPatient)
      async patientDelays(
      @Req() request
      ){
        const patientId = request.patientId; // Accessing the patientId from the request object
        const patientDelays =  await this.patientSrevice.patientDelays(patientId);
        return {patientDelays : patientDelays}
      }



    @Get('patient-reminders')
    @UseGuards(JWTAuthGuardPatient)
      async patientReminders(
      @Req() request
      ){
        const patientId = request.patientId; // Accessing the patientId from the request object
        const patientReminders =  await this.patientSrevice.patientReminders(patientId);
        return {patientReminders : patientReminders}
      }

}
