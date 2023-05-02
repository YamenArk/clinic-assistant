import { BadRequestException, HttpException, HttpStatus, Injectable, UseInterceptors } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { validate } from 'class-validator';
import { createWriteStream } from 'fs';
import { CACHE_MANAGER, CacheInterceptor, CacheModule } from '@nestjs/common'; // import CACHE_MANAGER
import { Doctor } from 'src/typeorm/entities/doctors';
import { Insurance } from 'src/typeorm/entities/insurance';
import { SubSpecialty } from 'src/typeorm/entities/sub-specialty';
import {  CreateDoctorParams, UpdateDoctorForAdminParams, UpdateDoctorParams, filterDocrotsParams } from 'src/utils/types';
import { Repository } from 'typeorm';
import { MailService } from 'src/middleware/mail/mail.service';
import { Inject } from '@nestjs/common';
import { FindManyOptions } from 'typeorm';
import { DoctorClinic } from 'src/typeorm/entities/doctor-clinic';
import { Clinic } from 'src/typeorm/entities/clinic';
@Injectable()
@UseInterceptors(CacheInterceptor)
export class DoctorsService {
    constructor (
        @InjectRepository(Clinic) 
        private clinicRepository : Repository<Clinic>,       
        @InjectRepository(DoctorClinic) 
        private doctorClinicRepository : Repository<DoctorClinic>,
        @InjectRepository(Doctor) 
        private doctorRepository : Repository<Doctor>,
        @InjectRepository(Insurance) 
        private insuranceRepository : Repository<Insurance>,
        @InjectRepository(SubSpecialty) 
        private subSpecialtyRepository : Repository<SubSpecialty>,
        private readonly mailService: MailService,
        @Inject(CACHE_MANAGER)
        private readonly cacheManager: any, // update the type of cacheManager to any
        ){}



      //admin

      async createDoctor(doctorDetails: CreateDoctorParams): Promise<Doctor> {
        const { email, phonenumberForAdmin, gender, firstname, lastname, clinics, subSpecialties, insurances } = doctorDetails;
    
        const duplicates = await this.doctorRepository.findOne({ where: { email: doctorDetails.email } });
            if (duplicates) {
              throw new BadRequestException(`doctor with name "${doctorDetails.email}" already exists"`);
            }
        // create a new Doctor entity
        const doctor = new Doctor();
        doctor.email = email;
        doctor.phonenumberForAdmin = phonenumberForAdmin;
        doctor.gender = gender;
        doctor.firstname = firstname;
        doctor.lastname = lastname;
    
        // retrieve Clinic, SubSpecialty, and Insurance entities from database using their IDs
        const clinicsArray = await Promise.all(clinics.map(async clinic => {
          const clinicEntity = await this.clinicRepository.findOne({ where: { clinicId: clinic.clinicId }, relations: ['doctorClinic'] });
          if (!clinicEntity) {
            throw new BadRequestException("One or more clinics not found in the database");
          }
          return clinicEntity;
        }));
        
        
        const subSpecialtiesArray = await this.subSpecialtyRepository.findByIds(subSpecialties.map(subSpecialty => subSpecialty.subSpecialtyId))


        const insurancesArray = await this.insuranceRepository.findByIds(insurances.map(insurance => insurance.insuranceId));

        

        //Throw an exception when an ID in  subSpecialties, or insurances does not exist in the database
        if (subSpecialties.some(subSpecialty => !subSpecialtiesArray.find(subSpecialtyEntity => subSpecialtyEntity.subSpecialtyId === subSpecialty.subSpecialtyId))) {
          throw new BadRequestException("One or more subSpecialties not found in the database");
        }

        if (insurances.some(insurance => !insurancesArray.find(insuranceEntity => insuranceEntity.insuranceId === insurance.insuranceId))) {
          throw new BadRequestException("One or more insurances not found in the database");
        }
              
    

        // add the retrieved entities to the Doctor entity
        doctor.subSpecialty = subSpecialtiesArray;
        doctor.insurance = insurancesArray;


        doctor.active = true
        doctor.appointmentDuring = 20
        doctor.evaluate = 3;
        doctor.numberOfPeopleWhoVoted = 0;
         // Validate the updatedDoctor object using class-validator
         const errors = await validate(doctor);
         if (errors.length > 0) {
           throw new HttpException(`Validation failed: ${errors.join(', ')}`, HttpStatus.BAD_REQUEST);
         }

        // save the new Doctor entity to the database
        const newDoctor = await this.doctorRepository.save(doctor);
    
        // associate the Doctor with the Clinics using DoctorClinic entities
        const doctorClinicEntities = clinicsArray.map(clinic => {
          const doctorClinic = new DoctorClinic();
          doctorClinic.doctor = newDoctor;
          doctorClinic.clinic = clinic;
          return doctorClinic;
        });



        await this.doctorClinicRepository.save(doctorClinicEntities);
    
    
        return newDoctor;
      }

