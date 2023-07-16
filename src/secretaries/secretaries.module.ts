import { CacheModule, Module } from '@nestjs/common';
import { SecretariesController } from './controllers/secretaries/secretaries.controller';
import { SecretariesService } from './services/secretaries/secretaries.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule,ConfigService } from '@nestjs/config';
import { Doctor } from 'src/typeorm/entities/doctors';
import { DoctorClinic } from 'src/typeorm/entities/doctor-clinic';
import { Clinic } from 'src/typeorm/entities/clinic';
import { Secretary } from 'src/typeorm/entities/secretary';
import { Admin } from 'src/typeorm/entities/admin';
import { MailService } from 'src/middleware/mail/mail.service';
import { DoctorJwtStrategy, SecretaryJwtStrategy } from 'src/middleware/auth/jwt.strategy';
import { WorkTime } from 'src/typeorm/entities/work-time';
import { Appointment } from 'src/typeorm/entities/appointment';
import { Patient } from 'src/typeorm/entities/patient';

@Module({
  imports: [
    TypeOrmModule.forFeature([Doctor,DoctorClinic,Clinic,Admin,Secretary,WorkTime,Appointment,Patient]),
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
  controllers: [SecretariesController],
  providers: [SecretariesService, MailService,DoctorJwtStrategy,SecretaryJwtStrategy]
})
export class SecretariesModule {}
