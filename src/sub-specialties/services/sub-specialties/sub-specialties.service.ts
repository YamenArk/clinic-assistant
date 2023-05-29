import { BadRequestException, HttpException, HttpStatus, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { validate } from 'class-validator';
import { Specialty } from 'src/typeorm/entities/specialty';
import { SubSpecialty } from 'src/typeorm/entities/sub-specialty';
import { CreateSubSpecialtyParams, filterNameParams } from 'src/utils/types';
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


               // Validate the updatedDoctor object using class-validator
               const errors = await validate(newSubSpecialty);
               if (errors.length > 0) {
                 throw new HttpException(`Validation failed: ${errors.join(', ')}`, HttpStatus.BAD_REQUEST);
               }

            newSubSpecialty.specialty = specialty;
            return this.subSpecialtyRepository.save(newSubSpecialty);
        }


        
        async filtersubSpecialtiesByName(filte :filterNameParams ,specialtyId : number){
          const query =  this.subSpecialtyRepository.createQueryBuilder('subSpecialty')
          .andWhere({
            specialty: {
              specialtyId: specialtyId
            }
          })
          .andWhere('subSpecialty.subSpecialtyName LIKE :name', {
            name: `%${filte.filterName}%`,
          })
       
  
          const subSpecialties = await query.getMany();
          if(subSpecialties.length === 0)
          {
              throw new HttpException(`No subSpecialties met the conditions `, HttpStatus.NOT_FOUND);
          }
          return {subSpecialties : subSpecialties};
  
        }


        async updateSubSpecialty(subSpecialtyId: number, newData: CreateSubSpecialtyParams): Promise<void> {

            const subSpecialty = await this.subSpecialtyRepository.findOne({
                where: { subSpecialtyId: subSpecialtyId },
                relations: ['specialty'],
              });
            if (!subSpecialty) {
                throw new NotFoundException(`subSpecialty with id "${subSpecialtyId}" not found`);
            }

              // Create a new Doctor object with the updated properties
              const updatedsubSpecialty = this.subSpecialtyRepository.create({ ...subSpecialty, ...newData });

              // Validate the updatedDoctor object using class-validator
              const errors = await validate(updatedsubSpecialty);
              if (errors.length > 0) {
                throw new HttpException(`Validation failed: ${errors.join(', ')}`, HttpStatus.BAD_REQUEST);
              }

            const duplicates = await this.subSpecialtyRepository.findOne({
              where: {
                subSpecialtyName: newData.subSpecialtyName,
                subSpecialtyId: Not(subSpecialtyId), 
                specialty: {
                  specialtyId: subSpecialty.specialty.specialtyId,
                },
              },
            })

          if (duplicates) {
            throw new BadRequestException(`subSpecialty with name "${newData.subSpecialtyName}" already exists in this specialty"`);
          }

          await this.subSpecialtyRepository.update({subSpecialtyId},{...newData});
  }
     
        async deleteSubSpecialty(subSpecialtyId: number): Promise<void> {
            const subSpecialty  = await this.subSpecialtyRepository.findOne({where : {subSpecialtyId : subSpecialtyId}});
            if (!subSpecialty ) {
                throw new HttpException(`subSpecialty with id ${subSpecialtyId} not found`, HttpStatus.NOT_FOUND);
                }
            await  this.subSpecialtyRepository.delete(subSpecialtyId);
        }

    }


