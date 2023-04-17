import { BadRequestException, HttpException, HttpStatus, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateSubSpecialtyDto } from 'src/sub-specialties/dtos/CreateSubSpecialty.dto';
import { Specialty } from 'src/typeorm/entities/specialty';
import { SubSpecialty } from 'src/typeorm/entities/sub-specialty';
import { CreateSubSpecialtyParams } from 'src/utils/types';
import { Not, Repository } from 'typeorm';

@Injectable()
export class SubSpecialtiesService {
    constructor (
        @InjectRepository(SubSpecialty) 
        private subSpecialtyRepository : Repository<SubSpecialty>,
        @InjectRepository(Specialty) 
        private specialtyRepository : Repository<Specialty>
        // @InjectRepository(Specialty) 
        // private specialtyRepository : Repository<Specialty>,
        ){}        

        async createSubSpecialty(specialtyId: number,subSpecialtyDetails : CreateSubSpecialtyParams): Promise<SubSpecialty>{
            const subSpecialtyName = subSpecialtyDetails.subSpecialtyName;
            const specialty  = await this.specialtyRepository.findOne({where : {specialtyId : specialtyId}});
            if (!specialty ) {
                throw new HttpException(`specialty with id ${specialtyId} not found`, HttpStatus.NOT_FOUND);
              }
    

            const duplicates = await this.subSpecialtyRepository.findOne({
              where: {
                subSpecialtyName: subSpecialtyDetails.subSpecialtyName,
                specialty: {
                  specialtyId: specialty.specialtyId,
                },
              },
            })
            if(duplicates)
            {
                throw new HttpException(`this subSpecialty is alreadyExists`, HttpStatus.CONFLICT);
            }
            const newSubSpecialty = this.subSpecialtyRepository.create({
                ...subSpecialtyDetails,
            });
            newSubSpecialty.specialty = specialty;
            return this.subSpecialtyRepository.save(newSubSpecialty);
        }

        async updatespecialty(subSpecialtyId: number, newData: CreateSubSpecialtyParams): Promise<void> {

            const subSpecialty = await this.subSpecialtyRepository.findOne({
                where: { subSpecialtyId: subSpecialtyId },
                relations: ['specialty'],
              });
        
        
            if (!subSpecialty) {
                throw new NotFoundException(`subSpecialty with id "${subSpecialtyId}" not found`);
            }

            const specialty = subSpecialty.specialty;


            const duplicates = await this.subSpecialtyRepository.findOne({
              where: {
                subSpecialtyName: newData.subSpecialtyName,
                subSpecialtyId: Not(subSpecialtyId), 
                specialty: {
                  specialtyId: specialty.specialtyId,
                },
              },
            })

          if (duplicates) {
            throw new BadRequestException(`subSpecialty with name "${newData.subSpecialtyName}" already exists in this specialty"`);
          }

          subSpecialty.subSpecialtyName = newData.subSpecialtyName;

        await this.subSpecialtyRepository.save(subSpecialty);
  }
     
        async deleteSubSpecialty(subSpecialtyId: number): Promise<void> {
            const subSpecialty  = await this.subSpecialtyRepository.findOne({where : {subSpecialtyId : subSpecialtyId}});
            if (!subSpecialty ) {
                throw new HttpException(`subSpecialty with id ${subSpecialtyId} not found`, HttpStatus.NOT_FOUND);
                }
            await  this.subSpecialtyRepository.delete(subSpecialtyId);
        }

    }


