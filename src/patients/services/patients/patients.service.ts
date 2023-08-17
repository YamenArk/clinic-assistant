import { BadRequestException, ForbiddenException, HttpException, HttpStatus, Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { AuthLoginDto } from 'src/patients/dtos/AuthLogin.dto';
import { Patient } from 'src/typeorm/entities/patient';
import { Equal, LessThan, LessThanOrEqual, MoreThan, MoreThanOrEqual, Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import { newPasswordParams, patientSignUp, restPasswordParams } from 'src/utils/types';
import { verifyParams } from 'src/utils/types';
const fs = require('fs');
import { CACHE_MANAGER} from '@nestjs/common'; // import CACHE_MANAGER
import { v4 as uuid } from 'uuid';
import { Appointment } from 'src/typeorm/entities/appointment';
import { join } from 'path';
import { PatientNotification } from 'src/typeorm/entities/patient-notification';
import { Gateway } from 'src/gateway/gateway';
import { PatientReminders } from 'src/typeorm/entities/patient-reminders';
import { PatientDelay } from 'src/typeorm/entities/patient-delays';

@Injectable()
export class PatientsService {
    constructor (
        private jwtService : JwtService,
        private readonly gateway: Gateway,
        @InjectRepository(PatientDelay) 
        private patientDelayRepository: Repository<PatientDelay>,
        @InjectRepository(PatientReminders) 
        private patientRemindersRepository: Repository<PatientReminders>,
        @InjectRepository(PatientNotification) 
        private patientNotificationRepository: Repository<PatientNotification>,
        @InjectRepository(Patient) 
        private patientRepository : Repository<Patient>,
        @InjectRepository(Appointment) 
        private appointmentRepository : Repository<Appointment>,
        @Inject(CACHE_MANAGER)
        private readonly cacheManager: any, // update the type of cacheManager to any
        ){}

    async login(authLoginDto : AuthLoginDto){
        const {phoneNumber , password} = authLoginDto
        const patient = await this.patientRepository.findOne({
          where : {phoneNumber : phoneNumber,password :password},
        })
        if(!patient)
        {
            // If no matching user found, throw UnauthorizedException
            throw new UnauthorizedException('Invalid credentials')
        }
        if(patient.active == false)
        {
          throw new ForbiddenException('you are not active anymore');
        }
        
        const payload = {
            patientId: patient.patientId,
            type : 4
          };  
        return {
        accessToken: this.jwtService.sign(payload),
        patientId: patient.patientId
        };
    }

    async getmyAccount(patientId : number){
      const patient = await this.patientRepository.findOne({
        where : {patientId : patientId},
        select : ['patientId','birthDate','firstname','lastname','profilePicture','phoneNumber','numberOfMissAppointment',"gender"]
      }) 
      return {patient : patient}
    }



    async  updateProfile(patientId: number, file: Express.Multer.File) {
      const patient = await this.patientRepository.findOne({ where: { patientId } });
    
      if (!patient) {
        throw new HttpException('patient not found', HttpStatus.NOT_FOUND);
      }
    
      if (file) {
           // Delete the old profile picture if it exists
          if (patient.profilePicture) {
            const oldPath = join(__dirname,  '..', '..', '..','..', patient.profilePicture);
            await this.deleteFile(oldPath);
          }
          patient.profilePicture = '/'+file.path.replace(/\\/g, '/');    
      }
      await this.patientRepository.save(patient);
    }
    

    async  deleteFile(filePath: string) {
      await fs.promises.unlink(filePath);
    }


    
    
    async signUp(patientSignUp : patientSignUp){

        const duplicates = await this.patientRepository.findOne({
          where : {
            phoneNumber :  patientSignUp.phoneNumber
          }
        })
        if(duplicates)
        {
          throw new HttpException(
            `this phone number already exist`,
            HttpStatus.NOT_ACCEPTABLE,
          );
        }
        const patient = new Patient();
        patient.gender = patientSignUp.gender;
        patient.phoneNumber = patientSignUp.phoneNumber;
        patient.password = patientSignUp.password;
        patient.firstname = patientSignUp.firstname;
        patient.lastname = patientSignUp.lastname;
        patient.birthDate = patientSignUp.birthDate;
        patient.active = true
        
        // generate unique identifier for patient
        const patientId = uuid();
          const code = Math.floor(10000 + Math.random() * 90000);
        // create a new object that contains both the patient and the code
        const patientData = {
          patient: patient,
          code: code
        };

        // store patient data in cache
        const cacheKey = `patient:${patientId}`;
        await this.cacheManager.set(cacheKey, patientData, { ttl: 300 });
        // send verification code to patient phone number using your preferred SMS service
        // ...
        console.log(patientId);
        console.log(code);
        
      

        // return success response
        return  patientId ;
      }

      async verify(verifyParams : verifyParams){
        const {patientId,code} = verifyParams
        const cacheKey = `patient:${patientId}`;
        const cachedCode = await this.cacheManager.get(cacheKey);
        if (!cachedCode || cachedCode.code !== code) {
          throw new HttpException(
            `Invalid reset code for patient with id ${patientId}`,
            HttpStatus.BAD_REQUEST,
          );
        }
        const newPatient = cachedCode.patient;
        this.patientRepository.save(newPatient);

      }


      async myCurrentAppointment(patientId : number){
        const patient = await this.patientRepository.findOne({where : {patientId}});
        if(!patient)
        {
          throw new HttpException(`doctor with id ${patientId} not found`, HttpStatus.NOT_FOUND);
        }
        const now1 = new Date();
        const today = new Date(Date.UTC(now1.getUTCFullYear(), now1.getUTCMonth(), now1.getUTCDate()));

        const moment = require('moment-timezone');
        // Get the current time in Syria timezone
        const syriaTimezone = 'Asia/Damascus';
        const now = moment().tz(syriaTimezone);
        const currentHour = now.hour();
        const currentMinute = now.minute();
        const currentSecond = 0;

        // Construct a new Date object with the current time in the Syria timezone
        const currentDateTime = new Date();
        currentDateTime.setHours(currentHour);
        currentDateTime.setMinutes(currentMinute);
        currentDateTime.setSeconds(currentSecond);
        currentDateTime.setMilliseconds(0);

         // ...({
            //   workTime: {
            //     date: Equal(today.toISOString())
            //   },
            //   finishingTime: MoreThanOrEqual(finishingTimeString)
            // })

        // Convert the new Date object to a string representation in the format of HH:mm:ss
        const finishingTimeString = currentDateTime.toTimeString().slice(0, 8);
        const appointments = await this.appointmentRepository.find({
          where: [
            { 
              patient: { patientId },
              workTime: { date: MoreThan(today.toISOString()) }
            },
            {
              patient: { patientId },
              workTime: { date: Equal(today.toISOString()) },
              finishingTime: MoreThanOrEqual(finishingTimeString)
            }
          ],
          relations : ['workTime','workTime.doctor','workTime.clinic','workTime.clinic.specialty'],
          select  :{
            id : true,
            startingTime : true,
            finishingTime : true,
            workTime :{
              date : true,
              doctor :{
                doctorId : true,
                firstname : true,
                lastname : true,
                profilePicture : true
              },
              clinic : {
                clinicId : true,
                clinicName : true,
                specialty :{
                  specialtyName : true
                }
              }
            }
          }
        })
      if(appointments.length == 0)
      {
        throw new BadRequestException('you dont have any Current appointments')
      }
      return appointments;
      }

      async myPreviesAppointment(patientId : number){
        const patient = await this.patientRepository.findOne({where : {patientId}});
        if(!patient)
        {
          throw new HttpException(`doctor with id ${patientId} not found`, HttpStatus.NOT_FOUND);
        }
        const now1 = new Date();
        const today = new Date(Date.UTC(now1.getUTCFullYear(), now1.getUTCMonth(), now1.getUTCDate()));

        const moment = require('moment-timezone');
        // Get the current time in Syria timezone
        const syriaTimezone = 'Asia/Damascus';
        const now = moment().tz(syriaTimezone);
        const currentHour = now.hour();
        const currentMinute = now.minute();
        const currentSecond = 0;

        // Construct a new Date object with the current time in the Syria timezone
        const currentDateTime = new Date();
        currentDateTime.setHours(currentHour);
        currentDateTime.setMinutes(currentMinute);
        currentDateTime.setSeconds(currentSecond);
        currentDateTime.setMilliseconds(0);

        // Convert the new Date object to a string representation in the format of HH:mm:ss
        const finishingTimeString = currentDateTime.toTimeString().slice(0, 8);
        const appointments = await this.appointmentRepository.find({
          where: [
            { 
              patient: { patientId },
              workTime: { date: MoreThan(today.toISOString()) }
            },
            {
              patient: { patientId },
              workTime: {
                date: Equal(today.toISOString())
              },
              finishingTime: LessThanOrEqual(finishingTimeString)
            }
          ],
        relations : ['workTime','workTime.doctor','workTime.clinic','workTime.clinic.specialty'],
        select  :{
          id : true,
          startingTime : true,
          finishingTime : true,
          missedAppointment : true,
          workTime :{
            date : true,
            doctor :{
              doctorId : true,
              firstname : true,
              lastname : true,
              profilePicture : true
            },
            clinic : {
              clinicId : true,
              clinicName : true,
              specialty :{
                specialtyName : true
              }
            }
          }
        }
      })
      if(appointments.length == 0)
      {
        throw new BadRequestException('you dont have any Previes appointments')
      }
      return appointments;
      }
      async cancelAppointment(patientId : number,id : number){
        const appointment = await this.appointmentRepository.findOne({where : {id},relations:['patient','workTime']})
        if(!appointment)
        {
          throw new HttpException(`appointment with id ${id} not found`, HttpStatus.NOT_FOUND);
        }
        const patient = await this.patientRepository.findOne({where : {patientId}});
        if(!patient)
        {
          throw new HttpException(`doctor with id ${patientId} not found`, HttpStatus.NOT_FOUND);
        }
        const syriaTimezone = 'Asia/Damascus';
        const moment = require('moment-timezone');
        const appointmentDate = moment(appointment.workTime.date).tz(syriaTimezone).startOf('day');
        const today = moment().tz(syriaTimezone).startOf('day');
        if (appointmentDate.isBefore(today)) {
          throw new BadRequestException('you can not get an old appointment')
        } 
        if(appointment.patient.patientId != patientId)
        {
          throw new BadRequestException('you can only cancel your appoitments')
        }
        const timeDiffDays = appointmentDate.diff(today, 'days');
        if (timeDiffDays < 2) {
          const startingTime = moment(`${appointment.workTime.date} ${appointment.startingTime}`, 'YYYY-MM-DD HH:mm').tz(syriaTimezone);
          const timeDiffHours = startingTime.diff(moment(), 'hours');
          if (timeDiffHours < 24) {
            patient.numberOfMissAppointment ++;
            await this.patientRepository.save(patient)
          }
        } 
        appointment.patient = null;
        await this.appointmentRepository.save(appointment);
      }
      async timetoappointment(patientId : number,id : number){
        const appointment = await this.appointmentRepository.findOne({where : {id},relations:['patient','workTime']})
        if(!appointment)
        {
          throw new HttpException(`appointment with id ${id} not found`, HttpStatus.NOT_FOUND);
        }
        const patient = await this.patientRepository.findOne({where : {patientId}});
        if(!patient)
        {
          throw new HttpException(`doctor with id ${patientId} not found`, HttpStatus.NOT_FOUND);
        }
        if(appointment.patient.patientId != patientId)
        {
          throw new BadRequestException('you can only see your appoitments')
        }
        const syriaTimezone = 'Asia/Damascus';
        const moment = require('moment-timezone');
        const today = moment().tz(syriaTimezone).startOf('day');
        const appointmentDate = moment(appointment.workTime.date).tz(syriaTimezone).startOf('day');
          if (appointmentDate.isBefore(today)) {
            throw new BadRequestException('you can not get an old appointment')
          } 
        const startingTime = moment(`${appointment.workTime.date} ${appointment.startingTime}`, 'YYYY-MM-DD HH:mm').tz(syriaTimezone);
        const currentTime = moment();
        const timeDiffDays = startingTime.diff(currentTime, 'days');
        if (timeDiffDays >= 2) {
          return { canCancel: true };
        } else if (timeDiffDays < 0) {
          throw new BadRequestException('you cannot cancel an old appointment');
        } else {
          const timeDiffHours = startingTime.diff(currentTime, 'hours');
          if (timeDiffHours >= 24) {
            return { canCancel: true };
          } else if (timeDiffHours < -1) {
            throw new BadRequestException('you cannot cancel an old appointment');
          } else {
            const timeDiffMinutes = startingTime.diff(currentTime, 'minutes');
            if (timeDiffMinutes >= 30) {
              return {
                canCancel: false,
                numberOfMissAppointment: patient.numberOfMissAppointment
              };
            } else {
            throw new BadRequestException('To cancel an appointment, the remaining time should be more than 30 minutes.');
            }
          }
        }
      }


      async restPassword(restPassword : restPasswordParams){
        const patient = await this.patientRepository.findOne({
          where :{
            phoneNumber : restPassword.phoneNumber
          }
        })
        if(!patient)
        {
          throw new HttpException(`patient with phone number ${restPassword.phoneNumber} not found`, HttpStatus.NOT_FOUND);
        }
        // generate unique identifier for patient
        const code = Math.floor(10000 + Math.random() * 90000);
       const patientData = {
         code: code
       };
       // store patient data in cache
       const cacheKey = `patient:${patient.patientId}`;
       await this.cacheManager.set(cacheKey, patientData, { ttl: 300 });
       // send verification code to patient phone number using your preferred SMS service
       // ...
       console.log(code);
       return patient.patientId
      }
      
      async restPasswordVerify(restPassword : newPasswordParams){
        const {patientId,code,newPassword} = restPassword
        const cacheKey = `patient:${patientId}`;
        const cachedCode = await this.cacheManager.get(cacheKey);
        if (!cachedCode || cachedCode.code !== code) {
          throw new HttpException(
            `Invalid reset code for patient with id ${patientId}`,
            HttpStatus.BAD_REQUEST,
          );
        }
        
        const patient = await this.patientRepository.findOne({where : {patientId : patientId}});
        if(!patient)
        {
          throw new HttpException(`doctor with id ${patientId} not found`, HttpStatus.NOT_FOUND);
        }
        patient.password = newPassword
        await this.patientRepository.save(patient);
      }


      async patientDelays(patientId : number){
        const patient = await this.patientRepository.findOne({where : {patientId}});
        if(!patient)
        {
          throw new HttpException(`patient with id ${patientId} not found`, HttpStatus.NOT_FOUND);
        }
        const patientDelays = await this.patientDelayRepository.find({
          relations : ['doctor','clinic'],
          where:{
            patient : {
              patientId
            }
          },
          select :{
            doctor :{
              doctorId : true,
              firstname : true,
              lastname : true,
              profilePicture : true
            },
            clinic :{
              clinicId : true,
              clinicName : true
            },
            message : true,
            createdAt : true
          },
          order: {
            id: 'DESC' 
          }
        })
        if(patientDelays.length == 0)
        {
          throw new HttpException(`no Delays messages found`, HttpStatus.NOT_FOUND);
        }
        //send notification about new number of UnRead message
        if(patient.numberOfDelay != 0)
        {
          patient.numberOfDelay = 0;
          const numberOfUnRead = patient.numberOfReminder;
          await this.patientRepository.save(patient);
          // const gateway = new PatientMessagingGateway(this.patientRepository,this.patientNotificationRepository);
          await this.gateway.sendNumberOfUnReadMessages(patientId, numberOfUnRead);
        }
        return patientDelays;
      }

      async patientReminders(patientId : number){
        const patient = await this.patientRepository.findOne({where : {patientId}});
        if(!patient)
        {
          throw new HttpException(`patient with id ${patientId} not found`, HttpStatus.NOT_FOUND);
        }
        const patientReminders = await this.patientRemindersRepository.find({
          relations : ['doctor','clinic','appointment','appointment.workTime'],
          where:{
            patient : {
              patientId
            }
          },
          select :{
            doctor :{
              doctorId : true,
              firstname : true,
              lastname : true,
              profilePicture : true
            },
            clinic :{
              clinicId : true,
              clinicName : true
            },
            appointment :{
              id : true,
              startingTime : true,
              workTime :{
                workTimeId : true,
                date : true,
                day : true
              }
            },
            createdAt : true
          },
          order: {
            id: 'DESC' 
          }
        })
        if(patientReminders.length == 0)
        {
          throw new HttpException(`no Reminders messages found`, HttpStatus.NOT_FOUND);
        }
        //send notification about new number of UnRead message
        if(patient.numberOfReminder != 0)
        {
          patient.numberOfReminder = 0;
          const numberOfUnRead = patient.numberOfDelay;
          await this.patientRepository.save(patient);
          // const gateway = new PatientMessagingGateway(this.patientRepository,this.patientNotificationRepository);
          await this.gateway.sendNumberOfUnReadMessages(patientId, numberOfUnRead);
        }
        return patientReminders;
      }
      
}
