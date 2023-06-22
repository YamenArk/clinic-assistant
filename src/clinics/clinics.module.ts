import { Module } from '@nestjs/common';
import { ClinicsService } from './services/clinics/clinics.service';
import { ClinicsController } from './controllers/clinics/clinics.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Clinic } from 'src/typeorm/entities/clinic';
import { Doctor } from 'src/typeorm/entities/doctors';
import { DoctorClinic } from 'src/typeorm/entities/doctor-clinic';
import { Area } from 'src/typeorm/entities/Area';
import { Specialty } from 'src/typeorm/entities/specialty';
import { SubSpecialty } from 'src/typeorm/entities/sub-specialty';

@Module({
  imports: [TypeOrmModule.forFeature([Clinic,Doctor,DoctorClinic,Area,Specialty,SubSpecialty])],
  providers: [ClinicsService],
  controllers: [ClinicsController]
})
export class ClinicsModule {}
