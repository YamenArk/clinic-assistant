import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { validate } from 'class-validator';
import { doc } from 'prettier';
import { Area } from 'src/typeorm/entities/Area';
import { Clinic } from 'src/typeorm/entities/clinic';
import { DoctorClinic } from 'src/typeorm/entities/doctor-clinic';
import { Doctor } from 'src/typeorm/entities/doctors';
import { Specialty } from 'src/typeorm/entities/specialty';
import { ClinicParams, UpdateClinicParams, filterNameParams } from 'src/utils/types';
import { Repository } from 'typeorm';

@Injectable()
export class ClinicsService {
    constructor (
      @InjectRepository(Specialty) private specialtyRepository : 
      Repository<Specialty>,
       @InjectRepository(Area) private areaRepository : 
        Repository<Area>,
        @InjectRepository(Clinic) private clinicRepository : 
        Repository<Clinic>,
        @InjectRepository(Doctor) private doctorRepository:
         Repository<Doctor>,
         @InjectRepository(DoctorClinic) private doctorClinicRepository: 
         Repository<DoctorClinic>){}
    
         async findClinics() {
          const select: Array<keyof Clinic> = ['clinicId', 'clinicName', 'createdAt', 'numDoctors'];
          const clinics = await this.clinicRepository.find({ select, relations: ['area','area.governorate','specialty'] });        
          return clinics;
        }


        async filterClinicByName(filte :filterNameParams ){
          const query =  this.clinicRepository.createQueryBuilder('clinic')
          .select(['clinic.clinicId','clinic.clinicName','clinic.createdAt','clinic.numDoctors'])
          .leftJoinAndSelect('clinic.specialty', 'specialty')
          .leftJoinAndSelect('clinic.area', 'area')
          .leftJoinAndSelect('area.governorate', 'governorate')
          .where('clinic.clinicName LIKE :name', {
            name: `%${filte.filterName}%`,
          })
  
          const clinics = await query.getMany();
          if(clinics.length === 0)
          {
              throw new HttpException(`No clinic met the conditions `, HttpStatus.NOT_FOUND);
          }
          return {clinics : clinics};
  
        }

      async getLocation(clinicId : number){
        const select: Array<keyof Clinic> = ['clinicId', 'Longitude', 'Latitude'];
        const clinic = await this.clinicRepository.findOne({
          where: { clinicId: clinicId },
          select: select,
        });
        if (!clinic ) {
           throw new HttpException(`clinic with id ${clinicId} not found`, HttpStatus.NOT_FOUND);
        }
        return {clinic : clinic};
      }
      async createClinic(clinicDetails: ClinicParams,areaId : number,specialtyId : number):Promise<void>{
          const area  = await this.areaRepository.findOne({where : {areaId : areaId}});
            if (!area ) {
                throw new HttpException(`area with id ${areaId} not found`, HttpStatus.NOT_FOUND);
                      }
          const specialty  = await this.specialtyRepository.findOne({where : {specialtyId : specialtyId}});
          if (!specialty ) {
              throw new HttpException(`specialty with id ${areaId} not found`, HttpStatus.NOT_FOUND);
                    }           
          const newClinic = this.clinicRepository.create({
              ...clinicDetails,
              area : area,
              specialty : specialty,
              createdAt : new Date()
          })
           // Validate the updatedDoctor object using class-validator
           const errors = await validate(newClinic);
           if (errors.length > 0) {
             throw new HttpException(`Validation failed: ${errors.join(', ')}`, HttpStatus.BAD_REQUEST);
           }
          await this.clinicRepository.save(newClinic);
      }
      async updateClinic(clinicId:number,clinicDetails: UpdateClinicParams): Promise<void>{
          const clinic  = await this.clinicRepository.findOne({where : {clinicId : clinicId}});
          if (!clinic ) {
              throw new HttpException(`clinic with id ${clinicId} not found`, HttpStatus.NOT_FOUND);
                    }
                    
          // Create a new Doctor object with the updated properties
          const updatedClinic = this.clinicRepository.create({ ...clinic, ...clinicDetails });

          // Validate the updatedDoctor object using class-validator
          const errors = await validate(updatedClinic);
          if (errors.length > 0) {
            throw new HttpException(`Validation failed: ${errors.join(', ')}`, HttpStatus.BAD_REQUEST);
          }

          await this.clinicRepository.update({clinicId},{...clinicDetails});
      }

