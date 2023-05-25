import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { validate } from 'class-validator';
import { doc } from 'prettier';
import { Area } from 'src/typeorm/entities/Area';
import { Clinic } from 'src/typeorm/entities/clinic';
import { DoctorClinic } from 'src/typeorm/entities/doctor-clinic';
import { Doctor } from 'src/typeorm/entities/doctors';
import { ClinicParams, UpdateClinicParams } from 'src/utils/types';
import { Repository } from 'typeorm';

@Injectable()
export class ClinicsService {
    constructor (
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
          const clinics = await this.clinicRepository.find({ select, relations: ['area'] });        
          return clinics;
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
      async createClinic(clinicDetails: ClinicParams,areaId : number):Promise<void>{
          const area  = await this.areaRepository.findOne({where : {areaId : areaId}});
            if (!area ) {
                throw new HttpException(`area with id ${areaId} not found`, HttpStatus.NOT_FOUND);
                      }
          const newClinic = this.clinicRepository.create({
              ...clinicDetails,
              createdAt : new Date()
          })
           // Validate the updatedDoctor object using class-validator
           const errors = await validate(newClinic);
           if (errors.length > 0) {
             throw new HttpException(`Validation failed: ${errors.join(', ')}`, HttpStatus.BAD_REQUEST);
           }
           newClinic.area = area;
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
        const doctorClinics = await this.doctorClinicRepository.find({
          where: { clinic: { clinicId: clinic.clinicId } },
          relations: ['doctor'],
        });
        
        const doctors = doctorClinics.map(doctorClinic => doctorClinic.doctor);
        if (doctors.length === 0) {
          throw new HttpException(`No doctors found for this clinic`, HttpStatus.NOT_FOUND);
        }
        return doctors;
      }
    }
