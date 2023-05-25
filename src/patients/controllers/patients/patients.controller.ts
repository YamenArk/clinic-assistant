import { Body, Controller, Post, ValidationPipe } from '@nestjs/common';
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
       const access_token = await  this.patientSrevice.login(authLoginDto);
       return {access_token : access_token}
     }

    @Post('signup')
    async signUp(@Body(new ValidationPipe({ whitelist: true })) signUpDto: SignUpDto) {
        const patientId =  await this.patientSrevice.signUp(signUpDto);
        return {patientId : patientId}
    }   

    @Post('verify')
    async verify(@Body(new ValidationPipe({ whitelist: true })) verifyDto: verifyDto) {
      await this.patientSrevice.verify(verifyDto);
  }   
}