      async updateClinicArea(clinicId : number , areaId : number)
      {
          const clinic  = await this.clinicRepository.findOne({where : {clinicId : clinicId}});
          if (!clinic ) {
             throw new HttpException(`clinic with id ${clinicId} not found`, HttpStatus.NOT_FOUND);
          }
          const area  = await this.areaRepository.findOne({where : {areaId : areaId}});
          if (!area ) {
              throw new HttpException(`area with id ${areaId} not found`, HttpStatus.NOT_FOUND);
          }
          clinic.area = area;
          await this.clinicRepository.save(clinic);
      }



      async updateClinicSpecialty(clinicId : number , specialtyId : number)
      {
          const clinic  = await this.clinicRepository.findOne({where : {clinicId : clinicId}});
          if (!clinic ) {
             throw new HttpException(`clinic with id ${clinicId} not found`, HttpStatus.NOT_FOUND);
          }
          const specialty  = await this.specialtyRepository.findOne({where : {specialtyId : specialtyId}});
          if (!specialty ) {
              throw new HttpException(`area with id ${specialty} not found`, HttpStatus.NOT_FOUND);
          }
          clinic.specialty = specialty;
          await this.clinicRepository.save(clinic);
      }
      async deleteClinic(clinicId: number): Promise<void> {
          const clinic  = await this.clinicRepository.findOne({where : {clinicId : clinicId}});
          if (!clinic ) {
              throw new HttpException(`clinic with id ${clinicId} not found`, HttpStatus.NOT_FOUND);
            }
          await this.clinicRepository.delete(clinicId);
      }
      
    async addDoctorToClinic(doctorId: number, clinicId: number): Promise<void> {
        const doctor = await this.doctorRepository.findOne({ where: { doctorId } });
        const clinic = await this.clinicRepository.findOne({ where: { clinicId } });
        if (!doctor || !clinic) {
            throw new HttpException('Invalid doctor or clinic ID', HttpStatus.BAD_REQUEST);
        }
        const doctorClinic = await this.doctorClinicRepository.findOne({ where: { doctor: { doctorId: doctorId }, clinic: { clinicId:clinicId } } });
    
        if (doctorClinic) {
          throw new HttpException('Doctor is already associated with clinic', HttpStatus.NOT_FOUND);
        }
        const newDoctorClinic = new DoctorClinic();
        newDoctorClinic.doctor = doctor;
        newDoctorClinic.clinic = clinic;
        
        clinic.numDoctors = clinic.numDoctors + 1;
        await this.clinicRepository.save(clinic);

        
        await this.doctorClinicRepository.save(newDoctorClinic);
      }

      async removeDoctorFromClinic(doctorId: number, clinicId: number): Promise<void> {
        const doctor = await this.doctorRepository.findOne({ where: { doctorId } });
        const clinic = await this.clinicRepository.findOne({ where: { clinicId } });
    
        if (!doctor || !clinic) {
          throw new HttpException('Invalid doctor or clinic ID', HttpStatus.BAD_REQUEST);
        }
        const doctorClinic = await this.doctorClinicRepository.findOne({ where: { doctor: { doctorId: doctorId }, clinic: { clinicId:clinicId } } });
    
        if (!doctorClinic) {
          throw new HttpException('Doctor is not associated with clinic', HttpStatus.NOT_FOUND);
        }
    
        clinic.numDoctors = clinic.numDoctors - 1;
        await this.clinicRepository.save(clinic);
        await this.doctorClinicRepository.remove(doctorClinic);
      }

