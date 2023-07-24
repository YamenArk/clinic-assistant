import { Module,CacheModule } from '@nestjs/common';
import { PatientsController } from './controllers/patients/patients.controller';
import { PatientsService } from './services/patients/patients.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Patient } from 'src/typeorm/entities/patient';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule,ConfigService } from '@nestjs/config';
import { Appointment } from 'src/typeorm/entities/appointment';
import { Admin } from 'typeorm';
import { PatientNotification } from 'src/typeorm/entities/patient-notification';
import { PatientDelay } from 'src/typeorm/entities/patient-delays';
import { PatientReminders } from 'src/typeorm/entities/patient-reminders';
import { Gateway } from 'src/gateway/gateway';
import { Doctornotification } from 'src/typeorm/entities/doctor-notification';
import { Doctor } from 'src/typeorm/entities/doctors';
import { SharedModule } from 'src/shared/shared.module';

@Module({
  imports : [
    SharedModule,
    TypeOrmModule.forFeature([
      Patient,
      Appointment,
      PatientNotification,
      PatientDelay,
      PatientReminders,
      Doctor,
      PatientNotification,
      Doctornotification,]),
    CacheModule.register(), // add CacheModule here
    PassportModule,
    JwtModule.registerAsync({
      imports :[ConfigModule],
      useFactory :async () => ({
        secret : process.env.JWT_SECRET
        ,signOptions: { expiresIn: '1d' },
  
      }),
      inject : [ConfigService]
    })
  ],
  controllers: [PatientsController],
  providers: [PatientsService]
  // providers: [PatientsService,Gateway]
})
export class PatientsModule {}
