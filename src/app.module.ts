import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Admin } from './typeorm/entities/admin';
import { AdminsModule } from './admins/admins.module';
import { DoctorsModule } from './doctors/doctors.module';
import { Doctor } from './typeorm/entities/doctors';
import { Specialty } from './typeorm/entities/specialty';
import { SubSpecialty } from './typeorm/entities/sub-specialty';
import { Patient } from './typeorm/entities/patient';
import { Insurance } from './typeorm/entities/insurance';
import { SpecialtiesModule } from './specialties/specialties.module';
import { SubSpecialtiesModule } from './sub-specialties/sub-specialties.module';
import { ClinicsModule } from './clinics/clinics.module';
import { Clinic } from './typeorm/entities/clinic';
import { InsurancesModule } from './insurances/insurances.module';
import { DoctorClinic } from './typeorm/entities/doctor-clinic';
import { Commission } from './typeorm/entities/commission';
import { Secreatry } from './typeorm/entities/secretary';
import { WorkTime } from './typeorm/entities/work-time';
import { Appointment } from './typeorm/entities/appointment';
import { BlackList } from './typeorm/entities/black-list';
import { MailService } from './middleware/mail/mail.service';
import { AuthModule } from './middleware/auth/auth.module';
// clinicassistant
@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: 'localhost',
      port: 3306,
      username: 'root',
      password: '',
      database: 'clinicassistant',
      entities: [Admin,Doctor,Specialty,SubSpecialty,Patient,Insurance,Clinic,DoctorClinic,Commission,Secreatry,WorkTime,Appointment,BlackList],
      synchronize:  false ,
      migrationsRun: false,
      dropSchema: false
    }),
    AdminsModule,
    DoctorsModule,
    SpecialtiesModule,
    SubSpecialtiesModule,
    ClinicsModule,
    InsurancesModule,
    AuthModule,
    
      ],
  providers: [MailService]
})
export class AppModule {}
