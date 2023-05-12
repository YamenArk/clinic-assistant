import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Area } from 'src/typeorm/entities/Area';
import { Governorate } from 'src/typeorm/entities/Governorate';
import { Repository } from 'typeorm';

@Injectable()
export class GovernoratesService {
    constructor (
        @InjectRepository(Governorate) 
        private governorateRepository : Repository<Governorate>,
        @InjectRepository(Area) 
        private areaRepository : Repository<Area>,
        ){}


        async findGovernorates(){
            const governorates =  await this.governorateRepository.find();
            return {governorates};
        }

        async findAreas(governorateId : number){
            const governorate = await this.governorateRepository.findOne({where :{governorateId : governorateId}});
            if (!governorate) {
                throw new HttpException(`governorate with id ${governorateId} not found`, HttpStatus.NOT_FOUND);
              }
            const Areas =  await this.areaRepository.find({
                where: {
                    governorate: {
                        governorateId: governorateId,
                    }},   
             });
            return {Areas};
        }
}
