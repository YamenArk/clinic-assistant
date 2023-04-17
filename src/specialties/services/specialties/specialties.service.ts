import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Specialty } from 'src/typeorm/entities/specialty';
import { SubSpecialty } from 'src/typeorm/entities/sub-specialty';
import { SpecialtyParams } from 'src/utils/types';
import { Repository } from 'typeorm';

@Injectable()
export class SpecialtiesService {
    constructor (
        @InjectRepository(Specialty) 
        private specialtyRepository : Repository<Specialty>,
        @InjectRepository(SubSpecialty) 
        private subSpecialtyRepository : Repository<SubSpecialty>
        ){}

       async findspecialties(){
              const specialties = await this.specialtyRepository.find({
                order: {
                  specialtyId: 'ASC',
              }},
              );
              if (specialties.length === 0) {
                throw new HttpException(`No specialties found`, HttpStatus.NOT_FOUND);
              }
              return specialties;
        }
        createspecialty(specialtyDetails : SpecialtyParams): Promise<Specialty>{
            const newSpecialty = this.specialtyRepository.create({
                ...specialtyDetails,
            });
            return this.specialtyRepository.save(newSpecialty);
        }
        async updatespecialty(specialtyId: number, newData: SpecialtyParams): Promise<void> {
            const specialty  = await this.specialtyRepository.findOne({where : {specialtyId : specialtyId}});
            if (!specialty ) {
                throw new HttpException(`specialty with id ${specialtyId} not found`, HttpStatus.NOT_FOUND);
              }
            const updatedspecialty = this.specialtyRepository.merge(specialty , newData);
            await this.specialtyRepository.save(updatedspecialty);
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