      async updateDoctorforAdmin(doctorId: number, doctorDetails: UpdateDoctorForAdminParams) {
        const doctor  = await this.doctorRepository.findOne({where : {doctorId : doctorId}});
        if (!doctor ) {
            throw new HttpException(`doctor with id ${doctorId} not found`, HttpStatus.NOT_FOUND);
          }
        // Create a new Doctor object with the updated properties
        const updatedDoctor = this.doctorRepository.create({ ...doctor, ...doctorDetails });
  
        // Validate the updatedDoctor object using class-validator
        const errors = await validate(updatedDoctor);
        if (errors.length > 0) {
          throw new HttpException(`Validation failed: ${errors.join(', ')}`, HttpStatus.BAD_REQUEST);
        }
  
        // Update the doctor in the database
        await this.doctorRepository.update(doctorId, doctorDetails);
  
        // Return the updated doctor
        return this.doctorRepository.update({doctorId},{...doctorDetails});
      }

      async findDoctors(type?: number) {
        const select: Array<keyof Doctor> =['active', 'phonenumberForAdmin', 'email', 'firstname', 'lastname', 'doctorId'];
        let where: any = {};
        if (type == 1) {
          where = { active: true };
        } else if (type == 2) {
          where = { active: false };
        }
        const doctors = await this.doctorRepository.find({
          select,
          where ,
        });
        return { doctors };
      }


       async addDoctorToInsuranceCompany(
        doctorId: number,
        insuranceId: number,
      ): Promise<void> {
        const doctor = await this.doctorRepository.findOne({
          where: {
            doctorId: doctorId,
          },
          relations: ['insurance'],
        });
        if (!doctor ) {
          throw new HttpException(`doctor with id ${doctorId} not found`, HttpStatus.NOT_FOUND);
        }
        const insurance  = await this.insuranceRepository.findOne({where : {insuranceId : insuranceId}});
        if (!insurance ) {
            throw new HttpException(`insurance with id ${insuranceId} not found`, HttpStatus.NOT_FOUND);
          }

          const relationExists = doctor.insurance.find(insurance => insurance.insuranceId === insuranceId);

          if(relationExists)
          {
            throw new HttpException('Doctor is already associated with insurance', HttpStatus.NOT_FOUND);
          }

          doctor.insurance.push(insurance);
        await this.doctorRepository.save(doctor);
      }
      async removeDoctorFromInsuranceCompany(
        doctorId: number,
        insuranceId: number,
      ): Promise<void> {
        const doctor = await this.doctorRepository.findOne({
          where: {
            doctorId: doctorId,
          },
          relations: ['insurance'],
        });
        if (!doctor) {
          throw new HttpException(
            `Doctor with id ${doctorId} not found`,
            HttpStatus.NOT_FOUND,
          );
        }
    
        const insurance = await this.insuranceRepository.findOne({
          where: {
            insuranceId: insuranceId,
          },
        });
        if (!insurance) {
          throw new HttpException(
            `Insurance with id ${insuranceId} not found`,
            HttpStatus.NOT_FOUND,
          );
        }
        
        const relationExists = doctor.insurance.find(insurance => insurance.insuranceId === insuranceId);

        if(!relationExists)
        {
          throw new HttpException('Doctor is not associated with insurance', HttpStatus.NOT_FOUND);
        }

        doctor.insurance = doctor.insurance.filter(
          (i) => i.insuranceId !== insurance.insuranceId,
        );
        await this.doctorRepository.save(doctor);
      }

      async addDoctorToSubSpecialty(
        doctorId: number,
        subSpecialtyId: number,
      ): Promise<void> {
        const doctor = await this.doctorRepository.findOne({
          where: {
            doctorId: doctorId,
          },
          relations: ['subSpecialty'],
        });
        if (!doctor ) {
          throw new HttpException(`doctor with id ${doctorId} not found`, HttpStatus.NOT_FOUND);
        }
        const subSpecialty  = await this.subSpecialtyRepository.findOne({where : {subSpecialtyId : subSpecialtyId}});
        if (!subSpecialty ) {
            throw new HttpException(`subSpecialty with id ${subSpecialtyId} not found`, HttpStatus.NOT_FOUND);
          }

        const relationExists = doctor.subSpecialty.find(subSpecialty => subSpecialty.subSpecialtyId === subSpecialtyId);

          if(relationExists)
          {
            throw new HttpException('Doctor is already associated with subSpecialty', HttpStatus.NOT_FOUND);
          }
          doctor.subSpecialty.push(subSpecialty);
        await this.doctorRepository.save(doctor);
      } 

