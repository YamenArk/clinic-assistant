import { Body, Controller, Delete, Get, Param, Post, Put, Res } from '@nestjs/common';
import { CreateSubSpecialtyDto } from 'src/sub-specialties/dtos/CreateSubSpecialty.dto';
import { SubSpecialtiesService } from 'src/sub-specialties/services/sub-specialties/sub-specialties.service';
import { SubSpecialty } from 'src/typeorm/entities/sub-specialty';
import { Response } from 'express';

@Controller('subSpecialties')
export class SubSpecialtiesController {
    constructor(private subSpecialtySrevice : SubSpecialtiesService){}

    @Post(':specialtyId')
    createSubSpecialty(
        @Param('specialtyId') specialtyId: number,
        @Body() createSubSpecialtyDto: CreateSubSpecialtyDto) 
        : Promise<SubSpecialty> {
        return this.subSpecialtySrevice.createSubSpecialty(specialtyId,createSubSpecialtyDto);
    }
    @Delete(':subSpecialtyId')
    async  deletesubSpecialty(
      @Param('subSpecialtyId') 
      subSpecialtyId: number,
      @Res() res: Response
      ){
        await  this.subSpecialtySrevice.deleteSubSpecialty(subSpecialtyId);
        return res.status(200).json({message :'subSpecialty deleted successfully'});
    }
    @Put(':subSpecialtyId')
    async updateSubSpecialty(
      @Param('subSpecialtyId') subSpecialtyId: number,
      @Body() newData: CreateSubSpecialtyDto,
      @Res() res: Response
    ) {
      await this.subSpecialtySrevice.updateSubSpecialty(subSpecialtyId, newData);
      return res.status(200).json({message :'subSpecialty updated  successfully'});
    }
}
