import { BadRequestException, ForbiddenException, HttpException, HttpStatus, Injectable, NotFoundException, UnauthorizedException, UseInterceptors } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { validate } from 'class-validator';
import { CACHE_MANAGER, CacheInterceptor, CacheModule } from '@nestjs/common'; // import CACHE_MANAGER
import { Doctor } from 'src/typeorm/entities/doctors';
import { Insurance } from 'src/typeorm/entities/insurance';
import { SubSpecialty } from 'src/typeorm/entities/sub-specialty';
import {  CreateDoctorParams, CreateWorkTimeParams, UpdateDoctoeClinicParams, UpdateDoctorForAdminParams, UpdateDoctorParams, evaluateDoctorParams, filterDocrotsParams, filterNameParams, profileDetailsParams, secondFilterDocrotsParams,WorkTimeWithAppointments, workTimeFilterParams,appointmentwithBooked, DeleteWorkTimeParams, CreateManyWorkTimeParams } from 'src/utils/types';
import { Between, In, IsNull, Like, MoreThanOrEqual, Not, Repository,LessThanOrEqual, MoreThan, LessThan, SimpleConsoleLogger, Equal } from 'typeorm';
import { MailService } from 'src/middleware/mail/mail.service';
import { Inject } from '@nestjs/common';
import { createWriteStream, readFileSync } from 'fs';
import Decimal from 'decimal.js';
import { DoctorClinic } from 'src/typeorm/entities/doctor-clinic';
import { Clinic } from 'src/typeorm/entities/clinic';
import { WorkTime } from 'src/typeorm/entities/work-time';
import { Appointment } from 'src/typeorm/entities/appointment';
import { join } from 'path';
import { AuthLoginDto } from 'src/doctors/dtos/AuthLogin.dto';
import * as bcrypt from 'bcryptjs'
import { JwtService } from '@nestjs/jwt';
const fs = require('fs');
import { Admin } from 'src/typeorm/entities/admin';
import { Secretary } from 'src/typeorm/entities/secretary';
import { Specialty } from 'src/typeorm/entities/specialty';
import { DoctorPatient } from 'src/typeorm/entities/doctor-patient';
import { Patient } from 'src/typeorm/entities/patient';
import { doc } from 'prettier';
import { min, pairwise } from 'rxjs';
import { PayInAdvance } from 'src/typeorm/entities/pay-in-advance';
import { Transctions } from 'src/typeorm/entities/transctions';
import { NewDoctorReports } from 'src/typeorm/entities/new-doctor-reports';
// import { NotificationGatewayService } from 'src/middleware/notification.gateway/notification.gateway.service';
import { PatientDoctosReport } from 'src/typeorm/entities/patient-doctos-report';
import { Gateway } from 'src/gateway/gateway';
import { PatientNotification } from 'src/typeorm/entities/patient-notification';
import { PatientDelay } from 'src/typeorm/entities/patient-delays';
import { DoctorMessage } from 'src/typeorm/entities/doctor-message';
@Injectable()
@UseInterceptors(CacheInterceptor)
export class DoctorsService {
    constructor (
      
        private jwtService : JwtService,
        private readonly gateway: Gateway,
        @InjectRepository(DoctorMessage) 
        private doctorMessageRepository: Repository<DoctorMessage>,
        @InjectRepository(PatientDelay) 
        private patientDelayRepository: Repository<PatientDelay>,
        @InjectRepository(PatientNotification) 
        private patientNotificationRepository: Repository<PatientNotification>,
        @InjectRepository(PatientDoctosReport) 
        private PatientDoctosReportRepository : Repository<PatientDoctosReport>,
        @InjectRepository(Patient) 
        private PatientRepository : Repository<Patient>,
        @InjectRepository(NewDoctorReports) 
        private newDoctorReportsRepository : Repository<NewDoctorReports>,
        @InjectRepository(DoctorPatient) 
        private doctorPatientRepository : Repository<DoctorPatient>,
        @InjectRepository(Specialty) 
        private specialtyRepository : Repository<Specialty>,
        @InjectRepository(Admin) 
        private adminRepository : Repository<Admin>,
        @InjectRepository(Secretary) 
        private secretaryRepository : Repository<Secretary>,
        @InjectRepository(Clinic) 
        private clinicRepository : Repository<Clinic>,   
        @InjectRepository(Appointment) 
        private appointmentRepository : Repository<Appointment>,     
        @InjectRepository(WorkTime) 
        private workTimeRepository : Repository<WorkTime>,       
        @InjectRepository(DoctorClinic) 
        private doctorClinicRepository : Repository<DoctorClinic>,
        @InjectRepository(Doctor) 
        private doctorRepository : Repository<Doctor>,
        @InjectRepository(Insurance) 
        private insuranceRepository : Repository<Insurance>,
        @InjectRepository(SubSpecialty) 
        private subSpecialtyRepository : Repository<SubSpecialty>,
        @InjectRepository(PayInAdvance) 
        private payInAdvanceRepository : Repository<PayInAdvance>,
        @InjectRepository(Transctions) 
        private transctionsRepository : Repository<Transctions>,
        private readonly mailService: MailService,
        // private readonly  notificationGateway: NotificationGatewayService,
        @Inject(CACHE_MANAGER)
        private readonly cacheManager: any, // update the type of cacheManager to any
        
        ){}



      //admin

