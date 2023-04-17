import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { log } from 'console';
import { Admin } from 'src/typeorm/entities/admin';
import { Doctor } from 'src/typeorm/entities/doctors';
import { Specialty } from 'src/typeorm/entities/specialty';
import { AddDocrotSpecialtyParams, CreateAdminParams } from 'src/utils/types';

import { Not, Repository } from 'typeorm';

@Injectable()
export class AdminsService {
    constructor (
        @InjectRepository(Admin) 
        private adminRepository : Repository<Admin>
        // @InjectRepository(Doctor) 
        // private doctorRepository : Repository<Doctor>,
        // @InjectRepository(Specialty) 
        // private specialtyRepository : Repository<Specialty>,
        ){}



    findAdmins(){
        return this.adminRepository.find({ where:{ type : Not(1)}});
    }
    createAdmin(adminDetails : CreateAdminParams){
        const newAdmin = this.adminRepository.create({
            ...adminDetails,
            type : 2,
            createdAt : new Date()
        });
        return this.adminRepository.save(newAdmin);
    }
    // async addSpecialtyToDoctor(docrotSpecialtyIds : AddDocrotSpecialtyParams)
    // {
    //     const doctor = await this.doctorRepository.findOne({where: {id: docrotSpecialtyIds.doctorId}});
    //     if(!doctor){
    //     throw new NotFoundException()
    //     }
    //     const specialty = await this.specialtyRepository.findOne({where: {id: docrotSpecialtyIds.specialtyId}});
    //     if(!specialty){
    //     throw new NotFoundException()
    //     }
    //     await this.doctorSpecialtyRepository.save(docrotSpecialtyIds )
    // }
}
