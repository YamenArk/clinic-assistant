import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Gateway } from 'src/gateway/gateway';
import { Doctornotification } from 'src/typeorm/entities/doctor-notification';
import { Doctor } from 'src/typeorm/entities/doctors';
import { Patient } from 'src/typeorm/entities/patient';
import { PatientNotification } from 'src/typeorm/entities/patient-notification';

@Module({
  imports: [TypeOrmModule.forFeature([
    Patient,
    PatientNotification,
    Doctor,
    Doctornotification])],
    providers: [Gateway],
    exports: [Gateway],
})
export class SharedModule {}