      async createDoctor(doctorDetails: CreateDoctorParams){
        const { email, phonenumberForAdmin, gender, firstname, lastname, clinics, subSpecialties, insurances } = doctorDetails;
    
        //doctor duplicates
        const doctorDuplicates = await this.doctorRepository.findOne({ where: { email: email } });
            if (doctorDuplicates) {
              throw new BadRequestException(`"${email}" already exists"`);
            }

        //doctor duplicates
        const doctorDuplicatesInNumber = await this.doctorRepository.findOne({ where: { phonenumberForAdmin: phonenumberForAdmin } });
        if (doctorDuplicatesInNumber) {
          throw new BadRequestException(`"${phonenumberForAdmin}" already exists"`);
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
        // create a new Doctor entity
        const doctor = new Doctor();
        doctor.email = email;
        doctor.phonenumberForAdmin = phonenumberForAdmin;
        doctor.gender = gender;
        doctor.firstname = firstname;
        doctor.lastname = lastname;
        doctor.accountBalance = 0;
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


        doctor.evaluate = 2.5;
        doctor.numberOfPeopleWhoVoted = 0;
        doctor.active = false;
        const now = new Date();
        const today = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
        doctor.createdAt = today.toISOString()
         // Validate the updatedDoctor object using class-validator
         const errors = await validate(doctor);
         if (errors.length > 0) {
           throw new HttpException(`Validation failed: ${errors.join(', ')}`, HttpStatus.BAD_REQUEST);
         }

        // save the new Doctor entity to the database
        const newDoctor = await this.doctorRepository.save(doctor);
    
        const month = (today.getUTCMonth() + 1).toString().padStart(2, '0');
        const year = today.getUTCFullYear();
        const createdAt = `${year}-${month}`;
        let duplicated = await this.newDoctorReportsRepository.findOne({
          where: {
            createdAt: createdAt
          }
        });
        if(!duplicated)
        {

          const newDoctorReportsRepository = await this.newDoctorReportsRepository.create({
            createdAt : createdAt,
           numberOfDoctors : 1
          })
          await this.newDoctorReportsRepository.save(newDoctorReportsRepository);
        }
        else
        {
          duplicated.numberOfDoctors = duplicated.numberOfDoctors + 1;
          await this.newDoctorReportsRepository.save(duplicated);
        }

        // associate the Doctor with the Clinics using DoctorClinic entities
        const doctorClinicEntities = await Promise.all(clinicsArray.map(async (clinic) => {
          const doctorClinic = new DoctorClinic();
          doctorClinic.doctor = newDoctor;
          doctorClinic.clinic = clinic;
          await this.clinicRepository.save(clinic);
          return doctorClinic;
        }));
        await this.doctorClinicRepository.save(doctorClinicEntities);
      }


      async filterDoctorByName(filte :filterNameParams ){

        const query =  this.doctorRepository.createQueryBuilder('doctor')
        .where('CONCAT(doctor.firstname, " ", doctor.lastname) LIKE :name', {
          name: `%${filte.filterName}%`,
        });

        const doctors = await query.getMany();
        if(doctors.length === 0)
        {
            throw new HttpException(`No doctor met the conditions `, HttpStatus.NOT_FOUND);
        }
        return {doctors : doctors};

      }




      async updateDoctorforAdmin(doctorId: number, doctorDetails: UpdateDoctorForAdminParams) {
        const doctor  = await this.doctorRepository.findOne({where : {doctorId : doctorId}});
        if (!doctor ) {
            throw new HttpException(`doctor with id ${doctorId} not found`, HttpStatus.NOT_FOUND);
          }

        // Update the doctor in the database
        await this.doctorRepository.update(doctorId, doctorDetails);
  
        // Return the updated doctor
        return this.doctorRepository.update({doctorId},{...doctorDetails});
      }

      async findDoctors(type: number, page, perPage: number) {
        const select: Array<keyof Doctor> = ['active', 'phonenumberForAdmin', 'email', 'firstname', 'lastname', 'doctorId', 'gender'];
        let where: any = {};
      
        if (type === 1) {
          where = { active: true };
        } else if (type === 2) {
          where = { active: false };
        }
      
        const [doctors, totalCount] = await this.doctorRepository.findAndCount({
          select,
          where,
          take: perPage,
          skip: (page - 1) * perPage,
        });
      
        const totalPages = Math.ceil(totalCount / perPage);
        const pageNumber = parseInt(page, 10); // Convert the string to an integer
        return { doctors, totalPages, currentPage: pageNumber, totalItems: totalCount };
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

      ////////////////////////////////////////////doctor

      async  updateProfile(doctorId: number, profileDetails: profileDetailsParams, file: Express.Multer.File) {
        const doctor = await this.doctorRepository.findOne({ where: { doctorId } });
      
        if (!doctor) {
          throw new HttpException('Doctor not found', HttpStatus.NOT_FOUND);
        }
      
        if (file) {
             // Delete the old profile picture if it exists
            if (doctor.profilePicture) {
              const oldPath = join(__dirname,  '..', '..', '..','..', doctor.profilePicture);
              await this.deleteFile(oldPath);
            }
      
          profileDetails.profilePicture = '/'+file.path.replace(/\\/g, '/');
        }
      
        const updatedDoctor = { ...doctor, ...profileDetails };
      
        await this.doctorRepository.save(updatedDoctor);
      }
      async  deleteFile(filePath: string) {
        await fs.promises.unlink(filePath);
      }

      async numberOfPaitentWhoCame(doctorId : number){
        const doctor = await this.doctorRepository.findOne({
          where :{
            doctorId : doctorId
          }
        });
        if (!doctor) {
          throw new HttpException('Doctor not found', HttpStatus.NOT_FOUND);
        }
   
        const starting = new Date(doctor.createdAt);

        const now = new Date();
        const today = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
        const month = (today.getUTCMonth()).toString().padStart(2, '0');
        const year = today.getUTCFullYear();
        const createdAt = `${year}-${month}`;
        const endYear = today.getUTCFullYear();
        const endMonth = today.getUTCMonth() + 1;
        const startYear = starting.getUTCFullYear();
        const startMonth = starting.getUTCMonth() + 1;
        //get all monthers
        const months = [];

        for (let year = startYear; year <= endYear; year++) {
          const startMonthOfYear = year === startYear ? startMonth : 1;
          const endMonthOfYear = year === endYear ? endMonth : 12;
          for (let month = startMonthOfYear; month <= endMonthOfYear; month++) {
            const monthStr = month.toString().padStart(2, '0');
            const yearMonth = `${year}-${monthStr}`;
            months.push({ year: year, month: monthStr, yearMonth: yearMonth });
          }
        }
        let i = 0;

        while (months[i]) {
          const oldReport = await this.PatientDoctosReportRepository.findOne({
            where: {
              doctor: { doctorId: doctorId },
              createdAt: months[i].yearMonth
            }
          });

          if (!oldReport) {
            const workTimes = await this.workTimeRepository.find({
              relations: ['appointment'],
              where: {
                doctor: { doctorId: doctorId },
                date: Like(`${months[i].yearMonth}%`)
              }
            });

            let numberOfPatientsWhoCame = 0;

            if (workTimes.length === 0) {
              const newReport = await this.PatientDoctosReportRepository.create({
                numberOfPaitentWhoCame: 0,
                createdAt: months[i].yearMonth,
                doctor: doctor
              });
              await this.PatientDoctosReportRepository.save(newReport);
            } else {
              for (const workTime of workTimes) {
                const appointments = await this.appointmentRepository.find({
                  where: {
                    workTime: { workTimeId: workTime.workTimeId },
                    patient: Not(IsNull()),
                    missedAppointment: false
                  }
                });
                numberOfPatientsWhoCame += appointments.length;
              }

              const newReport = await this.PatientDoctosReportRepository.create({
                numberOfPaitentWhoCame: numberOfPatientsWhoCame,
                createdAt: months[i].yearMonth,
                doctor: doctor
              });
              await this.PatientDoctosReportRepository.save(newReport);
            }
          }

          i++;
        }
        const reports = await this.PatientDoctosReportRepository.find({
          where: {
            doctor: { doctorId: doctorId },
          }
        });
        if(reports.length == 0)
        {
          throw new HttpException('you have no reports yet', HttpStatus.NOT_FOUND);
        }
        return reports;

      }


      async getprofile(doctorId : number){
        const doctor = await this.doctorRepository.findOne({

          where: { doctorId },
          select : ['doctorId','firstname','lastname','description','evaluate',"phonenumber","profilePicture","accountBalance","dateToReactivate"] 
        });
        if (!doctor) {
          throw new HttpException('Doctor not found', HttpStatus.NOT_FOUND);
        }
        return {doctor : doctor}
      }
      async payInAdvance(doctorId: number, page, perPage: number) {
        // Your existing code to check doctor existence
        const doctor = await this.doctorRepository.findOne({
          where: { doctorId },
        });
        if (!doctor) {
          throw new HttpException('Doctor not found', HttpStatus.NOT_FOUND);
        }
        const [payInAdvance, totalCount] = await this.payInAdvanceRepository.findAndCount({
          relations: ['admin'],
          where: {
            doctor: {
              doctorId: doctorId
            }
          },
          select: {
            id: true,
            amountPaid: true,
            admin: {
              adminId: true,
              firstname: true,
              lastname: true
            },
            createdAt: true
          },
          take: perPage,
          skip: (page - 1) * perPage
        });
      
        const totalPages = Math.ceil(totalCount / perPage);
      
        if (payInAdvance.length === 0) {
          throw new BadRequestException('You have not paid in advance any money yet');
        }
        const pageNumber = parseInt(page, 10); // Convert the string to an integer
      
        return { payInAdvance, totalPages, currentPage: pageNumber, totalItems: totalCount };
      }
      
      async gettransctions(doctorId: number, page, perPage: number) {
        // Your existing code to check doctor existence
        const doctor = await this.doctorRepository.findOne({
          where: { doctorId },
        });
        if (!doctor) {
          throw new HttpException('Doctor not found', HttpStatus.NOT_FOUND);
        }
        const mytransctions = await this.transctionsRepository.find({
          where: {
            doctor: {
              doctorId: doctorId
            }
          },
          select: {
            id: true,
            amountPaid: true,
            createdAt: true
          },
          take: perPage,
          skip: (page - 1) * perPage
        });
        const pageNumber = parseInt(page, 10); // Convert the string to an integer
      
        return { mytransctions, currentPage: pageNumber, totalItems: mytransctions.length };
      }
      
      async getClinicsForDoctor(doctorId : number){
        const doctor = await this.doctorRepository.findOne({ where: { doctorId } });
        if (!doctor) {
          throw new HttpException('Doctor not found', HttpStatus.NOT_FOUND);
        }

        const doctorClinics = await this.doctorClinicRepository.find({
          where: { doctor: { doctorId: doctor.doctorId } },
          relations : ['clinic','secretary']
        });
        const clinics = doctorClinics.map(doctorClinic => ({
          clinicId: doctorClinic.clinic.clinicId,
          clinicName: doctorClinic.clinic.clinicName,
          phonenumber: doctorClinic.clinic.phonenumber,
          hasSecretary: !!doctorClinic.secretary,
        }));
        return {clinics : clinics}
      }

      async getMessages(doctorId : number){
        const doctor = await this.doctorRepository.findOne({ where: { doctorId } });
        if (!doctor) {
          throw new HttpException('Doctor not found', HttpStatus.NOT_FOUND);
        }
        const doctorMessage = await this.doctorMessageRepository.find({
          where:{
            doctor :{
              doctorId
            }
          },
          order: {
            id: 'DESC' 
          }
        })
        if(doctorMessage.length == 0)
        {
          throw new HttpException('Doctor does not have any messages', HttpStatus.NOT_FOUND);
        }
        return { doctorMessage : doctorMessage}
      }


      async getSubs(doctorId : number){
        const doctor = await this.doctorRepository.findOne({ where: { doctorId } });
        if (!doctor) {
          throw new HttpException('Doctor not found', HttpStatus.NOT_FOUND);
        }
        const specialties = await this.specialtyRepository.find({
          where: { subSpecialties: { doctor: { doctorId } } },
          relations: ['subSpecialties'],
        });
        return {specialties : specialties}
      }

      async getinurancesForDoctor(doctorId : number){
        const doctor = await this.doctorRepository.findOne({ where: { doctorId } });
        if (!doctor) {
          throw new HttpException('Doctor not found', HttpStatus.NOT_FOUND);
        }

        const insurances = await this.insuranceRepository.find({
          where: {
            doctor: {
              doctorId,
            },
          },
        });
        return {insurances : insurances}
      }


      async createWorkTime(workTimeDetails : CreateWorkTimeParams,clinicId : number,doctorId : number)
      {
        const weekdayMap =  {
          'الأحد': 0,
          'الاثنين': 1,
          'الثلاثاء': 2,
          'الأربعاء': 3,
          'الخميس': 4,
          'الجمعة': 5,
          'السبت': 6
        };
        if (!doctorId) {
          throw new HttpException(`thier is something wrong with the token`, HttpStatus.NOT_FOUND);
        }
        const doctor = await this.doctorRepository.findOne({where : {doctorId : doctorId}});
        if (!doctor ) {
          throw new HttpException(`doctor with id ${doctorId} not found`, HttpStatus.NOT_FOUND);
        }
        const clinic = await this.clinicRepository.findOne({where : {clinicId : clinicId}});
        if (!clinic ) {
          throw new HttpException(`clinic with id ${clinicId} not found`, HttpStatus.NOT_FOUND);
        }
        const doctorClinic = await this.doctorClinicRepository.findOne({
          where: { doctor: { doctorId }, clinic: { clinicId } },
        });
        if (!doctorClinic ) {
          throw new NotFoundException(
            `No doctorClinic entity found for doctor ${doctor.doctorId} and clinic ${clinic.clinicId}`
          );
        }
      


        const startDate = new Date(workTimeDetails.startDate);
        const endDate = new Date(workTimeDetails.endDate)

        // Check for conflicts with existing work times
        const existingWorkTimes = await this.workTimeRepository.find({
          where: {
            clinic: clinic,
            day: In(workTimeDetails.days), // Check for work times on the selected days
            date: Between(startDate.toISOString(), endDate.toISOString()) // Check for work times between selected start and end dates
          }
        });
        const appointmentStartingTimee = workTimeDetails.startingTime 
        const appointmentFinishingTimee = workTimeDetails.finishingTime 
        // Iterate through existing work times and check for time conflicts
        for (const existingWorkTime of existingWorkTimes) {
          // Check for time conflicts
          if (
            (appointmentStartingTimee >= existingWorkTime.startingTime && appointmentStartingTimee <= existingWorkTime.finishingTime) ||
            (appointmentFinishingTimee >= existingWorkTime.startingTime && appointmentFinishingTimee <= existingWorkTime.finishingTime)
          ) {
            throw new BadRequestException('A work time conflict exists with the existing schedule.');
          }
        }


     
        // get all Appointment
        const appointmentDuring = doctorClinic.appointmentDuring;
        if (!appointmentDuring || appointmentDuring < 5) {
          throw new HttpException('Invalid appointment duration', HttpStatus.BAD_REQUEST);
        }
        const daysToSeeLastAppointment = doctorClinic.daysToSeeLastAppointment;
        if (!daysToSeeLastAppointment || daysToSeeLastAppointment < 1) {
          throw new HttpException('Invalid daysToSeeLastAppointment', HttpStatus.BAD_REQUEST);
        }
        const appointmentStartingTime = new Date('2023-05-10T' + workTimeDetails.startingTime + ':00');
        const appointmentFinishingTime = new Date('2023-05-10T' + workTimeDetails.finishingTime + ':00');
        if (appointmentStartingTime > appointmentFinishingTime) {
          appointmentFinishingTime.setDate(appointmentFinishingTime.getDate() + 1);
        }
        const appointments = [];
        for (let time = appointmentStartingTime; time < appointmentFinishingTime; time.setMinutes(time.getMinutes() + appointmentDuring)) {
          const currentTime = new Date(time);

          const appointment = {
            startTime: `${currentTime.getHours().toString().padStart(2, '0')}:${currentTime.getMinutes().toString().padStart(2, '0')}`,
            endTime: `${new Date(currentTime.getTime() + appointmentDuring * 60000).getHours().toString().padStart(2, '0')}:${new Date(currentTime.getTime() + appointmentDuring * 60000).getMinutes().toString().padStart(2, '0')}`,
          };
          appointments.push(appointment);
        }

      


        //get all Work days
        type Day = 'الأحد' | 'الاثنين' | 'الثلاثاء' | 'الأربعاء' | 'الخميس' | 'الجمعة' | 'السبت';
        const days = workTimeDetails.days as Day[];
        const result = [];      


        const dateFormatter = new Intl.DateTimeFormat('ar-EG', { weekday: 'long' });
        for (let date = startDate; date <= endDate; date.setDate(date.getDate() + 1)) {
          const formattedDate = dateFormatter.format(date) as Day;
          if (days.includes(formattedDate)) {
            const dayOfWeek = weekdayMap[dateFormatter.format(date)];
            result.push({ day: Object.keys(weekdayMap)[dayOfWeek], date: formatDate(date) });
          }
          
        }
        function formatDate(date) {
            const year = date.getFullYear();
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const day = String(date.getDate()).padStart(2, '0');
            return `${year}/${month}/${day}`;
            }
        
        let i =0,j=0;        
        while(result[i])
        {
          let workTime  = new WorkTime();
          workTime.day = result[i].day;
          workTime.date = result[i].date;
          workTime.startingTime = workTimeDetails.startingTime;
          workTime.finishingTime = workTimeDetails.finishingTime;
          workTime.clinic = clinic;
          workTime.doctor = doctor;
          await this.workTimeRepository.save(workTime);
          j=0;
          while(appointments[j])
          {
            let appointment  = new Appointment();
            appointment.startingTime = appointments[j].startTime;
            appointment.finishingTime = appointments[j].endTime;
            appointment.workTime = workTime;
            appointment.missedAppointment = false;
            await this.appointmentRepository.save(appointment)
            j++;
          }
          i++
        }
          
      }


      async createmanyWorkTime(workTimeDetails : CreateManyWorkTimeParams,clinicId : number,doctorId : number)
      {
        const weekdayMap =  {
          'الأحد': 0,
          'الاثنين': 1,
          'الثلاثاء': 2,
          'الأربعاء': 3,
          'الخميس': 4,
          'الجمعة': 5,
          'السبت': 6
        };
        if (!doctorId) {
          throw new HttpException(`thier is something wrong with the token`, HttpStatus.NOT_FOUND);
        }
        const doctor = await this.doctorRepository.findOne({where : {doctorId : doctorId}});
        if (!doctor ) {
          throw new HttpException(`doctor with id ${doctorId} not found`, HttpStatus.NOT_FOUND);
        }
        const clinic = await this.clinicRepository.findOne({where : {clinicId : clinicId}});
        if (!clinic ) {
          throw new HttpException(`clinic with id ${clinicId} not found`, HttpStatus.NOT_FOUND);
        }
        const doctorClinic = await this.doctorClinicRepository.findOne({
          where: { doctor: { doctorId }, clinic: { clinicId } },
        });
        if (!doctorClinic ) {
          throw new NotFoundException(
            `No doctorClinic entity found for doctor ${doctor.doctorId} and clinic ${clinic.clinicId}`
          );
        }

        const now = new Date();
        const today = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));

        const worktimeDuplicated = await this.workTimeRepository.find({
          where: {
            doctor: {
              doctorId: doctorId
            },
            clinic: {
              clinicId: clinicId
            },
            date: MoreThanOrEqual(today.toISOString())
          },
          order: {
            date: 'ASC'
          }
        });
        if(worktimeDuplicated.length != 0 )
        {
          const startDate1 = new Date(workTimeDetails.startDate);
          const endDate1 = new Date(workTimeDetails.endDate);
          
          // Get the timestamps of the start and end dates
          const startTimestamp = startDate1.getTime();
          const endTimestamp = endDate1.getTime();  
          
          // Get the timestamps of the first and last elements in worktimeDuplicated
          const firstDateTimestamp = new Date(worktimeDuplicated[0].date).getTime();
          const lastDateTimestamp = new Date(worktimeDuplicated[worktimeDuplicated.length - 1].date).getTime();
          if (startTimestamp >= firstDateTimestamp && startTimestamp <= lastDateTimestamp) {
            throw new BadRequestException('you can not create a worktimes inside your work times')
          } 
          if(endTimestamp >= firstDateTimestamp && endTimestamp <= lastDateTimestamp)
          {
            throw new BadRequestException('you can not create a worktimes inside your work times')
          }
        }
      
        type Day = 'الأحد' | 'الاثنين' | 'الثلاثاء' | 'الأربعاء' | 'الخميس' | 'الجمعة' | 'السبت';
        for (let k = 0 ; k < workTimeDetails.appointments.length ; k ++)
        {
            // get all Appointment
          const appointmentDuring = doctorClinic.appointmentDuring;
          if (!appointmentDuring || appointmentDuring < 5) {
            throw new HttpException('Invalid appointment duration', HttpStatus.BAD_REQUEST);
          }
          const daysToSeeLastAppointment = doctorClinic.daysToSeeLastAppointment;
          if (!daysToSeeLastAppointment || daysToSeeLastAppointment < 1) {
            throw new HttpException('Invalid daysToSeeLastAppointment', HttpStatus.BAD_REQUEST);
          }
          const appointmentStartingTime = new Date('2023-05-10T' + workTimeDetails.appointments[k].startingTime + ':00');
          const appointmentFinishingTime = new Date('2023-05-10T' + workTimeDetails.appointments[k].finishingTime + ':00');
          if (appointmentStartingTime > appointmentFinishingTime) {
            appointmentFinishingTime.setDate(appointmentFinishingTime.getDate() + 1);
          }
          const appointments = [];
          for (let time = appointmentStartingTime; time < appointmentFinishingTime; time.setMinutes(time.getMinutes() + appointmentDuring)) {
            const currentTime = new Date(time);

            const appointment = {
              startTime: `${currentTime.getHours().toString().padStart(2, '0')}:${currentTime.getMinutes().toString().padStart(2, '0')}`,
              endTime: `${new Date(currentTime.getTime() + appointmentDuring * 60000).getHours().toString().padStart(2, '0')}:${new Date(currentTime.getTime() + appointmentDuring * 60000).getMinutes().toString().padStart(2, '0')}`,
            };
            appointments.push(appointment);
          }

          const days = workTimeDetails.appointments[k].day as Day;
          const result = [];      
          const startDate = new Date(workTimeDetails.startDate);
          const endDate = new Date(workTimeDetails.endDate);

          const dateFormatter = new Intl.DateTimeFormat('ar-EG', { weekday: 'long' });
          for (let date = startDate; date <= endDate; date.setDate(date.getDate() + 1)) {
            const formattedDate = dateFormatter.format(date) as Day;
            if (days.includes(formattedDate)) {
              const dayOfWeek = weekdayMap[dateFormatter.format(date)];
              result.push({ day: Object.keys(weekdayMap)[dayOfWeek], date: formatDate(date) });
              date.setDate(date.getDate() + 6)
            }
          }
          function formatDate(date) {
              const year = date.getFullYear();
              const month = String(date.getMonth() + 1).padStart(2, '0');
              const day = String(date.getDate()).padStart(2, '0');
              return `${year}/${month}/${day}`;
              }
          
          let i =0,j=0;   
          while(result[i])
          {
            let workTime  = new WorkTime();
            workTime.day = result[i].day;
            workTime.date = result[i].date;
            workTime.startingTime = workTimeDetails.appointments[k].startingTime;
            workTime.finishingTime = workTimeDetails.appointments[k].finishingTime;
            workTime.clinic = clinic;
            workTime.doctor = doctor;
            await this.workTimeRepository.save(workTime);
            j=0;
            while(appointments[j])
            {
              let appointment  = new Appointment();
              appointment.startingTime = appointments[j].startTime;
              appointment.finishingTime = appointments[j].endTime;
              appointment.workTime = workTime;
              appointment.missedAppointment = false;
              await this.appointmentRepository.save(appointment)
              j++;
            }
            i++
          }
        }  
      }


