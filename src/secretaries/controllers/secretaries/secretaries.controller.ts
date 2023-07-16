import { BadRequestException, Body, Controller, Delete, Get, Param, ParseIntPipe, Post, Put, Req, UseGuards, ValidationPipe } from '@nestjs/common';
import { JWTAuthGuardDoctor, JWTAuthGuardSecretary } from 'src/middleware/auth/jwt-auth.guard';
import { CreateSecretaryDto } from 'src/secretaries/dtos/CreateSecretary.dto';
import { emailDto } from 'src/secretaries/dtos/email.dto';
import { SecretariesService } from 'src/secretaries/services/secretaries/secretaries.service';

@Controller('secretaries')
export class SecretariesController {
    constructor(private secretariesService : SecretariesService){} 
    

    //////////////////////////////////////////////////////doctor
    //create secretary
    @Post()
    @UseGuards(JWTAuthGuardDoctor)
    async  createsecretary(@Body(new ValidationPipe({ whitelist: true })) createSecretaryDto : CreateSecretaryDto){
        await this.secretariesService.createSecretary(createSecretaryDto);
        return{message : "secretary created successfully"}
    }

    @Post(':clinicId/:secretaryId')
    @UseGuards(JWTAuthGuardDoctor)
    async addsecretaryToClinic(
      @Param('clinicId', new ParseIntPipe()) clinicId: number,
      @Param('secretaryId', new ParseIntPipe()) secretaryId: number,
      @Req() request
    ) {
        if (isNaN(clinicId)) {
        throw new BadRequestException('clinicId must be a number');
        }
        if (isNaN(secretaryId)) {
        throw new BadRequestException('secretaryId must be a number');
        }
        const doctorId = request.doctorId; // Accessing the doctorId from the request object    
        await this.secretariesService.addsecretaryToClinic(clinicId, secretaryId,doctorId);
        return{message : "secretary added to clinic successfully"}
    }

    @Delete(':clinicId')
    @UseGuards(JWTAuthGuardDoctor)
    async deletesecretaryFromClinic(
      @Param('clinicId', new ParseIntPipe()) clinicId: number,
      @Req() request
    ) {
        if (isNaN(clinicId)) {
        throw new BadRequestException('clinicId must be a number');
        }
        const doctorId = request.doctorId; // Accessing the doctorId from the request object    
        await this.secretariesService.deletesecretaryToClinic(clinicId,doctorId);
        return{message : "secretary removed from clinic successfully"}

    }

    @Get('privateId/:privateId')
    @UseGuards(JWTAuthGuardDoctor)
    async getsecretaryByprivateId(
      @Param('privateId') privateId: string
    ) {
      if (!privateId) {
        throw new BadRequestException('privateId is required');
      }
      return this.secretariesService.getSecretaryByprivateId(privateId);
    }


    /////////////////////////////////////////////////////////////////////secretaries
    @Get('myAccount')
    @UseGuards(JWTAuthGuardSecretary)
    async getMyAccount(
      @Req() request
    ) {
      const secretaryId = request.secretaryId; // Accessing the doctorId from the request object
      const secretar = await this.secretariesService.getMyAccount(secretaryId)
      return {secretar : secretar}
    }


    @Get('doctors')
    @UseGuards(JWTAuthGuardSecretary)
    async getMyDoctors(
      @Req() request
    ) {
      const secretaryId = request.secretaryId; // Accessing the doctorId from the request object
      const doctors = await this.secretariesService.getMyDoctors(secretaryId)
      return {doctors : doctors}
    }
    
    @Get('clinics/:doctorId')
    @UseGuards(JWTAuthGuardSecretary)
    async getclinics(
      @Param('doctorId', new ParseIntPipe()) doctorId: number,
      @Req() request
    ) {
      const secretaryId = request.secretaryId; // Accessing the doctorId from the request object
      const clinics = await this.secretariesService.getclinics(secretaryId,doctorId)
      return {clinics : clinics}
    }


    @Get('work-time/:clinicId/:doctorId')
    @UseGuards(JWTAuthGuardSecretary)
    async getWotkTime(
      @Param('clinicId') clinicId: number,
      @Req() request,
      @Param('doctorId', new ParseIntPipe()) doctorId: number,
      ) {
      const secretaryId = request.secretaryId; // Accessing the doctorId from the request object

      return this.secretariesService.getWorkTime(clinicId, doctorId,secretaryId);
    }

    
    @Get('appoitment/:workTimeId')
    @UseGuards(JWTAuthGuardSecretary)
    async getAppoitment(@Param('workTimeId') workTimeId: number, @Req() request) {
      const secretaryId = request.secretaryId; // Accessing the doctorId from the request object
      return this.secretariesService.getAppoitment(workTimeId, secretaryId);
    }

    @Put('appoitment/:id/:patientId')
    @UseGuards(JWTAuthGuardSecretary)
    async missedAppointment(
      @Param('id', new ParseIntPipe()) id: number,
      @Param('patientId', new ParseIntPipe()) patientId: number,
      @Req() request
    ){
      const secretaryId = request.secretaryId; // Accessing the doctorId from the request object
      await this.secretariesService.missedAppointment(id,patientId,secretaryId)
      return {message : 'it has been updaed sucessfully'}
    }





  @Post('reset-password')
  async resetPassword(
    @Body('secretaryId') secretaryId: number,
    @Body('code') code: number,
    @Body('newPassword') newPassword: string,
  ): Promise<void> {
    await this.secretariesService.resetPassword(secretaryId, code, newPassword);
  }



  /////////////////////////doctor
  @Get(':clinicId')
  @UseGuards(JWTAuthGuardDoctor)
  async getsecretaryBysecretaryId(
      @Param('clinicId', new ParseIntPipe()) clinicId: number,
    @Req() request
  ) {
    if (!clinicId) {
      throw new BadRequestException('clinicId is required');
    }
    const doctorId = request.doctorId; // Accessing the doctorId from the request object
    return this.secretariesService.getSecretaryClinicId(clinicId,doctorId);
  }


}
