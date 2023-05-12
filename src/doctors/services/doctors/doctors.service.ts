import { BadRequestException, HttpException, HttpStatus, Injectable, NotFoundException, UnauthorizedException, UseInterceptors } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { validate } from 'class-validator';
import { createWriteStream } from 'fs';
import { CACHE_MANAGER, CacheInterceptor, CacheModule } from '@nestjs/common'; // import CACHE_MANAGER
import { Doctor } from 'src/typeorm/entities/doctors';
import { Insurance } from 'src/typeorm/entities/insurance';
import { SubSpecialty } from 'src/typeorm/entities/sub-specialty';
import {  CreateDoctorParams, CreateWorkTimeParams, UpdateDoctoeClinicParams, UpdateDoctorForAdminParams, UpdateDoctorParams, filterDocrotsParams } from 'src/utils/types';
import { MoreThanOrEqual, Repository } from 'typeorm';
import { MailService } from 'src/middleware/mail/mail.service';
import { Inject } from '@nestjs/common';
import { FindManyOptions } from 'typeorm';
import { DoctorClinic } from 'src/typeorm/entities/doctor-clinic';
import { Clinic } from 'src/typeorm/entities/clinic';
import { CreateWorkTimeDto } from 'src/doctors/dtos/CreateWorkTime.dto';
import { WorkTime } from 'src/typeorm/entities/work-time';
import { Appointment } from 'src/typeorm/entities/appointment';
import { AuthLoginDto } from 'src/doctors/dtos/AuthLogin.dto';
import * as bcrypt from 'bcryptjs'
import { JwtService } from '@nestjs/jwt';
import { ColdObservable } from 'rxjs/internal/testing/ColdObservable';
@Injectable()
@UseInterceptors(CacheInterceptor)
export class DoctorsService {
    constructor (
      private jwtService : JwtService,
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


      async createWorkTime(workTimeDetails : CreateWorkTimeParams,clinicId : number,doctorId : number)
      {
        const weekDays = ['الخميس', 'الجمعة', 'السبت', 'الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء'];
        const weekdayMap = {
          [weekDays[0]]: 0,
          [weekDays[1]]: 1,
          [weekDays[2]]: 2,
          [weekDays[3]]: 3,
          [weekDays[4]]: 4,
          [weekDays[5]]: 5,
          [weekDays[6]]: 6
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
        const startDate = new Date(workTimeDetails.startDate);
        const endDate = new Date(workTimeDetails.endDate);
        const days = workTimeDetails.days;
        const result = [];      

        for (let date = startDate; date <= endDate; date.setDate(date.getDate() + 1)) {
          const dayOfWeek = days[weekdayMap[date.toLocaleDateString('ar-EG', { weekday: 'long' })]];
          if (dayOfWeek) {
            result.push({ day: dayOfWeek, date: formatDate(date) });
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
            appointment.day = workTime.day;
            appointment.date =  workTime.date;
            appointment.workTime = workTime;
            this.appointmentRepository.save(appointment)
            j++;
          }
          i++
        }
          
      }

      async getWorkTime(clinicId : number,doctorId : number){
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
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const workTime = await this.workTimeRepository.find({
          where: { doctor: { doctorId }, clinic: { clinicId },date: MoreThanOrEqual(today.toISOString()), },
        });
        if(workTime.length == 0)
        {
          throw new NotFoundException(
            `you have no set any worktime in this clinic clinic ${clinic.clinicId}`
          );
        }
        return {workTime : workTime};
      }
    

      async getAppoitment(workTimeId : number,doctorId : number){
        if (!doctorId) {
          throw new HttpException(`thier is something wrong with the token`, HttpStatus.NOT_FOUND);
        }
        const doctor = await this.doctorRepository.findOne({where : {doctorId : doctorId}});
        if (!doctor ) {
          throw new HttpException(`doctor with id ${doctorId} not found`, HttpStatus.NOT_FOUND);
        }
        const workTime = await this.workTimeRepository.findOne({where : {workTimeId : workTimeId}});
        if (!workTime ) {
          throw new HttpException(`clinic with id ${workTimeId} not found`, HttpStatus.NOT_FOUND);
        }
     
        const appointment = await this.appointmentRepository.find({where : {workTime : {workTimeId}}, relations: ['patient'] });
        if(appointment.length == 0)
        {
          throw new NotFoundException(
            `you have no set any appointment in this wotk time ${workTimeId}`
          );
        }
        
        return {appointment : appointment};
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


      //auth
      async login(authLoginDto: AuthLoginDto) {
        const { email, password } = authLoginDto;
        const doctor = await this.doctorRepository.findOne({ where: { email: email } });
      
        if (!doctor) {
          throw new UnauthorizedException('Invalid credentials');
        }
      
        const isPasswordMatch = await bcrypt.compare(password, doctor.password); // compare the hashed passwords
        if (!isPasswordMatch) {
          throw new UnauthorizedException('Invalid credentials');
        }
      
        const payload = {
          doctorId: doctor.doctorId,
        };
      
        return {
          access_token: this.jwtService.sign(payload)
        };
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
      
        return doctor.doctorId;
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