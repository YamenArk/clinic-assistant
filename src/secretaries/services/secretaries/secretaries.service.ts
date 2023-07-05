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
import * as bcrypt from 'bcryptjs'


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

    async getSecretaryClinicId(clinicId : number,doctorId:number){
        const clinic = await this.clinicRepository.findOne({ where: { clinicId :  clinicId} });
        if (!clinic) {
            throw new HttpException(
                `clinic with id ${clinicId} not found`,
                HttpStatus.NOT_FOUND,
              );
        }

        const doctorClinic = await this.doctorClinicRepository
        .createQueryBuilder('doctorClinic')
        .leftJoinAndSelect('doctorClinic.secretary', 'secretary')
        .select([
          'doctorClinic.id',
          'doctorClinic.clinicClinicId',
          'doctorClinic.doctorDoctorId',
          'secretary.secretaryId',
          'secretary.email',
          'secretary.phonenumber',
          'secretary.firstname',
          'secretary.lastname',
          'secretary.age',
        ])
        .where({
          doctor: { doctorId: doctorId },
          clinic: { clinicId: clinicId },
        })
        .getOne();
      
      if (!doctorClinic || !doctorClinic.secretary) {
        throw new BadRequestException(`You do not have a secretary in the clinic`);
      }
        return {secretary : doctorClinic.secretary}
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

    async getMyAccount(secretaryId : number){
        if(!secretaryId)
        {
            throw new BadRequestException('thier is something wrong with the tonken')
        }
        const secretary = await this.secretaryRepository.findOne({
            where : {
                secretaryId : secretaryId
            },
            select :['secretaryId','email','phonenumber','firstname','lastname','age','privateId']
        })
        if(!secretary)
        {
            throw new HttpException(
                `secretary with id ${secretaryId} not found`,
                HttpStatus.NOT_FOUND,
              );
        }
        return secretary;
    }


    
    
      async resetPassword(secretaryId: number, code: number, newPassword: string): Promise<void> {
        const secretary = await this.secretaryRepository.findOne({where: {secretaryId : secretaryId}});
        
        if (!secretary) {
          throw new HttpException(
            `Doctor with id ${secretaryId} not found`,
            HttpStatus.NOT_FOUND,
          );
        }
      
        const cacheKey = `resetCode-${secretary.secretaryId}`;
        const cachedCode = await this.cacheManager.get(cacheKey);
      
        if (!cachedCode || cachedCode !== code) {
          throw new HttpException(
            `Invalid reset code for secretary with id ${secretary.secretaryId}`,
            HttpStatus.BAD_REQUEST,
          );
        }
        const hashedPassword = await bcrypt.hash(newPassword, 10); // hash the password
        secretary.password = hashedPassword;
        await this.secretaryRepository.save(secretary);
      }




}
