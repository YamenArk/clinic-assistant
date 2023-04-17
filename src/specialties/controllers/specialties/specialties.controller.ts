import { Body, Controller, Delete, Get, Param, Post, Put, Res } from '@nestjs/common';
import { SpecialtyDto } from 'src/specialties/dtos/Specialty.dto';
import { SpecialtiesService } from 'src/specialties/services/specialties/specialties.service';
import { Specialty } from 'src/typeorm/entities/specialty';
import { SubSpecialty } from 'src/typeorm/entities/sub-specialty';
import { Response } from 'express';

@Controller('specialties')
export class SpecialtiesController {
    constructor(private specialtySrevice : SpecialtiesService){}

    @Get()
    getSpecialties(){
        return this.specialtySrevice.findspecialties()
    }

    @Get('subspecialties')
    async getSpecialtiesWithSubSpecialties(){
        const specialties = await this.specialtySrevice.getAllSpecialtiesWithSubSpecialties();
        return {specialties : specialties};
    }

    @Get(':specialtyId/subSpecialties')
    async findAllSubsByspecialty(@Param('specialtyId') specialtyId: number) {
      const subSpecialties = await this.specialtySrevice.findAllSubsByspecialty(specialtyId);
      return {subSpecialties : subSpecialties}
    }
    
    @Post()
    async createSpecialty(@Body() createSpecialtyDto: SpecialtyDto) {
        return  await this.specialtySrevice.createspecialty(createSpecialtyDto);
    }
    @Delete(':specialtyId')
    async  deletespecialty(
      @Param('specialtyId') specialtyId: number,
      @Res() res: Response) {
        await  this.specialtySrevice.deletespecialty(specialtyId);
        return res.status(200).json({message :'specialty deleted successfully'});
      } 

    @Put(':specialtyId')
    async updatespecialty(
      @Param('specialtyId') specialtyId: number,
      @Body() newData: SpecialtyDto,
      @Res() res: Response
    ) {
      await this.specialtySrevice.updatespecialty(+specialtyId, newData);
      return res.status(200).json({message :'specialty updated successfully'});
    }
  }
