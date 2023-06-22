import { BadRequestException, HttpException, HttpStatus, Injectable, NotFoundException, UnauthorizedException, UseInterceptors } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { validate } from 'class-validator';
import { createWriteStream } from 'fs';
import { CACHE_MANAGER, CacheInterceptor, CacheModule } from '@nestjs/common'; // import CACHE_MANAGER
import { Doctor } from 'src/typeorm/entities/doctors';
import { Insurance } from 'src/typeorm/entities/insurance';
import { SubSpecialty } from 'src/typeorm/entities/sub-specialty';
import {  CreateDoctorParams, CreateWorkTimeParams, UpdateDoctoeClinicParams, UpdateDoctorForAdminParams, UpdateDoctorParams, evaluateDoctorParams, filterDocrotsParams, filterNameParams, profileDetailsParams, secondFilterDocrotsParams,WorkTimeWithAppointments, workTimeFilterParams,appointmentwithBooked } from 'src/utils/types';
import { Between, In, IsNull, Like, MoreThanOrEqual, Not, Repository } from 'typeorm';
import { MailService } from 'src/middleware/mail/mail.service';
import { Inject } from '@nestjs/common';
import { DoctorClinic } from 'src/typeorm/entities/doctor-clinic';
import { Clinic } from 'src/typeorm/entities/clinic';
import { WorkTime } from 'src/typeorm/entities/work-time';
import { Appointment } from 'src/typeorm/entities/appointment';
import { AuthLoginDto } from 'src/doctors/dtos/AuthLogin.dto';
import * as bcrypt from 'bcryptjs'
import { JwtService } from '@nestjs/jwt';
import { Admin } from 'src/typeorm/entities/admin';
import { Secretary } from 'src/typeorm/entities/secretary';
import { Specialty } from 'src/typeorm/entities/specialty';
import { DoctorPatient } from 'src/typeorm/entities/doctor-patient';
import { Patient } from 'src/typeorm/entities/patient';
import { doc } from 'prettier';
import { pairwise } from 'rxjs';
@Injectable()
@UseInterceptors(CacheInterceptor)
export class DoctorsService {
    constructor (
        private jwtService : JwtService,
        @InjectRepository(Patient) 
        private PatientRepository : Repository<Patient>,
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
        private readonly mailService: MailService,
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
        const doctorClinicEntities = await Promise.all(clinicsArray.map(async (clinic) => {
          const doctorClinic = new DoctorClinic();
          doctorClinic.doctor = newDoctor;
          doctorClinic.clinic = clinic;
          clinic.numDoctors ++;
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

      async findDoctors(type?: number) {
        const select: Array<keyof Doctor> =['active', 'phonenumberForAdmin', 'email', 'firstname', 'lastname', 'doctorId','gender'];
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

      ////////////////////////////////////////////doctor

      async updateprofile(doctorId : number,profileDetails : profileDetailsParams,file: Express.Multer.File){
          const doctor = await this.doctorRepository.findOne({
            where: { doctorId },
          });
          if (!doctor) {
            throw new HttpException('Doctor not found', HttpStatus.NOT_FOUND);
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
          profileDetails.profilePicture = uploadPath;
          }
        const updatedDoctor = Object.assign(doctor, profileDetails); // Merge profileDetails into the doctor object
        await this.doctorRepository.save(updatedDoctor); // Save the updated doctor object
      }

      async getprofile(doctorId : number){
        const doctor = await this.doctorRepository.findOne({

          where: { doctorId },
          select : ['doctorId','firstname','lastname','description','evaluate',"phonenumber","profilePicture"] 
        });
        if (!doctor) {
          throw new HttpException('Doctor not found', HttpStatus.NOT_FOUND);
        }
        return {doctor : doctor}
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
            appointment.workTime = workTime;
            this.appointmentRepository.save(appointment)
            j++;
          }
          i++
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
          }
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
            `you have not set any appointment in this wotk time ${workTimeId}`
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


      async login(authLoginDto: AuthLoginDto) {
        const { email, password } = authLoginDto;
        const admin = await this.adminRepository.findOne({where: { email: email }});
        if (admin) {
          const isPasswordMatch = await bcrypt.compare(password, admin.password); // compare the hashed passwords
          if (!isPasswordMatch) {
            throw new UnauthorizedException('Invalid credentials');
          }
          if(admin.isAdmin)
          {
            const payload = {
              adminId: admin.adminId,
              type  : 0
            };
            return {
              access_token: this.jwtService.sign(payload),
             type : 0
            };
          }
          else
          {
            const payload = {
              adminId: admin.adminId,
              type : 1
            };
            return {
              access_token: this.jwtService.sign(payload),
             type : 1
            };
          }
        }


        const doctor = await this.doctorRepository.findOne({ where: { email: email } });
        if (doctor) {
          const isPasswordMatch = await bcrypt.compare(password, doctor.password); // compare the hashed passwords
          if (!isPasswordMatch) {
            throw new UnauthorizedException('Invalid credentials');
          }
          const payload = {
            doctorId: doctor.doctorId,
            type : 2
          };
          return {
            access_token: this.jwtService.sign(payload),
            type : 2
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
          select : ['doctorId','firstname','lastname','description','evaluate',"phonenumber","profilePicture"],
          relations: ['workTime','workTime.clinic'],
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
        const patient = await this.PatientRepository.findOne({
          where : {patientId}
          })
          if (!patient) {
            throw new HttpException('patient not found', HttpStatus.NOT_FOUND);
          }
          // console.log(doctor);
          // console.log(patientId);
          
          let doctorPatient = await this.doctorPatientRepository.findOne({
            where: { doctor: {
              doctorId : doctorId
            },
             patient: {
              patientId : patientId
             } },
          });          
          if(!doctorPatient){
            throw new BadRequestException('you cant Evaluate a doctor you are not connected with')
          }
          doctorPatient.evaluate = evaluateDoctor.evaluate;
          await this.doctorPatientRepository.save(doctorPatient);
          return {message : 'doctor evaluated successfully'}
      }

      async getevaluateDoctor(patientId : number,doctorId : number){
        const doctor = await this.doctorRepository.findOne({
          where: { doctorId }
        });
        if (!doctor) {
          throw new HttpException('Doctor not found', HttpStatus.NOT_FOUND);
        }
        const patient = await this.PatientRepository.findOne({
          where : {patientId}
          })
          if (!patient) {
            throw new HttpException('patient not found', HttpStatus.NOT_FOUND);
          }

          let doctorPatient = await this.doctorPatientRepository.findOne({
            where: { doctor: {
              doctorId : doctorId
            },
             patient: {
              patientId : patientId
             } },
          });          
          if(!doctorPatient){
            throw new BadRequestException('you are not connected to this doctor to get the evaluate')
          }
          if(!doctorPatient.evaluate)
          {
            return {evaluate : 0}
          }
          return {evaluate : doctorPatient.evaluate}
      }

      async getDoctorClinic(doctorId : number ,clinicId : number){
        const doctor = await this.doctorRepository.findOne({
          where: { doctorId },
          select : ['firstname','lastname','profilePicture']
        });
        if (!doctor) {
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
        const startDate = new Date(year, month - 1, 1);
        const endDate = new Date(year, month, 0);
        const workTime = await this.workTimeRepository.find({
          where: {
            doctor: { doctorId },
            clinic: { clinicId },
            date: Between(startDate.toISOString().slice(0, 10), endDate.toISOString().slice(0, 10)),
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
     
        const appointment = await this.appointmentRepository.find({
          where : {
            workTime : {workTimeId}}, 
            relations: ['patient'],
            select : ['id','startingTime','finishingTime','patient'] 
          });
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
          }})
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
    }    