      async deleteWorkTimes(workTimeDetails : DeleteWorkTimeParams,clinicId : number,doctorId : number){
        const now = new Date();
        const today = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
        if (!doctorId) {
          throw new HttpException(`thier is something wrong with the token`, HttpStatus.NOT_FOUND);
        }
        const doctor = await this.doctorRepository.findOne({where : {doctorId : doctorId}});
        if (!doctor ) {
          throw new HttpException(`doctor with id ${doctorId} not found`, HttpStatus.NOT_FOUND);
        }
        const clinic = await this.clinicRepository.findOne({where : {clinicId : clinicId}});
        if (!clinic ) {
          throw new HttpException(`clinic with id ${clinicId} not found`, HttpStatus.NOT_FOUND);
        }
        const doctorClinic = await this.doctorClinicRepository.findOne({
          where: { doctor: { doctorId }, clinic: { clinicId } },
        });
        if (!doctorClinic ) {
          throw new NotFoundException(
            `No doctorClinic entity found for doctor ${doctor.doctorId} and clinic ${clinic.clinicId}`
          );
        }
        //get all Work days
        const startDate = new Date(workTimeDetails.startDate);
        const endDate = new Date(workTimeDetails.endDate);
        // Convert the start and end dates to ISO strings
        const startDateISO = startDate.toISOString();
        const endDateISO = endDate.toISOString();

        // Find all work times that fall between the start and end dates
        const workTimesToDelete = await this.workTimeRepository.find({
          relations : ['appointment','appointment.patient'],
          where: {
            doctor: { doctorId },
            clinic: { clinicId },
            date: Between(startDateISO, endDateISO)
          }
        });

        for(const workTime of workTimesToDelete)
        {
          for (const appointment of workTime.appointment) {
          console.log("hi")
          console.log(appointment)
            if(appointment.patient)
            {
              const patientId = appointment.patient.patientId;
              const patient = await this.PatientRepository.findOne({
                where: {
                  patientId : patientId
                }
              })
              if (!patient ) {
                throw new HttpException(`patient with id ${patientId} not found`, HttpStatus.NOT_FOUND);
              }
              //send notifcation
              const message = 'تم حذف الموعد الخاص بك'; 
              // const gateway = new PatientMessagingGateway(this.PatientRepository,this.patientNotificationRepository);
              await this.gateway.sendNotification(patientId, message);
    
    
              //send numberOfUnRead
              const numberOfUnRead = patient.numberOfDelay + patient.numberOfReminder + 1;
              await this.gateway.sendNumberOfUnReadMessages(patientId, numberOfUnRead);
    
              //save new number of delay message
              patient.numberOfDelay ++;
              this.PatientRepository.save(patient)
    
    
              //send delay message
              const delayMessage =  
              `تم الغاء الموعد الخاص بك من يوم ${workTime.day}
                   ${appointment.startingTime} - ${workTime.date}`;
              const newPatientDelay = await this.patientDelayRepository.create({
                message : delayMessage,
                patient : patient,
                doctor : doctor,
                clinic : clinic,
                createdAt : today.toISOString()
              })
              await this.patientDelayRepository.save(newPatientDelay)
            }
          }
          // Delete the work times
          await this.workTimeRepository.remove(workTime);
        }
      }

