import { BadRequestException, Body, Controller, Delete, Get, Param, ParseIntPipe, Post, Req, UseGuards, ValidationPipe } from '@nestjs/common';
import { JWTAuthGuardDoctor } from 'src/middleware/auth/jwt-auth.guard';
import { CreateSecretaryDto } from 'src/secretaries/dtos/CreateSecretary.dto';
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

    @Get('secretaryId/:secretaryId')
    @UseGuards(JWTAuthGuardDoctor)
    async getsecretaryBysecretaryId(
        @Param('secretaryId', new ParseIntPipe()) secretaryId: number,
    ) {
      if (!secretaryId) {
        throw new BadRequestException('secretaryId is required');
      }
      return this.secretariesService.getSecretaryBysecretaryId(secretaryId);
    }


}
