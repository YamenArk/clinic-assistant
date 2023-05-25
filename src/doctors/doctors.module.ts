import { Module, CacheModule } from '@nestjs/common';
import { DoctorsService } from './services/doctors/doctors.service';
import { DoctorsController } from './controllers/doctors/doctors.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Doctor } from 'src/typeorm/entities/doctors';
import { Insurance } from 'src/typeorm/entities/insurance';
import { SubSpecialty } from 'src/typeorm/entities/sub-specialty';
import { MailService } from 'src/middleware/mail/mail.service';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule,ConfigService } from '@nestjs/config';
import { DoctorClinic } from 'src/typeorm/entities/doctor-clinic';
import { Clinic } from 'src/typeorm/entities/clinic';
import { WorkTime } from 'src/typeorm/entities/work-time';
import { Appointment } from 'src/typeorm/entities/appointment';
import { DoctorJwtStrategy } from 'src/middleware/auth/jwt.strategy';
import { Secretary } from 'src/typeorm/entities/secretary';
import { Admin } from 'src/typeorm/entities/admin';

@Module({
  imports: [
    TypeOrmModule.forFeature([Doctor, Insurance, SubSpecialty,DoctorClinic,Clinic,WorkTime,Appointment,Admin,Secretary]),
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
  providers: [DoctorsService, MailService,DoctorJwtStrategy],
  controllers: [DoctorsController],
})
export class DoctorsModule {}