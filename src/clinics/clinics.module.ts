import { Module } from '@nestjs/common';
import { ClinicsService } from './services/clinics/clinics.service';
import { ClinicsController } from './controllers/clinics/clinics.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Clinic } from 'src/typeorm/entities/clinic';
import { Doctor } from 'src/typeorm/entities/doctors';
import { DoctorClinic } from 'src/typeorm/entities/doctor-clinic';

@Module({
  imports: [TypeOrmModule.forFeature([Clinic,Doctor,DoctorClinic])],
  providers: [ClinicsService],
  controllers: [ClinicsController]
})
export class ClinicsModule {}
