import { BadRequestException, HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { validate } from 'class-validator';
import { Specialty } from 'src/typeorm/entities/specialty';
import { SubSpecialty } from 'src/typeorm/entities/sub-specialty';
import { SpecialtyParams, filterNameParams } from 'src/utils/types';
import { Repository } from 'typeorm';

@Injectable()
export class SpecialtiesService {
    constructor (
        @InjectRepository(Specialty) 
        private specialtyRepository : Repository<Specialty>,
        @InjectRepository(SubSpecialty) 
        private subSpecialtyRepository : Repository<SubSpecialty>
        ){}
        async findSpecialties(page, perPage: number) {
          const specialties = await this.specialtyRepository.find({
            order: {
              specialtyId: 'ASC',
            },
            take: perPage,
            skip: (page - 1) * perPage,
          });
        
          const totalCount = await this.specialtyRepository.count();
        
          const totalPages = Math.ceil(totalCount / perPage);
        
          if (specialties.length === 0) {
            throw new HttpException(`No specialties found`, HttpStatus.NOT_FOUND);
          }
          const pageNumber = parseInt(page, 10); // Convert the string to an integer
        
          return  {specialties ,totalPages, currentPage: pageNumber, totalItems: totalCount} ;
        }
        
        async createspecialty(specialtyDetails : SpecialtyParams): Promise<void>{

          const specialty = await this.specialtyRepository.findOne({where : {specialtyName : specialtyDetails.specialtyName}});
          if (specialty) {
              throw new BadRequestException('Specialty name must be unique');
          }

            const newSpecialty = this.specialtyRepository.create({
                ...specialtyDetails,
            });
            // Validate the updatedDoctor object using class-validator
            const errors = await validate(newSpecialty);
            if (errors.length > 0) {
              throw new HttpException(`Validation failed: ${errors.join(', ')}`, HttpStatus.BAD_REQUEST);
            }

            await this.specialtyRepository.save(newSpecialty);

            const newSubSpecialty = this.subSpecialtyRepository.create({
              subSpecialtyName : 'عام',
            });


               // Validate the updatedDoctor object using class-validator
               const errorsSub = await validate(newSubSpecialty);
               if (errorsSub.length > 0) {
                 throw new HttpException(`Validation failed: ${errorsSub.join(', ')}`, HttpStatus.BAD_REQUEST);
               }

            newSubSpecialty.specialty = newSpecialty;
            await this.subSpecialtyRepository.save(newSubSpecialty);
        }


        

        async filterSpecialtyByName(filte :filterNameParams ){
          const query =  this.specialtyRepository.createQueryBuilder('specialty')
          .where('specialty.specialtyName LIKE :name', {
            name: `%${filte.filterName}%`,
          })
  
          const specialties = await query.getMany();
          if(specialties.length === 0)
          {
              throw new HttpException(`No specialty met the conditions `, HttpStatus.NOT_FOUND);
          }
          return {specialties : specialties};
  
        }



        async updatespecialty(specialtyId: number, newData: SpecialtyParams): Promise<void> {
            const specialty  = await this.specialtyRepository.findOne({where : {specialtyId : specialtyId}});
            if (!specialty ) {
                throw new HttpException(`specialty with id ${specialtyId} not found`, HttpStatus.NOT_FOUND);
              }
              // Create a new Doctor object with the updated properties
            const updatedSpecialty = this.specialtyRepository.create({ ...specialty, ...newData });



              // Check if the specialtyName is unique
              const existingSpecialty = await this.specialtyRepository.findOne({ where: { specialtyName: newData.specialtyName } });
              if (existingSpecialty && existingSpecialty.specialtyId !== specialtyId) {
                  throw new HttpException(`Specialty name must be unique`, HttpStatus.BAD_REQUEST);
              }
  

            // Validate the updatedDoctor object using class-validator
            const errors = await validate(updatedSpecialty);
            if (errors.length > 0) {
              throw new HttpException(`Validation failed: ${errors.join(', ')}`, HttpStatus.BAD_REQUEST);
            }

          
            await this.specialtyRepository.update({specialtyId},{...newData});
          }

        async deletespecialty(specialtyId: number): Promise<void> {
            const specialty  = await this.specialtyRepository.findOne({where : {specialtyId : specialtyId}});
            if (!specialty ) {
                throw new HttpException(`specialty with id ${specialtyId} not found`, HttpStatus.NOT_FOUND);
              }
            await this.specialtyRepository.delete(specialtyId);
            }
        

        async getAllSpecialtiesWithSubSpecialties(): Promise<Specialty[]> {
            return await this.specialtyRepository.find({ relations: ['subSpecialties'] });
          }
        async findAllSubsByspecialty(specialtyId: number): Promise<SubSpecialty[]> {
          const specialty = await this.specialtyRepository.findOne({where :{specialtyId : specialtyId}});
          if (!specialty) {
              throw new HttpException(`specialty with id ${specialtyId} not found`, HttpStatus.NOT_FOUND);
            }
            const subSpecialties = await this.subSpecialtyRepository.find({
              where: {
                specialty: {
                  specialtyId: specialty.specialtyId,
                }},
            });
            if(subSpecialties.length === 0)
            {
              throw new HttpException(`No subSpecialties found`, HttpStatus.NOT_FOUND);
            }
          return subSpecialties;
        }


}
