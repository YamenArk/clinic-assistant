import { UseGuards,Body, Controller, Delete, Get, Param, Post, Put, Res, ValidationPipe } from '@nestjs/common';
import { InsuranceDto } from 'src/insurances/dtos/InsuranceDetails.dto';
import { InsurancesService } from 'src/insurances/services/insurances/insurances.service';
import { Response } from 'express';
import { JWTAuthGuardAdmin } from 'src/middleware/auth/jwt-auth.guard';

@Controller('insurances')
export class InsurancesController {
    constructor(private InsuranceSrevice : InsurancesService){}
    @Get()
    @UseGuards(JWTAuthGuardAdmin)
    async getClinics(){
        const clinics =  await this.InsuranceSrevice.findInsurances()
        return {clinics : clinics};
    }
    
    @Post()
    @UseGuards(JWTAuthGuardAdmin)
    async createClinic(@Body(new ValidationPipe({ whitelist: true })) createSpecialtyDto: InsuranceDto){
        const clinic = await this.InsuranceSrevice.createInsurance(createSpecialtyDto);
        return {clinic : clinic};
    }

    @Delete(':insuranceId')
    @UseGuards(JWTAuthGuardAdmin)
    async  deleteClinic(
      @Param('insuranceId') 
      insuranceId: number,
     ){
        await  this.InsuranceSrevice.deleteInsurance(insuranceId);
        return {message : 'insurance deleted successfully'}
    }
    @Put(':insuranceId')
    @UseGuards(JWTAuthGuardAdmin)
    async updateClinic(
      @Param('insuranceId') insuranceId: number,
      @Body(new ValidationPipe({ whitelist: true })) newData: InsuranceDto
    ) {
      await this.InsuranceSrevice.updateInsurance(insuranceId, newData);
      return {message : 'insurance updated successfully'}
    }
}