      async deleteWorkTime(workTimeId : number,doctorId : number){
        const now = new Date();
        const today = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
        if (!doctorId) {
          throw new HttpException(`thier is something wrong with the token`, HttpStatus.NOT_FOUND);
        }
        const doctor = await this.doctorRepository.findOne({where : {doctorId : doctorId}});
        if (!doctor ) {
          throw new HttpException(`doctor with id ${doctorId} not found`, HttpStatus.NOT_FOUND);
        }
        const workTime = await this.workTimeRepository.findOne({where : {workTimeId : workTimeId},relations : ['doctor','appointment','appointment.patient','clinic']});
        if (!workTime ) {
          throw new HttpException(`workTime with id ${workTimeId} not found`, HttpStatus.NOT_FOUND);
        }
        if(workTime.doctor.doctorId != doctorId)
        {
          throw new BadRequestException('you can only delete your worktime')
        }
        for (const appointment of workTime.appointment) {
          
        if(appointment.patient)
        {
          const patientId = appointment.patient.patientId;
          const patient = await this.PatientRepository.findOne({
            where: {
              patientId : patientId
            }
          })
          if (!patient ) {
            throw new HttpException(`patient with id ${patientId} not found`, HttpStatus.NOT_FOUND);
          }
          //send notifcation
          const message = 'تم حذف الموعد الخاص بك'; 
          // const gateway = new PatientMessagingGateway(this.PatientRepository,this.patientNotificationRepository);
          await  this.gateway.sendNotification(patientId, message);


          //send numberOfUnRead
          const numberOfUnRead = patient.numberOfDelay + patient.numberOfReminder + 1;
          await  this.gateway.sendNumberOfUnReadMessages(patientId, numberOfUnRead);

          //save new number of delay message
          patient.numberOfDelay ++;
          this.PatientRepository.save(patient)


          //send delay message
          const delayMessage =  
          `تم الغاء الموعد الخاص بك من يوم ${workTime.day}
               ${appointment.startingTime} - ${workTime.date}`;
          const newPatientDelay = await this.patientDelayRepository.create({
            message : delayMessage,
            patient : patient,
            doctor : doctor,
            clinic : workTime.clinic,
            createdAt : today.toISOString()
          })
          await this.patientDelayRepository.save(newPatientDelay)
        }
      }
      await this.workTimeRepository.remove(workTime);
    }

      async shiftWorkTimes(shiftValue : number,doctorId : number,clinicId : number){
        const doctor = await this.doctorRepository.findOne({
          where: {
            doctorId : doctorId
          }
        })
        if (!doctor ) {
          throw new HttpException(`doctor with id ${doctorId} not found`, HttpStatus.NOT_FOUND);
        }


        const clinic = await this.clinicRepository.findOne({
          where: {
            clinicId : clinicId
          }
        })
        if (!clinic ) {
          throw new HttpException(`clinic with id ${clinicId} not found`, HttpStatus.NOT_FOUND);
        }

        const now = new Date();
        const today = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
        const workTimes = await this.workTimeRepository.find({
          where : {
            date: MoreThan(today.toDateString()),
            doctor :{
              doctorId : doctorId
            },
            clinic : {
              clinicId : clinicId
            }
          },
          relations: ['appointment','appointment.patient'],
          order: { date: 'ASC', startingTime: 'ASC' },
        });

    
        await this.appointmentRepository.delete({
          workTime: workTimes[workTimes.length-1],
        });
        // Loop through each work time and update the appointments
        for (let i = 0; i < workTimes.length-1; i++) {
          if(i === 1)
          {
            await this.workTimeRepository.delete({
             workTimeId : workTimes[0].workTimeId
            })
          }
          const currentWorkTime = workTimes[i];
          const nextWorkTime = workTimes[i + shiftValue];
    
          // Update the appointments to the next work time
          const appointmentsToUpdate = currentWorkTime.appointment;
          for (const appointment of appointmentsToUpdate) {
            if(appointment.patient)
            {
              const patientId = appointment.patient.patientId;
              const patient = await this.PatientRepository.findOne({
                where: {
                  patientId : patientId
                }
              })
              if (!patient ) {
                throw new HttpException(`patient with id ${patientId} not found`, HttpStatus.NOT_FOUND);
              }
              //send notifcation
              const message = 'تم تأخير الموعد الخاص بك'; 
              // const gateway = new PatientMessagingGateway(this.PatientRepository,this.patientNotificationRepository);
              await this.gateway.sendNotification(patientId, message);


              //send numberOfUnRead
              const numberOfUnRead = patient.numberOfDelay + patient.numberOfReminder + 1;
              await this.gateway.sendNumberOfUnReadMessages(patientId, numberOfUnRead);

              //save new number of delay message
              patient.numberOfDelay ++;
              this.PatientRepository.save(patient)


              //send delay message
              const delayMessage =  
              `تم تأخير الموعد الخاص بك من يوم ${currentWorkTime.day}
                   الى يوم ${nextWorkTime.day}
                   ${appointment.startingTime} - ${currentWorkTime.date}`;
              const newPatientDelay = await this.patientDelayRepository.create({
                message : delayMessage,
                patient : patient,
                doctor : doctor,
                clinic : clinic,
                createdAt : today.toISOString()
              })
              await this.patientDelayRepository.save(newPatientDelay)
            }

            appointment.workTime = nextWorkTime;
            await this.appointmentRepository.save(appointment);
          }
        
        }
      }
      async getWorkTimeForDoctor(clinicId: number, doctorId: number, page, perPage: number) {
        // Your existing code to check doctor and clinic existence
        if (!doctorId) {
          throw new HttpException(`thier is something wrong with the token`, HttpStatus.NOT_FOUND);
        }
        const doctor = await this.doctorRepository.findOne({where : {doctorId : doctorId}});
        if (!doctor ) {
          throw new HttpException(`doctor with id ${doctorId} not found`, HttpStatus.NOT_FOUND);
        }
        const clinic = await this.clinicRepository.findOne({where : {clinicId : clinicId}});
        if (!clinic ) {
          throw new HttpException(`clinic with id ${clinicId} not found`, HttpStatus.NOT_FOUND);
        }

        //see the connection 
        const doctorClinic = await this.doctorClinicRepository.findOne({
          where: { doctor: { doctorId }, clinic: { clinicId } },
        });
        if (!doctorClinic ) {
          throw new NotFoundException(
            `No doctorClinic entity found for doctor ${doctor.doctorId} and clinic ${clinic.clinicId}`
          );
        }

        const now = new Date();
        const today = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
      
        const [workTime, totalCount] = await this.workTimeRepository.findAndCount({
          where: {
            doctor: { doctorId },
            clinic: { clinicId },
            date: MoreThanOrEqual(today.toISOString())
          },
          order: {
            date: 'ASC'
          },
          take: perPage,
          skip: (page - 1) * perPage
        });
      
        const totalPages = Math.ceil(totalCount / perPage);
      
        if (workTime.length === 0) {
          throw new NotFoundException(
            `You have not set any worktime in this clinic clinic ${clinic.clinicId}`
          );
        }
        const pageNumber = parseInt(page, 10); // Convert the string to an integer
      
        return { workTimes: workTime, totalPages, currentPage: pageNumber, totalItems: totalCount };
      }

