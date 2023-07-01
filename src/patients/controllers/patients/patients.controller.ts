import { Body, Controller, Post,Get, ValidationPipe,Req, UseGuards, Put, Param, ParseIntPipe } from '@nestjs/common';
import { JWTAuthGuardPatient } from 'src/middleware/auth/jwt-auth.guard';
import { AuthLoginDto } from 'src/patients/dtos/AuthLogin.dto';
import { SignUpDto } from 'src/patients/dtos/SignUp.dto';
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

}
