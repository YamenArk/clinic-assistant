import { BadRequestException, CACHE_MANAGER, HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { MailService } from 'src/middleware/mail/mail.service';
import { Admin } from 'src/typeorm/entities/admin';
import { Clinic } from 'src/typeorm/entities/clinic';
import { DoctorClinic } from 'src/typeorm/entities/doctor-clinic';
import { Doctor } from 'src/typeorm/entities/doctors';
import { Secretary } from 'src/typeorm/entities/secretary';
import { createSecretaryParams } from 'src/utils/types';
import {  Repository } from 'typeorm';

@Injectable()
export class SecretariesService {
    constructor (
        private jwtService : JwtService,
        @InjectRepository(DoctorClinic) 
        private doctorClinicRepository : Repository<DoctorClinic>,
        @InjectRepository(Clinic) 
        private clinicRepository : Repository<Clinic>,
        @InjectRepository(Doctor) 
        private doctorRepository : Repository<Doctor>,
        @InjectRepository(Admin) 
        private adminRepository : Repository<Admin>,
        @InjectRepository(Secretary) 
        private secretaryRepository : Repository<Secretary>,
        private readonly mailService: MailService,
        @Inject(CACHE_MANAGER)
        private readonly cacheManager: any, // update the type of cacheManager to any
        ){}
    async createSecretary(createSecretaryDetails : createSecretaryParams){

        const email = createSecretaryDetails.email;
        //doctor duplicates
        const doctorDuplicates = await this.doctorRepository.findOne({ where: { email: email } });
        if (doctorDuplicates) {
        throw new BadRequestException(`"${email}" already exists"`);
        }

        //admin duplicates
        const adminDuplicates = await this.adminRepository.findOne({ where: { email: email } });
        if (adminDuplicates) {
            throw new BadRequestException(`"${email}" already exists"`);
        }

        //secretary duplicates
        const secretaryDuplicates = await this.secretaryRepository.findOne({ where: { email:email } });
        if (secretaryDuplicates) {
            throw new BadRequestException(`"${email}" already exists"`);
        }
        const newSecretary = this.secretaryRepository.create({
            ...createSecretaryDetails,
          });
        await this.secretaryRepository.save(newSecretary);
    }

    async getSecretaryByprivateId(privateId : string){
        const secretary = await this.secretaryRepository.findOne({
             where: { privateId :  privateId},
             select : ['secretaryId','firstname','lastname','age','phonenumber'] 
            });
        if (!secretary) {
            throw new HttpException(
                `secretar with privateId ${privateId} not found`,
                HttpStatus.NOT_FOUND,
              );
        }
        return {secretary : secretary}
    }

    async getSecretaryBysecretaryId(secretaryId : number){
        const secretary = await this.secretaryRepository.findOne({
             where: { secretaryId :  secretaryId},
             select : ['secretaryId','firstname','lastname','age','phonenumber'] 
            });
        if (!secretary) {
            throw new HttpException(
                `secretar with secretaryId ${secretaryId} not found`,
                HttpStatus.NOT_FOUND,
              );
        }
        return {secretary : secretary}
    }

    async deletesecretaryToClinic(clinicId : number ,doctorId : number){
        const clinic = await this.clinicRepository.findOne({ where: { clinicId :  clinicId} });
        if (!clinic) {
            throw new HttpException(
                `clinic with id ${clinicId} not found`,
                HttpStatus.NOT_FOUND,
              );
        }
        const doctorClinic = await this.doctorClinicRepository.findOne({where : {
            doctor :{
                doctorId : doctorId
            },
            clinic : {
                clinicId : clinicId
            }
        }})
        if(!doctorClinic)
        {
            throw new BadRequestException(`you cant controll clinic that is not yuors`);
        }
        doctorClinic.secretary = null;
        await this.doctorClinicRepository.save(doctorClinic);
    }



    async addsecretaryToClinic(clinicId : number , secretaryId : number,doctorId : number){
        const secretary = await this.secretaryRepository.findOne({ where: { secretaryId :  secretaryId} });
        if (!secretary) {
            throw new HttpException(
                `secretar with id ${secretaryId} not found`,
                HttpStatus.NOT_FOUND,
              );
        }
        const clinic = await this.clinicRepository.findOne({ where: { clinicId :  clinicId} });
        if (!clinic) {
            throw new HttpException(
                `clinic with id ${clinicId} not found`,
                HttpStatus.NOT_FOUND,
              );
        }
        const doctorClinic = await this.doctorClinicRepository.findOne({where : {
            doctor :{
                doctorId : doctorId
            },
            clinic : {
                clinicId : clinicId
            }
        }})
        if(!doctorClinic)
        {
            throw new BadRequestException(`you cant controll clinic that is not yuors`);
        }
        doctorClinic.secretary = secretary;
        await this.doctorClinicRepository.save(doctorClinic);
    }
}
