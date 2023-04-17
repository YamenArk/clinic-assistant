import { BadRequestException, HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { doc } from 'prettier';
import { Doctor } from 'src/typeorm/entities/doctors';
import { Insurance } from 'src/typeorm/entities/insurance';
import { InsuranceParams } from 'src/utils/types';
import { Not, Repository } from 'typeorm';

@Injectable()
export class InsurancesService {
    constructor (
      @InjectRepository(Insurance) 
      private insuranceRepository : Repository<Insurance>
      )
    {

    }
    

    findInsurances():Promise<Insurance[]>{
        return this.insuranceRepository.find();
    }
    async createInsurance(insuranceDetails: InsuranceParams):Promise<Insurance>{
        const insurance  = await this.insuranceRepository.findOne({where : {companyName : insuranceDetails.companyName}});
        if (insurance ) {
            throw new BadRequestException(`insurance company with the name "${insuranceDetails.companyName}" already exists in database"`);
          }
        const newInsurance = this.insuranceRepository.create({
            ...insuranceDetails,
        })
        return this.insuranceRepository.save(newInsurance);
    }
    async updateInsurance(insuranceId:number,insuranceDetails: InsuranceParams): Promise<void>{
        const insurance  = await this.insuranceRepository.findOne({where : {insuranceId : insuranceId}});
        if (!insurance ) {
            throw new HttpException(`insurance with id ${insuranceId} not found`, HttpStatus.NOT_FOUND);
          }
        const duplicates = await this.insuranceRepository.findOne({
            where: {
                companyName: insuranceDetails.companyName,
                insuranceId: Not(insuranceId),
            },
          })
          if (duplicates) {
            throw new BadRequestException(`insurance company with name "${insuranceDetails.companyName}" already exists in database"`);
          }
        await this.insuranceRepository.update({insuranceId},{...insuranceDetails});
    }
    async deleteInsurance(insuranceId: number): Promise<void> {
        const insurance  = await this.insuranceRepository.findOne({where : {insuranceId : insuranceId}});
        if (!insurance ) {
            throw new HttpException(`insurance with id ${insuranceId} not found`, HttpStatus.NOT_FOUND);
          }
        await this.insuranceRepository.delete(insuranceId);
    }
  }
