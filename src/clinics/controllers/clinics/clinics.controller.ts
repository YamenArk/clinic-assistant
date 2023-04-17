import { Controller, Get, Post, Put,Delete, Param, Body, Res } from '@nestjs/common';
import { ClinicDto } from 'src/clinics/dtos/ClinicDetails.dto';
import { ClinicsService } from 'src/clinics/services/clinics/clinics.service';
import { Response } from 'express';

@Controller('clinics')
export class ClinicsController {
    constructor(private clinicSrevice : ClinicsService){}
    @Get()
    async getClinics(){
        const clinics =  await this.clinicSrevice.findClinics()
        return {clinics : clinics};
    }
    
    @Post()
    async createClinic(@Body() createSpecialtyDto: ClinicDto){
        const clinic = await this.clinicSrevice.createClinic(createSpecialtyDto);
        return {clinic : clinic};
    }

    @Delete(':clinicId')
    async  deleteClinic(
      @Param('clinicId') 
      clinicId: number,
       @Res() res: Response){
        await  this.clinicSrevice.deleteClinic(clinicId);
        return res.status(200).json({message :'clinic deleted successfully'});
    }
    @Put(':clinicId')
    async updateClinic(
      @Param('clinicId') clinicId: number,
      @Body() newData: ClinicDto,
      @Res() res: Response
    ){
      await this.clinicSrevice.updateClinic(clinicId, newData);
      return res.status(200).json({message : 'clinic updated successfully'});
    }

      //doctor clinic
      @Post(':clinicId/doctors/:doctorId')
      async addDoctorToClinic(
        @Param('clinicId') clinicId: number,
        @Param('doctorId') doctorId: number,
        @Res() res: Response
      ) {
        await this.clinicSrevice.addDoctorToClinic(doctorId,clinicId);
        return res.status(200).json({message : 'doctor added to clinic successfully'});
      }
  
      @Delete(':clinicId/doctors/:doctorId')
      async deleteDoctorfromInsurance(
        @Param('clinicId') clinicId: number,
        @Param('doctorId') doctorId: number,
        @Res() res: Response
      ){
        await this.clinicSrevice.removeDoctorFromClinic(doctorId,clinicId);
        return res.status(200).json({message : 'doctor deleted from clinic successfully'});
      }
  
      @Get(':clinicId/doctors')
      async getDoctorsForClinic( 
        @Param('clinicId') clinicId: number,
        ){
          const doctors =  await this.clinicSrevice.findAllDoctorsForClinics(clinicId)
          return {doctors : doctors};
      }
}
