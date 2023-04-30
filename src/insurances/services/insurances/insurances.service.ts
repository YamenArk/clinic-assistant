import { BadRequestException, HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { validate } from 'class-validator';
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

        // Validate the newInsurance object using class-validator
        const errors = await validate(newInsurance);
        if (errors.length > 0) {
          const errorMessages = errors.map((error) => Object.values(error.constraints).join(', ')).join(', ');
          throw new HttpException(`Validation error: ${errorMessages}`, HttpStatus.BAD_REQUEST);
        }
        return this.insuranceRepository.save(newInsurance);
    }
    async updateInsurance(insuranceId:number,insuranceDetails: InsuranceParams): Promise<void>{
        const insurance  = await this.insuranceRepository.findOne({where : {insuranceId : insuranceId}});
        if (!insurance ) {
            throw new HttpException(`insurance with id ${insuranceId} not found`, HttpStatus.NOT_FOUND);
          }

            // Create a new Doctor object with the updated properties
            const updatedClinic = this.insuranceRepository.create({ ...insurance, ...insuranceDetails });

            // Validate the updatedDoctor object using class-validator
            const errors = await validate(updatedClinic);
            if (errors.length > 0) {
              throw new HttpException(`Validation failed: ${errors.join(', ')}`, HttpStatus.BAD_REQUEST);
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
