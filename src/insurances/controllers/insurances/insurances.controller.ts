import { Body, Controller, Delete, Get, Param, Post, Put, Res } from '@nestjs/common';
import { InsuranceDto } from 'src/insurances/dtos/InsuranceDetails.dto';
import { InsurancesService } from 'src/insurances/services/insurances/insurances.service';
import { Response } from 'express';

@Controller('insurances')
export class InsurancesController {
    constructor(private InsuranceSrevice : InsurancesService){}
    @Get()
    async getClinics(){
        const clinics =  await this.InsuranceSrevice.findInsurances()
        return {clinics : clinics};
    }
    
    @Post()
    async createClinic(@Body() createSpecialtyDto: InsuranceDto){
        const clinic = await this.InsuranceSrevice.createInsurance(createSpecialtyDto);
        return {clinic : clinic};
    }

    @Delete(':insuranceId')
    async  deleteClinic(
      @Param('insuranceId') 
      insuranceId: number,
      @Res() res: Response){
        await  this.InsuranceSrevice.deleteInsurance(insuranceId);
        return res.status(200).json({message : 'specialty deleted successfully'});
    }
    @Put(':insuranceId')
    async updateClinic(
      @Param('insuranceId') insuranceId: number,
      @Body() newData: InsuranceDto,
      @Res() res: Response
    ) {
      await this.InsuranceSrevice.updateInsurance(insuranceId, newData);
      return res.status(200).json({message :'specialty updated successfully'});
    }
}