      async removeDoctorFromSubSpecialty(
        doctorId: number,
        subSpecialtyId: number,
      ): Promise<void> {
        const doctor = await this.doctorRepository.findOne({
          where: {
            doctorId: doctorId,
          },
          relations: ['subSpecialty'],
        });
        if (!doctor) {
          throw new HttpException(
            `Doctor with id ${doctorId} not found`,
            HttpStatus.NOT_FOUND,
          );
        }
        const subSpecialty = await this.subSpecialtyRepository.findOne({
          where: {
            subSpecialtyId: subSpecialtyId,
          },
        });
        if (!subSpecialty) {
          throw new HttpException(
            `subSpecialty with id ${subSpecialty} not found`,
            HttpStatus.NOT_FOUND,
          );
        }
    
            
        const relationExists = doctor.subSpecialty.find(subSpecialty => subSpecialty.subSpecialtyId === subSpecialtyId);

        if(!relationExists)
        {
          throw new HttpException('Doctor is not associated with subSpecialty', HttpStatus.NOT_FOUND);
        }

        doctor.subSpecialty = doctor.subSpecialty.filter(
          (i) => i.subSpecialtyId !== subSpecialty.subSpecialtyId,
        );
        await this.doctorRepository.save(doctor);
      }

      //doctor
      async updateDoctor(doctorId: number, doctorDetails: UpdateDoctorParams, file: Express.Multer.File) {

        const doctor  = await this.doctorRepository.findOne({where : {doctorId : doctorId}});
        if (!doctor ) {
            throw new HttpException(`doctor with id ${doctorId} not found`, HttpStatus.NOT_FOUND);
          }
        // Create a new Doctor object with the updated properties
        const updatedDoctor = this.doctorRepository.create({ ...doctor, ...doctorDetails });
  
        // Validate the updatedDoctor object using class-validator
        const errors = await validate(updatedDoctor);
        if (errors.length > 0) {
          throw new HttpException(`Validation failed: ${errors.join(', ')}`, HttpStatus.BAD_REQUEST);
        }
  
  
        // If a file is provided, save it to disk and set the profilePicture property
        if (file) {
          const filename = `${doctorId}_${file.originalname}`;
          const uploadPath = 'C:/Users/ASUS/Desktop/nestjs-projects/clinic-assistant/public/dolctors/' + filename;
  
          await new Promise((resolve, reject) => {
            const stream = createWriteStream(uploadPath);
            stream.on('finish', resolve);
            stream.on('error', reject);
            stream.write(file.buffer);
            stream.end();
          });
  
          // doctorDetails.profilePicture = filename;
          doctorDetails.profilePicture = uploadPath;
        }
        // Update the doctor in the database
        await this.doctorRepository.update(doctorId, doctorDetails);
  
        // Return the updated doctor
        return this.doctorRepository.update({doctorId},{...doctorDetails});
      }

      async sendResetEmail(email: string): Promise<number> {
        const doctor = await this.doctorRepository.findOne({where: {email : email}});

        if (!doctor) {
          throw new HttpException(
            `Doctor not found`,
            HttpStatus.NOT_FOUND,
          );
        }    
        const code = Math.floor(10000 + Math.random() * 90000);
        const message = `Please reset your password using this code: ${code}`;
        await this.mailService.sendMail(doctor.email , 'Password reset', message);
      
        // Cache the generated code for 5 minutes
        const cacheKey = `resetCode-${doctor.doctorId}`;
        await this.cacheManager.set(cacheKey, code, { ttl: 300 });
      
        return code;
      }
    
      async resetPassword(doctorId: number, code: number, newPassword: string): Promise<void> {
        const doctor = await this.doctorRepository.findOne({where: {doctorId : doctorId}});
        
        if (!doctor) {
          throw new HttpException(
            `Doctor with id ${doctorId} not found`,
            HttpStatus.NOT_FOUND,
          );
        }
      
        const cacheKey = `resetCode-${doctor.doctorId}`;
        const cachedCode = await this.cacheManager.get(cacheKey);
      
        if (!cachedCode || cachedCode !== code) {
          throw new HttpException(
            `Invalid reset code for doctor with id ${doctor.doctorId}`,
            HttpStatus.BAD_REQUEST,
          );
        }
      
        doctor.password = newPassword;
        await this.doctorRepository.save(doctor);
      }



