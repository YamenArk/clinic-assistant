import { Module } from '@nestjs/common';
import { DoctorsService } from './services/doctors/doctors.service';
import { DoctorsController } from './controllers/doctors/doctors.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Doctor } from 'src/typeorm/entities/doctors';
import { Insurance } from 'src/typeorm/entities/insurance';
import { SubSpecialty } from 'src/typeorm/entities/sub-specialty';

@Module({
  imports: [TypeOrmModule.forFeature([Doctor,Insurance,SubSpecialty])],
  providers: [DoctorsService],
  controllers: [DoctorsController]
})
export class DoctorsModule {}
