import { BadRequestException, CACHE_MANAGER, HttpException, HttpStatus, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { MailService } from 'src/middleware/mail/mail.service';
import { Admin } from 'src/typeorm/entities/admin';
import { Clinic } from 'src/typeorm/entities/clinic';
import { DoctorClinic } from 'src/typeorm/entities/doctor-clinic';
import { Doctor } from 'src/typeorm/entities/doctors';
import { Secretary } from 'src/typeorm/entities/secretary';
import { createSecretaryParams } from 'src/utils/types';
import {  MoreThanOrEqual, Repository } from 'typeorm';
import * as bcrypt from 'bcryptjs'
import { async } from 'rxjs';
import { WorkTime } from 'src/typeorm/entities/work-time';
import { Appointment } from 'src/typeorm/entities/appointment';
import { Patient } from 'src/typeorm/entities/patient';


@Injectable()
export class SecretariesService {
    constructor (
        private jwtService : JwtService,
        @InjectRepository(Patient) 
        private patientRepository : Repository<Patient>,
        @InjectRepository(Appointment) 
        private appointmentRepository : Repository<Appointment>,
        @InjectRepository(WorkTime) 
        private workTimeRepository : Repository<WorkTime>,
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

    async getMyDoctors(secretaryId : number){
        const secretary = await this.secretaryRepository.findOne({
            where : {
                secretaryId : secretaryId
            },
        })
        if(!secretary)
        {
            throw new HttpException(
                `secretary with id ${secretaryId} not found`,
                HttpStatus.NOT_FOUND,
              );
        }
        const doctors = await this.doctorClinicRepository.query(`
        SELECT DISTINCT doctors.doctorId, doctors.firstname, doctors.lastname, doctors.profilePicture
        FROM doctorclinics
        INNER JOIN doctors ON doctorclinics.doctorDoctorId = doctors.doctorId
        WHERE doctorclinics.secretaryId = ${secretaryId}
      `);
      return doctors;
    }

    async getclinics(secretaryId : number ,doctorId : number){
        const secretary = await this.secretaryRepository.findOne({
            where : {
                secretaryId : secretaryId
            },
        })
        if(!secretary)
        {
            throw new HttpException(
                `secretary with id ${secretaryId} not found`,
                HttpStatus.NOT_FOUND,
              );
        }
        const doctor = await this.doctorRepository.findOne({
            where : {
                doctorId : doctorId
            },
        })
        if(!doctor)
        {
            throw new HttpException(
                `doctor with id ${doctorId} not found`,
                HttpStatus.NOT_FOUND,
              );
        }
        const clinics = this.doctorClinicRepository.find({
            relations : ['clinic'],
            where :{
                doctor :{
                    doctorId : doctorId
                },
                secretary : {
                    secretaryId : secretaryId
                }
            },
            select :{
                id : true,
                clinic : {
                    clinicId : true,
                    clinicName : true
                }
            }
        })
        return clinics;
    }

    async getWorkTime(clinicId : number, doctorId : number,secretaryId : number){
        const secretary = await this.secretaryRepository.findOne({
            where : {
                secretaryId : secretaryId
            },
        })
        if(!secretary)
        {
            throw new HttpException(
                `secretary with id ${secretaryId} not found`,
                HttpStatus.NOT_FOUND,
              );
        }
        const doctor = await this.doctorRepository.findOne({
            where : {
                doctorId : doctorId
            },
        })
        if(!doctor)
        {
            throw new HttpException(
                `doctor with id ${doctorId} not found`,
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
        const relation = await this.doctorClinicRepository.findOne({
            where : {
                doctor : {
                    doctorId : doctorId
                },
                clinic : {
                    clinicId : clinicId
                },
                secretary :{
                    secretaryId : secretaryId
                }
            }
        })
        if(!relation)
        {
            throw new HttpException(
                `you are not connecting to this doctor in this clinic`,
                HttpStatus.UNAUTHORIZED,
              );
        }

        
        const now = new Date();
        const today = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));

        const workTime = await this.workTimeRepository.find({
          where: {
            doctor: { doctorId },
            clinic: { clinicId },
            date: MoreThanOrEqual(today.toISOString())
          }
        });
        if(workTime.length == 0)
        {
          throw new NotFoundException(
            `you have no set any worktime in this clinic clinic ${clinic.clinicId}`
          );
        }
      
        // return {worktimes : workTimeWithAppointments};
        return {workTimes : workTime}
    }

    async getAppoitment(workTimeId : number, secretaryId : number){
        const workTime = await this.workTimeRepository.findOne({
            relations : ['clinic','doctor'],
            where : {workTimeId : workTimeId}
        });
        if (!workTime ) {
          throw new HttpException(`workTime with id ${workTimeId} not found`, HttpStatus.NOT_FOUND);
        }
        const secretary = await this.secretaryRepository.findOne({
            where : {
                secretaryId : secretaryId
            },
        })
        if(!secretary)
        {
            throw new HttpException(
                `secretary with id ${secretaryId} not found`,
                HttpStatus.NOT_FOUND,
              );
        }

        const relation = await this.doctorClinicRepository.findOne({
            where : {
                doctor : {
                    doctorId : workTime.doctor.doctorId
                },
                clinic : {
                    clinicId : workTime.clinic.clinicId
                },
                secretary :{
                    secretaryId : secretaryId
                }
            }
        })
        if(!relation)
        {
            throw new HttpException(
                `you are not connecting to this doctor in this clinic`,
                HttpStatus.UNAUTHORIZED,
              );
        }
        let appointment
        const workTimeDate = new Date(workTime.date);
        const now = new Date();
        const today = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
        

        if(workTimeDate.toDateString() === today.toDateString())
        {
          appointment = await this.appointmentRepository.find({
            where: { workTime: { workTimeId } },
            relations: ['patient'],
            select: {
              id: true,
              startingTime: true,
              finishingTime: true,
              missedAppointment : true,
              patient: {
                patientId: true,
                firstname: true,
                lastname: true,
                phoneNumber : true,
                birthDate : true,
                profilePicture : true,
                gender : true
              }
            }
          });
        }
        else
        {
           appointment = await this.appointmentRepository.find({
            where: { workTime: { workTimeId } },
            relations: ['patient'],
            select: {
              id: true,
              startingTime: true,
              finishingTime: true,
              patient: {
                patientId: true,
                firstname: true,
                lastname: true,
                phoneNumber : true,
                birthDate : true,
                profilePicture : true,
                gender : true
              }
            }
          });
        }
        if(appointment.length == 0)
        {
          throw new NotFoundException(
            `you have not set any appointment in this wotk time ${workTimeId}`
          );
        }
        return {appointment : appointment};



        
    }


    async missedAppointment(id,patientId,secretaryId){
        const secretary = await this.secretaryRepository.findOne({
            where : {
                secretaryId : secretaryId
            },

        })
        if(!secretary)
        {
            throw new HttpException(`secretary with id ${secretaryId} not found`, HttpStatus.NOT_FOUND);
        }
        const appointment = await this.appointmentRepository.findOne({where : { id },relations : ['patient','workTime.doctor','workTime.clinic']})
        if(!appointment)
        {
            throw new HttpException(`appointment with id ${id} not found`, HttpStatus.NOT_FOUND);
        }
        const patient = await this.patientRepository.findOne({where : {patientId}});
        if (!patient ) {
          throw new HttpException(`patient with id ${patientId} not found`, HttpStatus.NOT_FOUND);
        }
        if(appointment.patient.patientId != patient.patientId)
        {
          throw new BadRequestException('this appoitments is not for this patient')
        }

        const relation = await this.doctorClinicRepository.findOne({
            where : {
                doctor : {
                    doctorId : appointment.workTime.doctor.doctorId
                },
                clinic : {
                    clinicId : appointment.workTime.clinic.clinicId
                },
                secretary :{
                    secretaryId : secretaryId
                }
            }
        })
        if(!relation)
        {
            throw new HttpException(
                `you are not connecting to this doctor in this clinic`,
                HttpStatus.UNAUTHORIZED,
              );
        }

          const workTimeDate = new Date(appointment.workTime.date);
          const now = new Date();
          const today = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
          if(workTimeDate.toDateString() != today.toDateString())
          {
            throw new BadRequestException('you can only update the appoitments of today')
          }
  
  
  
          if( appointment.missedAppointment == true)
          {
  
            if(patient.numberOfMissAppointment == 3)
            {
            patient.active = true;
            }
            patient.numberOfMissAppointment --
            appointment.missedAppointment = false;
          }
          else
          {
            if(patient.numberOfMissAppointment == 2)
            {
            patient.active = false;
            }
            patient.numberOfMissAppointment ++;
            appointment.missedAppointment = true;
          }
          await this.patientRepository.save(patient)
          await this.appointmentRepository.save(appointment)

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
