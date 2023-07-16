import { UseGuards,Body, Controller, Delete, Get, Param, Post, Put, Res, ValidationPipe } from '@nestjs/common';
import { InsuranceDto } from 'src/insurances/dtos/InsuranceDetails.dto';
import { InsurancesService } from 'src/insurances/services/insurances/insurances.service';
import { Response } from 'express';
import { JWTAuthGuardDoctorAdmin } from 'src/middleware/auth/jwt-auth.guard';
import { filterNameDto } from 'src/insurances/dtos/filterName.dto';

@Controller('insurances')
export class InsurancesController {
    constructor(private InsuranceSrevice : InsurancesService){}
    @Get()
    @UseGuards(JWTAuthGuardDoctorAdmin)
    async getInsurances(){
        const insurances =  await this.InsuranceSrevice.findInsurances()
        return {insurances : insurances};
    }
    

      //filter insurances
      @Post('filter-by-names')
      @UseGuards(JWTAuthGuardDoctorAdmin)
      async  filterInsurances(@Body(new ValidationPipe({ whitelist: true })) filterName : filterNameDto){
          return this.InsuranceSrevice.filterInsurancesByName(filterName);
      }


    @Post()
    @UseGuards(JWTAuthGuardDoctorAdmin)
    async createClinic(@Body(new ValidationPipe({ whitelist: true })) createSpecialtyDto: InsuranceDto){
        const clinic = await this.InsuranceSrevice.createInsurance(createSpecialtyDto);
        return {clinic : clinic};
    }

    @Delete(':insuranceId')
    @UseGuards(JWTAuthGuardDoctorAdmin)
    async  deleteClinic(
      @Param('insuranceId') 
      insuranceId: number,
     ){
        await  this.InsuranceSrevice.deleteInsurance(insuranceId);
        return {message : 'insurance deleted successfully'}
    }
    @Put(':insuranceId')
    @UseGuards(JWTAuthGuardDoctorAdmin)
    async updateClinic(
      @Param('insuranceId') insuranceId: number,
      @Body(new ValidationPipe({ whitelist: true })) newData: InsuranceDto
    ) {
      await this.InsuranceSrevice.updateInsurance(insuranceId, newData);
      return {message : 'insurance updated successfully'}
    }
}