      async findAllDoctorsForClinics(clinicId: number){
        const clinic = await this.clinicRepository.findOne({ where: { clinicId } });
        if (!clinic) {
          throw new HttpException('Clinic not found', HttpStatus.NOT_FOUND);
        }
        // const doctorClinics = await this.doctorClinicRepository.createQueryBuilder('doctorClinic')
        // .leftJoinAndSelect('doctorClinic.doctor', 'doctor')
        // .select(['doctor.doctorId', 'doctor.firstname', 'doctor.lastname'])
        // .where('doctorClinic.clinic.clinicId = :clinicId', { clinicId: clinicId })
        // .getMany();
        // console.log(doctorClinics)
        // const doctors = doctorClinics.map(doctorClinic => doctorClinic.doctor);
        // if (doctors.length === 0) {
        //   throw new HttpException(`No doctors found for this clinic`, HttpStatus.NOT_FOUND);
        // }
        // const specialties = await this.specialtyRepository.find({
        //   where: { subSpecialties: { doctor: { doctorId: result.doctorId } } },
        //   relations: ['subSpecialties'],
        //   select: ['specialtyId', 'specialtyName']
        // });


        const doctors = await this.doctorRepository.find({
          where: {
              doctorClinic: {
                  clinic: clinic
              }
          },
          relations: ['doctorClinic'],
          select :['doctorId','phonenumberForAdmin','active','gender','firstname','lastname']
        });
        if (doctors.length === 0) {
          throw new HttpException(`No doctors found for this clinic`, HttpStatus.NOT_FOUND);
        }
        const doctorsWithoutClinics = doctors.map(doctor => {
          const { doctorClinic, ...rest } = doctor;
          return rest;
      });
        return doctorsWithoutClinics;
      }

      async getclinicForpatient (clinicId : number){
        const clinic = await this.clinicRepository.findOne({ 
          where: { clinicId },
          relations : ['doctorClinic.doctor','workTime.doctor','specialty','area.governorate']
         });
        if (!clinic) {
          throw new HttpException('Clinic not found', HttpStatus.NOT_FOUND);
        }
         let i  = 0;
         let doctors = []
         while(clinic.doctorClinic[i])
         {
          doctors[i] = {
            doctorId : clinic.doctorClinic[i].doctor.doctorId,
            firstname : clinic.doctorClinic[i].doctor.firstname,
            lastname : clinic.doctorClinic[i].doctor.lastname,
            evaluate : clinic.doctorClinic[i].doctor.evaluate,
            profilePicture : clinic.doctorClinic[i].doctor.profilePicture,
          }
          i++;
         }


        
        //check if the doctor is working  
        const now = new Date();
        const currentTime = now.toLocaleTimeString('en-US', { hour12: false });
        const currentDate = formatDate(now);

        let doctorWorkingNow;
        const isWorkingNow = clinic.workTime.some(workTime => {
          const { date, startingTime, finishingTime } = workTime;
          if (date !== currentDate) {
            return false; // not working on this date
          }
          if (currentTime < startingTime || currentTime > finishingTime) {
            return false; // not working at this time
          }
          doctorWorkingNow = {
            doctorId : workTime.doctor.doctorId,
            firstname : workTime.doctor.firstname,
            lastname : workTime.doctor.lastname,
          }
          return true; // working now
        });
        
        function formatDate(date) {
          const year = date.getFullYear();
          const month = String(date.getMonth() + 1).padStart(2, '0');
          const day = String(date.getDate()).padStart(2, '0');
          return `${year}-${month}-${day}`;
        }

        
        delete clinic.doctorClinic;
        delete clinic.workTime;

        if(isWorkingNow)
        {
          return {
            clinic : clinic,
            doctors : doctors,
            doctorWorkingNow : doctorWorkingNow
          }
        }
        doctorWorkingNow = null;
        return {
          clinic : clinic,
          doctors : doctors,
          doctorWorkingNow : doctorWorkingNow
        }
      }
    }