      //patient
      async getDoctorsWithAllTheirInformation()
      {
        const doctors = await this.doctorRepository.createQueryBuilder('doctor')
        .select([
          'doctor.doctorId',
          'doctor.description',
          'doctor.active',
          'doctor.gender',
          'doctor.profilePicture',
          'doctor.firstname',
          'doctor.lastname',
          'doctor.appointmentDuring',
          'doctor.evaluate',
          'doctor.numberOfPeopleWhoVoted',
          'doctor.checkupPrice',
          'doctor.phoneNumber',
          'doctor.createdAt',
          'subSpecialty.subSpecialtyName',
          'specialty.specialtyName',
          'doctorClinic.id',
          'clinic.clinicId',
          'clinic.clinicName',
          'clinic.location',
          'clinic.locationId',
          'clinic.createdAt',
          'clinic.phonenumber',
        ])
        .leftJoin('doctor.subSpecialty', 'subSpecialty')
        .leftJoin('subSpecialty.specialty', 'specialty')
        .leftJoin('doctor.doctorClinic', 'doctorClinic')
        .leftJoin('doctorClinic.clinic', 'clinic')
        .getMany();
      
      if (doctors.length === 0) {
        throw new HttpException(`No doctors found`, HttpStatus.NOT_FOUND);
      }

      return { doctors };

      }

      async filterDocrots(filterDetasils : filterDocrotsParams)
      {
          const query =  this.doctorRepository.createQueryBuilder('doctor')
          .leftJoin('doctor.subSpecialty', 'subSpecialty')
          .leftJoin('doctor.insurance', 'insurance')
  
  
                  
          if (filterDetasils.gender !== undefined) {
              query.andWhere('doctor.gender = :gender', { gender: filterDetasils.gender });
          }
          
          if (filterDetasils.subSpecialtyId !== undefined) {
              query.andWhere('subSpecialty.subSpecialtyId = :subSpecialtyId', { subSpecialtyId: filterDetasils.subSpecialtyId });
          }
          
          if (filterDetasils.insuranceId !== undefined) {
              query.andWhere('insurance.insuranceId = :insuranceId', { insuranceId: filterDetasils.insuranceId });
          }
  
          const doctors = await query.getMany();
          if(doctors.length === 0)
          {
              throw new HttpException(`No doctor met the conditions `, HttpStatus.NOT_FOUND);
          }
          return doctors;
      }


    }






    
        
    // async findDoctors() {

    //   try {
    //     const doctors = await this.doctorRepository.find({
    //       relations: ['subSpecialty', 'subSpecialty.specialty'],
    //     });
    
    //     const specialtiesMap = new Map();
    
    //     for (const doctor of doctors) {
    //       for (const subSpecialty of doctor.subSpecialty) {
    //         const { subSpecialtyId, subSpecialtyName, specialty } = subSpecialty;
    //         const { specialtyId, specialtyName } = specialty;
    
    //         const specialtyObj = specialtiesMap.get(specialtyId) ?? {
    //           specialtyId,
    //           specialtyName,
    //           subSpecialties: [],
    //           length: 0,
    //         };
    
    //         const subSpecialtyObj = {
    //           subSpecialtyId,
    //           subSpecialtyName,
    //         };
    
    //         specialtyObj.subSpecialties.push(subSpecialtyObj);
    //         specialtyObj.length++;
    
    //         specialtiesMap.set(specialtyId, specialtyObj);
    //       }
    //     }
    
    //     const specialties = Array.from(specialtiesMap.values());
    
    //     const output = doctors.map((doctor) => {
    //       const { doctorId, firstname, lastname, phonenumberForAdmin, evaluate, profilePicture } = doctor;
    
    //       const doctorSpecialties = doctor.subSpecialty.map((subSpecialty) => {
    //         const { subSpecialtyId, subSpecialtyName, specialty } = subSpecialty;
    //         const { specialtyId } = specialty;
    //         const specialtyObj = specialties.find((specialty) => specialty.specialtyId === specialtyId);
    //         return {
    //           subSpecialtyId,
    //           subSpecialtyName,
    //           specialty: specialtyObj,
    //         };
    //       });
    
    //       return {
    //         doctorId,
    //         firstname,
    //         lastname,
    //         phonenumberForAdmin,
    //         evaluate,
    //         profilePicture,
    //         specialties: doctorSpecialties,
    //       };
    //     });
    
    //     return output;
    //   } catch (error) {
    //     // Handle error
    //   }
    // }