      async getAppoitment(workTimeId: number, doctorId: number, page, perPage: number) {
        if (!doctorId) {
          throw new HttpException(`thier is something wrong with the token`, HttpStatus.NOT_FOUND);
        }
        const doctor = await this.doctorRepository.findOne({where : {doctorId : doctorId}});
        if (!doctor ) {
          throw new HttpException(`doctor with id ${doctorId} not found`, HttpStatus.NOT_FOUND);
        }
        const workTime = await this.workTimeRepository.findOne({where : {workTimeId : workTimeId}});
        if (!workTime ) {
          throw new HttpException(`workTime with id ${workTimeId} not found`, HttpStatus.NOT_FOUND);
        }
      
        let appointment,totalCount;
        const workTimeDate = new Date(workTime.date);
        const now = new Date();
        const today = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
      
        if (workTimeDate.toDateString() === today.toDateString()) {
          [appointment,totalCount] = await this.appointmentRepository.findAndCount({
            where: { workTime: { workTimeId } },
            relations: ['patient'],
            select: {
              id: true,
              startingTime: true,
              finishingTime: true,
              missedAppointment: true,
              patient: {
                patientId: true,
                firstname: true,
                lastname: true,
                phoneNumber: true,
                birthDate: true,
                profilePicture: true,
                gender: true
              }
            },
            take: perPage,
            skip: (page - 1) * perPage
          });
        } else {
          [appointment,totalCount] = await this.appointmentRepository.findAndCount({
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
                phoneNumber: true,
                birthDate: true,
                profilePicture: true,
                gender: true
              }
            },
            take: perPage,
            skip: (page - 1) * perPage
          });
        }
      
        if (appointment.length === 0) {
          throw new NotFoundException(
            `You have not set any appointment in this work time ${workTimeId}`
          );
        }
        const totalPages = Math.ceil(totalCount / perPage);
        const pageNumber = parseInt(page, 10); // Convert the string to an integer
      
        return { appointment,totalPages, currentPage:pageNumber, totalItems: appointment.length };
      }
      
      async gettodayAppoitment(clinicId: number, doctorId: number, page, perPage: number) {
        if (!doctorId) {
          throw new HttpException(`thier is something wrong with the token`, HttpStatus.NOT_FOUND);
        }
        const doctor = await this.doctorRepository.findOne({where : {doctorId : doctorId}});
        if (!doctor ) {
          throw new HttpException(`doctor with id ${doctorId} not found`, HttpStatus.NOT_FOUND);
        }
        const clinic = await this.clinicRepository.findOne({where : {clinicId : clinicId}});
        if (!clinic ) {
          throw new HttpException(`clinic with id ${clinicId} not found`, HttpStatus.NOT_FOUND);
        }


        const now = new Date();
        const today = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
      
        const workTime = await this.workTimeRepository.findOne({
          where : {
            doctor :{
              doctorId : doctorId
            },
            clinic : {
              clinicId : clinicId
            },
            date: Equal(today.toISOString())
          }});
        if (!workTime ) {
          throw new HttpException(`doctor does not have any appoitment today`, HttpStatus.NOT_FOUND);
        }
      
        let appointment,totalCount;
      [appointment,totalCount] = await this.appointmentRepository.findAndCount({
          where: { workTime: { workTimeId : workTime.workTimeId } },
          relations: ['patient'],
          select: {
            id: true,
            startingTime: true,
            finishingTime: true,
            missedAppointment: true,
            patient: {
              patientId: true,
              firstname: true,
              lastname: true,
              phoneNumber: true,
              birthDate: true,
              profilePicture: true,
              gender: true
            }
          },
          take: perPage,
          skip: (page - 1) * perPage
        });
      
        if (appointment.length === 0) {
          throw new NotFoundException(
            `You have not set any appointment in this work time ${workTime.workTimeId}`
          );
        }
        const totalPages = Math.ceil(totalCount / perPage);
        const pageNumber = parseInt(page, 10); // Convert the string to an integer
        return { appointment,totalPages, currentPage: pageNumber, totalItems: appointment.length };
      }
      

      async missedAppointment(id : number,patientId : number,doctorId : number){
        if (!doctorId) {
          throw new HttpException(`thier is something wrong with the token`, HttpStatus.NOT_FOUND);
        }
        const doctor = await this.doctorRepository.findOne({where : {doctorId : doctorId}});
        if (!doctor ) {
          throw new HttpException(`doctor with id ${doctorId} not found`, HttpStatus.NOT_FOUND);
        }
        const appointment = await this.appointmentRepository.findOne({where : { id },relations : ['patient']})
        if(!appointment)
        {
            throw new HttpException(`appointment with id ${id} not found`, HttpStatus.NOT_FOUND);
        }
        const patient = await this.PatientRepository.findOne({where : {patientId}});
        if (!patient ) {
          throw new HttpException(`patient with id ${patientId} not found`, HttpStatus.NOT_FOUND);
        }
        if(appointment.patient.patientId != patient.patientId)
        {
          throw new BadRequestException('this appoitments is not for this patient')
        }
        const workTime = await this.workTimeRepository.findOne({where : {
          appointment : appointment,
        },
        relations : ['doctor']
         })
        if (!workTime ) {
          throw new HttpException(`workTime with id ${id} not found`, HttpStatus.NOT_FOUND);
        }
        const workTimeDate = new Date(workTime.date);
        const now = new Date();
        const today = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
        if(workTime.doctor.doctorId!= doctor.doctorId)
        {
          throw new BadRequestException('you are only allowed to update your appoitments')
        }
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
        await this.PatientRepository.save(patient)
        await this.appointmentRepository.save(appointment)
      }
      async setAppointment(id : number,patientId : number,doctorId : number){
        if (!doctorId) {
          throw new HttpException(`thier is something wrong with the token`, HttpStatus.NOT_FOUND);
        }
        const doctor = await this.doctorRepository.findOne({where : {doctorId : doctorId}});
        if (!doctor ) {
          throw new HttpException(`doctor with id ${doctorId} not found`, HttpStatus.NOT_FOUND);
        }
        const appointment = await this.appointmentRepository.findOne({where : { id },relations : ['patient']})
        if(!appointment)
        {
            throw new HttpException(`appointment with id ${id} not found`, HttpStatus.NOT_FOUND);
        }
        if(appointment.patient)
        {
          throw new BadRequestException('you can not book an booked appoitments')
        }
        const patient = await this.PatientRepository.findOne({where : {patientId}});
        if (!patient ) {
          throw new HttpException(`patient with id ${patientId} not found`, HttpStatus.NOT_FOUND);
        }
        const workTime = await this.workTimeRepository.findOne({where : {
          appointment : appointment,
        },
        relations : ['doctor']
         })
        if (!workTime ) {
          throw new HttpException(`workTime with id ${id} not found`, HttpStatus.NOT_FOUND);
        }
        if(workTime.doctor.doctorId!= doctor.doctorId)
        {
          throw new BadRequestException('you are only allowed to update your appoitments')
        }
        appointment.patient = patient;
        await this.appointmentRepository.save(appointment);
      }
      async patientHistories(patientId : number,doctorId : number){
        if (!doctorId) {
          throw new HttpException(`thier is something wrong with the token`, HttpStatus.NOT_FOUND);
        }
        const doctor = await this.doctorRepository.findOne({where : {doctorId : doctorId}});
        if (!doctor ) {
          throw new HttpException(`doctor with id ${doctorId} not found`, HttpStatus.NOT_FOUND);
        }
        const patient = await this.PatientRepository.findOne({where : {patientId}});
        if (!patient ) {
          throw new HttpException(`patient with id ${patientId} not found`, HttpStatus.NOT_FOUND);
        }
        const now = new Date();
        const today = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
        const appointments = await this.appointmentRepository.find({where :{
          patient : patient,
          workTime : {
            date: LessThanOrEqual(today.toISOString()),
            doctor : {
              doctorId : doctorId
            }
          }
        },
        relations : ['workTime'],
        select : {
          id : true,
          startingTime : true,
          finishingTime : true,
          missedAppointment : true,
          workTime : {
            date :true,
            day : true
          }
        }
      })
      if(appointments.length == 0 )
      {
        throw new BadRequestException("You don't have any appointments with this patient")
      }
      return { appointments : appointments}
      }

      
      
      async updateDoctoeClinicDetails(doctorClinicDetails : UpdateDoctoeClinicParams,clinicId : number,doctorId:number){
          if (!doctorId) {
            throw new HttpException(`thier is something wrong with the token`, HttpStatus.NOT_FOUND);
          }
          const doctor = await this.doctorRepository.findOne({where : {doctorId : doctorId}});
          if (!doctor ) {
            throw new HttpException(`doctor with id ${doctorId} not found`, HttpStatus.NOT_FOUND);
          }
          const clinic = await this.clinicRepository.findOne({where : {clinicId : clinicId}});
          if (!clinic ) {
            throw new HttpException(`clinic with id ${clinicId} not found`, HttpStatus.NOT_FOUND);
          }
          const doctorClinic = await this.doctorClinicRepository.findOne({
            where: { doctor: { doctorId }, clinic: { clinicId } },
          });
          if (!doctorClinic ) {
            throw new NotFoundException(
              `No doctorClinic entity found for doctor ${doctor.doctorId} and clinic ${clinic.clinicId}`
            );
          }
          // Update the doctorclinic in the database
         await this.doctorClinicRepository.update(doctorClinic.id, doctorClinicDetails);
      }


      
      async getDoctoeClinicDetails(clinicId: number,doctorId : number) {
        if (!doctorId) {
          throw new HttpException(`thier is something wrong with the token`, HttpStatus.NOT_FOUND);
        }
        const doctor = await this.doctorRepository.findOne({ where: { doctorId: doctorId } });
        if (!doctor) {
          throw new HttpException(`doctor with id ${doctorId} not found`, HttpStatus.NOT_FOUND);
        }
        const clinic = await this.clinicRepository.findOne({ where: { clinicId: clinicId } });
        if (!clinic) {
          throw new HttpException(`clinic with id ${clinicId} not found`, HttpStatus.NOT_FOUND);
        }
        const doctorClinic = await this.doctorClinicRepository.findOne({
          where: { doctor: { doctorId }, clinic: { clinicId } },
        });
        if (!doctorClinic) {
          throw new NotFoundException(
            `No doctorClinic entity found for doctor ${doctor.doctorId} and clinic ${clinic.clinicId}`
          );
        }
        return { doctorClinic: doctorClinic };
      }


      async login(authLoginDto: AuthLoginDto) {
        const { email, password } = authLoginDto;
        const admin = await this.adminRepository.findOne({where: { email: email }});
        if (admin) {
          const isPasswordMatch = await bcrypt.compare(password, admin.password); // compare the hashed passwords
          if (!isPasswordMatch) {
            throw new UnauthorizedException('Invalid credentials');
          }
          if(admin.active == false)
          {
            throw new ForbiddenException('you are not active anymore');
          }
          const payload = {
            adminId: admin.adminId,
            type  : admin.type
          };
          return {
            access_token: this.jwtService.sign(payload),
            type : admin.type
          };
        
        }


        const doctor = await this.doctorRepository.findOne({ where: { email: email } });
        if (doctor) {
          const isPasswordMatch = await bcrypt.compare(password, doctor.password); // compare the hashed passwords
          if (!isPasswordMatch) {
            throw new UnauthorizedException('Invalid credentials');
          }
          if(doctor.active == false)
          {
            throw new ForbiddenException('you are not active anymore');
          }
          const payload = {
            doctorId: doctor.doctorId,
            type : 2
          };
          return {
            access_token: this.jwtService.sign(payload),
            type : 2,
            doctorId : doctor.doctorId
          };
        }
      
        const secretary = await this.secretaryRepository.findOne({ where: { email: email } });
        if (secretary) {
          const isPasswordMatch = await bcrypt.compare(password, secretary.password); // compare the hashed passwords
          if (!isPasswordMatch) {
            throw new UnauthorizedException('Invalid credentials');
          }
          const payload = {
            secretaryId: secretary.secretaryId,
            type : 3
          };
          return {
            access_token: this.jwtService.sign(payload),
            type : 3
          };
        }
      // If no matching user found, throw UnauthorizedException
      throw new UnauthorizedException('Invalid credentials')
        
      }


      async sendResetEmail(email: string) {
        const doctor = await this.doctorRepository.findOne({where: {email : email}});

        if (doctor) {
          const code = Math.floor(10000 + Math.random() * 90000);
          const message = `Please reset your password using this code: ${code}`;
          await this.mailService.sendMail(doctor.email , 'Password reset', message);
          // Cache the generated code for 5 minutes
          const cacheKey = `resetCode-${doctor.doctorId}`;
          await this.cacheManager.set(cacheKey, code, { ttl: 300 });
          return { message: 'message has been sent to your Email', doctorId: doctor.doctorId , type : 2};
        }    

        const secretary = await this.secretaryRepository.findOne({where: {email : email}});

        if (secretary) {
          const code = Math.floor(10000 + Math.random() * 90000);
          const message = `Please reset your password using this code: ${code}`;
          await this.mailService.sendMail(secretary.email , 'Password reset', message);
        
          // Cache the generated code for 5 minutes
          const cacheKey = `resetCode-${secretary.secretaryId}`;
          await this.cacheManager.set(cacheKey, code, { ttl: 300 });
          return { message: 'message has been sent to your Email', secretaryId: secretary.secretaryId , type : 3};
        }    
       
        const admin = await this.adminRepository.findOne({where: {email : email}});

        if (admin) {
          const code = Math.floor(10000 + Math.random() * 90000);
          const message = `Please reset your password using this code: ${code}`;
          await this.mailService.sendMail(admin.email , 'Password reset', message);
        
          // Cache the generated code for 5 minutes
          const cacheKey = `resetCodeForAdmin-${admin.adminId}`;
          await this.cacheManager.set(cacheKey, code, { ttl: 300 });
          return { message: 'message has been sent to your Email', adminId: admin.adminId , type : 1};
        }    
        // If no matching user found, throw UnauthorizedException
        throw new UnauthorizedException('Invalid credentials')
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
        const hashedPassword = await bcrypt.hash(newPassword, 10); // hash the password
        doctor.password = hashedPassword;
        await this.doctorRepository.save(doctor);
      }

      //patient

      async filterDocrots(filterDetasils : filterDocrotsParams)
      {
        const query = this.doctorRepository.createQueryBuilder('doctor')
        .leftJoin('doctor.subSpecialty', 'subSpecialty')
        .leftJoin('doctor.insurance', 'insurance')
        .select([
            'doctor.doctorId',
            'doctor.firstname',
            'doctor.lastname',
            'doctor.evaluate',
            'doctor.profilePicture',
        ]);
    
    if (filterDetasils.gender !== null) {
        query.andWhere('doctor.gender = :gender', { gender: filterDetasils.gender });
    }
    
    if (filterDetasils.subSpecialtyId !== null) {
        query.andWhere('subSpecialty.subSpecialtyId = :subSpecialtyId', { subSpecialtyId: filterDetasils.subSpecialtyId });
    }
    
    if (filterDetasils.insuranceId !== null) {
        query.andWhere('insurance.insuranceId = :insuranceId', { insuranceId: filterDetasils.insuranceId });
    }
    query.andWhere('doctor.active IS NOT false')
    const results  = await query.getMany();
    
    if (results.length === 0) {
        throw new HttpException(`No doctor met the conditions`, HttpStatus.NOT_FOUND);
    }
        
    const doctorsWithSpecialties = await Promise.all(results.map(async result => {
      const doctor = {
          doctorId: result.doctorId,
          firstname: result.firstname,
          lastname: result.lastname,
          evaluate: result.evaluate,
          profilePicture: result.profilePicture,
          specialties: []
      };
      if (result.doctorId) {
          const specialties = await this.specialtyRepository.find({
              where: { subSpecialties: { doctor: { doctorId: result.doctorId } } },
              relations: ['subSpecialties'],
              select: ['specialtyId', 'specialtyName']
          });
          doctor.specialties = specialties.map(specialty => ({ specialtyId: specialty.specialtyId, specialtyName: specialty.specialtyName }));
      }
      return doctor;
      }));
      
      if (doctorsWithSpecialties.length === 0) {
          throw new HttpException(`No doctor met the conditions`, HttpStatus.NOT_FOUND);
      }
      return {doctor : doctorsWithSpecialties};
      }

      
      async secondFilterDocrots(secondFilterDocrotsDto : secondFilterDocrotsParams)
      {
        const query =  this.doctorRepository.createQueryBuilder('doctor')
        .leftJoin('doctor.subSpecialty', 'subSpecialty')
        .select([
          'doctor.doctorId',
          'doctor.firstname',
          'doctor.lastname',
          'doctor.evaluate',
          'doctor.profilePicture',
      ]);

        if (secondFilterDocrotsDto.subSpecialtyId !== null) {
          query.andWhere('subSpecialty.subSpecialtyId = :subSpecialtyId', { subSpecialtyId: secondFilterDocrotsDto.subSpecialtyId });
        }
        if (secondFilterDocrotsDto.orderByEvaluate == true) {
          query.orderBy('doctor.evaluate', 'DESC');
        }
        if (secondFilterDocrotsDto.filterName !== null) {
          query.andWhere('CONCAT(doctor.firstname, " ", doctor.lastname) LIKE :name', {
            name: `%${secondFilterDocrotsDto.filterName}%`,
          });
        }
        query.andWhere('doctor.active IS NOT false')
        const results  = await query.getMany();
    
        if (results.length === 0) {
            throw new HttpException(`No doctor met the conditions`, HttpStatus.NOT_FOUND);
        }
            
        const doctorsWithSpecialties = await Promise.all(results.map(async result => {
          const doctor = {
              doctorId: result.doctorId,
              firstname: result.firstname,
              lastname: result.lastname,
              evaluate: result.evaluate,
              profilePicture: result.profilePicture,
              specialties: []
          };
          if (result.doctorId) {
              const specialties = await this.specialtyRepository.find({
                  where: { subSpecialties: { doctor: { doctorId: result.doctorId } } },
                  relations: ['subSpecialties'],
                  select: ['specialtyId', 'specialtyName']
              });
              doctor.specialties = specialties.map(specialty => ({ specialtyId: specialty.specialtyId, specialtyName: specialty.specialtyName }));
          }
          return doctor;
          }));
          
          if (doctorsWithSpecialties.length === 0) {
              throw new HttpException(`No doctor met the conditions`, HttpStatus.NOT_FOUND);
          }
          return {doctor : doctorsWithSpecialties};
      }     

      async getprofileforpatient(doctorId : number,patientId : number,tokenIsCorrect : boolean){
        const doctor = await this.doctorRepository.findOne({
          where: { doctorId },
          select : ['doctorId','firstname','lastname','description','evaluate',"phonenumber","profilePicture","numberOfPeopleWhoVoted","active"],
          relations: ['workTime','workTime.clinic'],
        });
        if (!doctor) {
          throw new HttpException('Doctor not found', HttpStatus.NOT_FOUND);
        }
        if(!doctor.active)
        {
          throw new HttpException('Doctor not found', HttpStatus.NOT_FOUND);
        }


        const doctorClinics = await this.doctorClinicRepository.find({
          where: { doctor: { doctorId: doctor.doctorId } },
          relations : ['clinic']
        });
        const clinicIds = doctorClinics.map((doctorClinic) => doctorClinic.clinic.clinicId);
        const clinics = await this.clinicRepository.find({
          where: { clinicId: In(clinicIds) },
          relations: ['area', 'area.governorate'],
          select: ['clinicId', 'clinicName', 'phonenumber', 'area']
        });


        const specialties = await this.specialtyRepository.find({
          where: { subSpecialties: { doctor: { doctorId } } },
          relations: ['subSpecialties'],
        });


        
        const insurances = await this.insuranceRepository.find({
          where: {
            doctor: {
              doctorId,
            },
          },
        });


        //check if the doctor is working  
        const now = new Date();
        const currentTime = now.toLocaleTimeString('en-US', { hour12: false });
        const currentDate = formatDate(now);

        let clinicWorkingNow;
        const isWorkingNow = doctor.workTime.some(workTime => {
          const { date, startingTime, finishingTime } = workTime;
          if (date !== currentDate) {
              return false; // not working on this date
          }
          if (currentTime < startingTime || currentTime > finishingTime) {

            return false; // not working at this time
          }
          clinicWorkingNow = {
            clinicId : workTime.clinic.clinicId,
            clinicName : workTime.clinic.clinicName
          }
          return true; // working now
        });
        
        function formatDate(date) {
          const year = date.getFullYear();
          const month = String(date.getMonth() + 1).padStart(2, '0');
          const day = String(date.getDate()).padStart(2, '0');
          return `${year}-${month}-${day}`;
        }

        let patient;
        let canEvaluate = false
        if(patientId)
        {
          patient = await this.PatientRepository.findOne({
          where : {patientId}
          })
          if (!patient) {
            throw new HttpException('patient not found', HttpStatus.NOT_FOUND);
          }
          const doctorPatient = await this.doctorPatientRepository.findOne({
          where : {
            doctor : doctor,
            patient : patient
          }})
          if(doctorPatient){
            canEvaluate = true;
          }
        }
       

    

        // Remove workTime property from doctor object
        delete doctor.workTime;
        if(isWorkingNow)
        {
          return {
            doctor : doctor,
            clinics : clinics,
            specialties : specialties,
            insurances : insurances,
            clinicWorkingNow : clinicWorkingNow,
            canEvaluate : canEvaluate,
            tokenIsCorrect : tokenIsCorrect
          }
        }
        clinicWorkingNow = null;
        return {
          doctor : doctor,
          clinics : clinics,
          specialties : specialties,
          insurances : insurances,
          clinicWorkingNow : clinicWorkingNow,
          canEvaluate : canEvaluate, 
          tokenIsCorrect : tokenIsCorrect
        }
      }



      async getprofileforadmin(doctorId : number){
        const doctor = await this.doctorRepository.findOne({
          where: { doctorId },
          select : ['doctorId','firstname','lastname',"phonenumber","email"],
        });
        if (!doctor) {
          throw new HttpException('Doctor not found', HttpStatus.NOT_FOUND);
        }


        const doctorClinics = await this.doctorClinicRepository.find({
          where: { doctor: { doctorId: doctor.doctorId } },
          relations : ['clinic']
        });
        const clinicIds = doctorClinics.map((doctorClinic) => doctorClinic.clinic.clinicId);
        const clinics = await this.clinicRepository.find({
          where: { clinicId: In(clinicIds) },
          relations: ['area', 'area.governorate'],
          select: ['clinicId', 'clinicName', 'phonenumber', 'area']
        });


        const specialties = await this.specialtyRepository.find({
          where: { subSpecialties: { doctor: { doctorId } } },
          relations: ['subSpecialties'],
        });


        
        const insurances = await this.insuranceRepository.find({
          where: {
            doctor: {
              doctorId,
            },
          },
        });
        return {
          doctor : doctor,
          clinics : clinics,
          specialties : specialties,
          insurances : insurances,
        }
      }


      async evaluateDoctor(evaluateDoctor : evaluateDoctorParams , patientId : number,doctorId : number){
        const doctor = await this.doctorRepository.findOne({
          where: { doctorId }
        });
        if (!doctor) {
          throw new HttpException('Doctor not found', HttpStatus.NOT_FOUND);
        }
        if(!doctor.active)
        {
          throw new HttpException('Doctor not found', HttpStatus.NOT_FOUND);
        }

        const patient = await this.PatientRepository.findOne({
          where : {patientId}
          })
          if (!patient) {
            throw new HttpException('patient not found', HttpStatus.NOT_FOUND);
          }
     


         const now = new Date();
         const today = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
          const visited = await this.workTimeRepository.findOne({
            where:{
              doctor :{
                doctorId : doctorId
              },
              appointment :{
                patient :{
                  patientId : patientId
                },
                missedAppointment : false
              },
              date  : LessThan(today.toISOString())
            }
          })

          if(!visited)
          {
            throw new BadRequestException('you cant Evaluate a doctor you have not taken an appoitment with')
          }

          
          let doctorPatient = await this.doctorPatientRepository.findOne({
            where: { doctor: {
              doctorId : doctorId
            },
             patient: {
              patientId : patientId
             } },
          });          
          if(doctorPatient){
            doctorPatient.evaluate = evaluateDoctor.evaluate;
            await this.doctorPatientRepository.save(doctorPatient);
          }
          else
          {
            const newEvaluate = await this.doctorPatientRepository.create({
                patient : patient,
                doctor : doctor,
                evaluate : evaluateDoctor.evaluate
            });
            doctor.numberOfPeopleWhoVoted ++ ;
            await this.doctorPatientRepository.save(newEvaluate);
          }
          const results = await this.doctorPatientRepository.find({
            where: {
              doctor: {
                doctorId
              },}
          });
          const sumOfEvaluation = results.reduce((acc, cur) => {
            const decimalValue = new Decimal(cur.evaluate);
            const stringValue = decimalValue.toFixed(2);
            const sum = new Decimal(stringValue);
            return acc.plus(sum);
          }, new Decimal(0)).toNumber();
          doctor.evaluate = sumOfEvaluation / (results.length + 1);
          await this.doctorRepository.save(doctor);
          return {message : 'doctor evaluated successfully'}      
      }

      async getevaluateDoctor(patientId : number,doctorId : number){
        const doctor = await this.doctorRepository.findOne({
          where: { doctorId }
        });
        if (!doctor) {
          throw new HttpException('Doctor not found', HttpStatus.NOT_FOUND);
        }
        if(!doctor.active)
        {
          throw new HttpException('Doctor not found', HttpStatus.NOT_FOUND);
        }

        const patient = await this.PatientRepository.findOne({
          where : {patientId}
          })
          if (!patient) {
            throw new HttpException('patient not found', HttpStatus.NOT_FOUND);
          }



          const now = new Date();
          const today = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
           const visited = await this.workTimeRepository.findOne({
             where:{
               doctor :{
                 doctorId : doctorId
               },
               appointment :{
                 patient :{
                   patientId : patientId
                 },
                 missedAppointment : false
               },
               date  : LessThan(today.toISOString())
             }
           })
 
           if(!visited)
           {
             throw new BadRequestException('you cant Evaluate a doctor you have not taken an appoitment with')
           }

          let doctorPatient = await this.doctorPatientRepository.findOne({
            where: { doctor: {
              doctorId : doctorId
            },
             patient: {
              patientId : patientId
             } },
          });          
          if(!doctorPatient)
          {
            return {evaluate : 0}
          }
          return {evaluate : doctorPatient.evaluate}
      }

      async getDoctorClinic(doctorId : number ,clinicId : number){
        const doctor = await this.doctorRepository.findOne({
          where: { doctorId },
          select : ['firstname','lastname','profilePicture',"active"]
        });
        if (!doctor) {
          throw new HttpException('Doctor not found', HttpStatus.NOT_FOUND);
        }
        if(!doctor.active)
        {
          throw new HttpException('Doctor not found', HttpStatus.NOT_FOUND);
        }

        
        const clinic = await this.clinicRepository.findOne({
          where: { clinicId },
          relations : ['specialty','area.governorate'],
          select : ['clinicId','clinicName','specialty','area','phonenumber']
        });
        if (!clinic) {
          throw new HttpException('clinic not found', HttpStatus.NOT_FOUND);
        }
        const doctorClinics = await this.doctorClinicRepository.findOne({
          where: { 
            clinic: { clinicId },
            doctor : {doctorId} 
          },
          select : ["id",'appointmentDuring','checkupPrice']
        });

        if (!doctorClinics) {
          throw new BadRequestException('this doctor is not connected to this clinic');
        }

        
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const workTime = await this.workTimeRepository.find({
          where: { 
            doctor: { doctorId }, 
            clinic: { clinicId },
            date: MoreThanOrEqual(today.toISOString())},
        });


        const now = new Date();
        const currentTime = now.toLocaleTimeString('en-US', { hour12: false });
        const currentDate = formatDate(now);
        const isWorkingNow = workTime.some(workTime => {
          const { date, startingTime, finishingTime } = workTime;
          if (date !== currentDate) {
            return false; // not working on this date
          }
          if (currentTime < startingTime || currentTime > finishingTime) {
            
            return false; // not working at this time
          }
          return true; // working now
        });
        
        function formatDate(date) {
          const year = date.getFullYear();
          const month = String(date.getMonth() + 1).padStart(2, '0');
          const day = String(date.getDate()).padStart(2, '0');
          return `${year}-${month}-${day}`;
        }
        return {
          doctorClinics : doctorClinics,
          doctor : doctor,
          clinic : clinic,
          isWorkingNow : isWorkingNow,
          workTime : workTime
        };
      }


      async getWorkTimeWithFilter(clinicId : number,doctorId : number,workTimeFilter : workTimeFilterParams): Promise<{ workTimes: WorkTimeWithAppointments[],startingDate :string, finishingDate : string }> {

        if (!doctorId) {
          throw new HttpException(`thier is something wrong with the token`, HttpStatus.NOT_FOUND);
        }
        const doctor = await this.doctorRepository.findOne({where : {doctorId : doctorId}});
        if (!doctor ) {
          throw new HttpException(`doctor with id ${doctorId} not found`, HttpStatus.NOT_FOUND);
        }
        const clinic = await this.clinicRepository.findOne({where : {clinicId : clinicId}});
        if (!clinic ) {
          throw new HttpException(`clinic with id ${clinicId} not found`, HttpStatus.NOT_FOUND);
        }

        //see the connection 
        const doctorClinic = await this.doctorClinicRepository.findOne({
          where: { doctor: { doctorId }, clinic: { clinicId } },
        });

        if (!doctorClinic ) {
          throw new NotFoundException(
            `No doctorClinic entity found for doctor ${doctor.doctorId} and clinic ${clinic.clinicId}`
          );
        }
        //get worktimes        
        const month = parseInt(workTimeFilter.month, 10);
        const year = parseInt(workTimeFilter.year, 10);
        let startDate;
        const endDate = new Date(year, month, 0);
        const now = new Date();
        const today = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
        if (today.getMonth() + 1 === month) {
          startDate = today;
        }
        else{
          startDate = new Date(year, month -1 , 1);
        }
        const workTime = await this.workTimeRepository.find({
          where: {
            doctor: { doctorId },
            clinic: { clinicId },
            date: Between(startDate.toISOString(), endDate.toISOString().slice(0, 10)),
          },
        });
        if(workTime.length == 0)
        {
          throw new NotFoundException(
            `thier are no work times in the clinic ${clinic.clinicId}`
          );
        }
        

        
        
        const workTimeWithAppointments = await Promise.all(workTime.map(async result => {
          const workTime = {
              workTimeId: result.workTimeId,
              startingTime: result.startingTime,
              finishingTime: result.finishingTime,
              day: result.day,
              date: result.date,
              haveAppointments : false
          };
          const appointment = await this.appointmentRepository.findOne({
            where: {
              workTime: result,
              patient: IsNull(),
            },
            relations: ['patient'],
          });
          if(appointment)
          {
            workTime.haveAppointments = true
          }      
          return workTime;
          }));
        return { workTimes: workTimeWithAppointments,
                  startingDate : workTime[0].date,
                  finishingDate :  workTime[workTime.length-1].date
         };
      }


        
      async   getAppoitmentForPatient(workTimeId : number) : Promise<{ appointment: appointmentwithBooked[],}>{
        const workTime = await this.workTimeRepository.findOne({where : {workTimeId : workTimeId}});
        if (!workTime ) {
          throw new HttpException(`clinic with id ${workTimeId} not found`, HttpStatus.NOT_FOUND);
        }
     
        const syriaTimezone = 'Asia/Damascus';
        const moment = require('moment-timezone');
        const today = moment().tz(syriaTimezone).startOf('day');
        const workTimeDate = moment(workTime.date, 'YYYY-MM-DD').tz(syriaTimezone).startOf('day');
        let  appointment;       
        if (today.isSame(workTimeDate)) {
          appointment = await this.appointmentRepository.find({
            where : {
              startingTime: MoreThan(moment().tz(syriaTimezone).toDate()), //
              workTime : {workTimeId}}, 
              
              relations: ['patient'],
              select : ['id','startingTime','finishingTime','patient'] ,
            });
          console.log("hii")
        } else {
          appointment = await this.appointmentRepository.find({
          where : {
            workTime : {workTimeId}}, 
            relations: ['patient'],
            select : ['id','startingTime','finishingTime','patient'] 
          });

        }

        if(appointment.length == 0)
        {
          throw new NotFoundException(
            `thier is no appoitments in this worktime ${workTimeId}`
          );
        }

             
        const appointmentwithBooked =(appointment.map( result => {
          let isBooked = false;
          if(result.patient)
          {
            isBooked = true
          }
          const appointment = {
            id : result.id,
            startingTime : result.startingTime,
            finishingTime : result.finishingTime  ,
            isBooked :  isBooked  
                 };
          return appointment;
          }));
        return {appointment : appointmentwithBooked};
      }
      async setAppitments(appointmentId : number,patientId : number){
        const appointment = await this.appointmentRepository.findOne({
          where : {
           id : appointmentId
          },
        relations: ['patient','workTime']})
        if(!appointment)
        {
          throw new NotFoundException(
            `thier is no appoitments with this id`
          );
        }
        if(appointment.patient)
        {
          throw new BadRequestException('youe cant book an booked appoitment')
        }
        const patient = await this.PatientRepository.findOne({
          where : {patientId}
        })
        if (!patient) {
          throw new HttpException('patient not found', HttpStatus.NOT_FOUND);
        }
        const syriaTimezone = 'Asia/Damascus';
        const moment = require('moment-timezone');
        const appointmentDate = moment(appointment.workTime.date).tz(syriaTimezone).startOf('day');
        const today = moment().tz(syriaTimezone).startOf('day');
        if (appointmentDate.isBefore(today)) {
          throw new BadRequestException('you can not book an old appointment')
        } 
        const timeDiffDays = appointmentDate.diff(today, 'days');
        if (timeDiffDays == 0) {
          const startingTime = moment(`${appointment.workTime.date} ${appointment.startingTime}`, 'YYYY-MM-DD HH:mm').tz(syriaTimezone);
          const timeDiffHours = startingTime.diff(moment(), 'hours');
          if (timeDiffHours < 0) {
            throw new BadRequestException('you can not book an old appointment')
          } 
          else if (timeDiffHours == 0)
          {
            const timeDiffMinutes = startingTime.diff(moment(), 'Minutes');
            if(timeDiffMinutes < 30)
            {
              throw new BadRequestException('you can not book an old appointment')
            }
          }
        } 
        appointment.patient = patient;
        await this.appointmentRepository.save(appointment);
      }


      async getTimeBetweenTodayAndTheAppoitment(appointmentId : number){
        const appointment = await this.appointmentRepository.findOne({
          where : {
           id : appointmentId
          },
        relations : ['workTime']
      })
        if(!appointment)
        {
          throw new NotFoundException(
            `thier is no appoitments with this id`
          );
        }
        const now = new Date();
        const syriaTimezone = 'Asia/Damascus';
        const moment = require('moment-timezone');
        const currentHour = Number(moment().tz(syriaTimezone).format('H'));
        const currentMinute = now.getUTCMinutes();
        const today = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
        const date = new Date(appointment.workTime.date);
        const startingTime = appointment.startingTime.split(':').map(Number);
        
        if (date.getTime() === today.getTime()) {
          if (currentHour === startingTime[0]) {
            const timeDiffMinutes = currentMinute - startingTime[1];
            return { message: `${timeDiffMinutes} دقائق` };
          } else {
            const timeDiffHours = currentHour - startingTime[0];
            return { message: `${timeDiffHours} ساعات` };
          }
        } else {
          const timeDiffDays = Math.round((date.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
          return { message: `${timeDiffDays} أيام` };
        }
      }

      async getWorkTime(clinicId : number,doctorId : number): Promise<{ workTimes: WorkTimeWithAppointments[],startingDate :string, finishingDate : string }> {

        if (!doctorId) {
          throw new HttpException(`thier is something wrong with the token`, HttpStatus.NOT_FOUND);
        }
        const doctor = await this.doctorRepository.findOne({where : {doctorId : doctorId}});
        if (!doctor ) {
          throw new HttpException(`doctor with id ${doctorId} not found`, HttpStatus.NOT_FOUND);
        }
        const clinic = await this.clinicRepository.findOne({where : {clinicId : clinicId}});
        if (!clinic ) {
          throw new HttpException(`clinic with id ${clinicId} not found`, HttpStatus.NOT_FOUND);
        }

        //see the connection 
        const doctorClinic = await this.doctorClinicRepository.findOne({
          where: { doctor: { doctorId }, clinic: { clinicId } },
        });
        if (!doctorClinic ) {
          throw new NotFoundException(
            `No doctorClinic entity found for doctor ${doctor.doctorId} and clinic ${clinic.clinicId}`
          );
        }

         const now = new Date();
        const today = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));

        const lastAppointment = new Date(today);
        lastAppointment.setDate(today.getDate() + doctorClinic.daysToSeeLastAppointment);
        const workTime = await this.workTimeRepository.find({
          where: {
              doctor: { doctorId },
              clinic: { clinicId },
              date: Between(today.toISOString(), lastAppointment.toISOString())
          },
          order: {
            date: 'ASC'
          },
        });
        if(workTime.length == 0)
        {
          throw new NotFoundException(
            `you have no set any worktime in this clinic clinic ${clinic.clinicId}`
          );
        }
        
        
        
        const workTimeWithAppointments = await Promise.all(workTime.map(async result => {
          const workTime = {
              workTimeId: result.workTimeId,
              startingTime: result.startingTime,
              finishingTime: result.finishingTime,
              day: result.day,
              date: result.date,
              haveAppointments : false
          };
          const appointment = await this.appointmentRepository.findOne({
            where: {
              workTime: result,
              patient: IsNull(),
            },
            relations: ['patient'],
          });

          if(appointment)
          {
            workTime.haveAppointments = true
          }      
          return workTime;
          }));
        // return {worktimes : workTimeWithAppointments};
        return { workTimes: workTimeWithAppointments,
                  startingDate : workTime[0].date,
                  finishingDate :  workTime[workTime.length-1].date
         };
      }

    }    