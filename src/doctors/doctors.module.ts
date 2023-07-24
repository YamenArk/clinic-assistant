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
import { DoctorAdminJwtStrategy, DoctorJwtStrategy } from 'src/middleware/auth/jwt.strategy';
import { Secretary } from 'src/typeorm/entities/secretary';
import { Admin } from 'src/typeorm/entities/admin';
import { Specialty } from 'src/typeorm/entities/specialty';
import { DoctorPatient } from 'src/typeorm/entities/doctor-patient';
import { Patient } from 'src/typeorm/entities/patient';
import { JWTAuthGuardPatient } from 'src/middleware/auth/jwt-auth.guard';
import { Transctions } from 'src/typeorm/entities/transctions';
import { PayInAdvance } from 'src/typeorm/entities/pay-in-advance';
import { MulterModule } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { NewDoctorReports } from 'src/typeorm/entities/new-doctor-reports';
import { WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
// import { WebSocketModule } from '@nestjs/websockets';
import { WsAdapter } from '@nestjs/platform-ws';
import { PatientDoctosReport } from 'src/typeorm/entities/patient-doctos-report';
import { PatientNotification } from 'src/typeorm/entities/patient-notification';
import { PatientDelay } from 'src/typeorm/entities/patient-delays';
import { Gateway } from 'src/gateway/gateway';
import { Doctornotification } from 'src/typeorm/entities/doctor-notification';
import { SharedModule } from 'src/shared/shared.module';
@Module({
  imports: [
    SharedModule,
    TypeOrmModule.forFeature([
      PatientNotification,
      Doctor,
      Insurance,
      SubSpecialty,
      DoctorClinic,
      Clinic,
      WorkTime,
      Appointment,
      Admin,
      Secretary,
      Specialty,
      DoctorPatient,
      Patient,
      Transctions,
      PayInAdvance,
      NewDoctorReports,
      PatientDoctosReport,
      PatientDelay,
      Doctornotification,
    ]),
    WsAdapter,
    MulterModule.register({
      storage: diskStorage({
        destination: './uploads',
        filename: (req, file, cb) => {
          cb(null, `${new Date().getTime()}-${file.originalname}`);
        },
      }),
    }),

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
  providers: [DoctorsService, MailService,DoctorAdminJwtStrategy,DoctorJwtStrategy,JWTAuthGuardPatient],
  controllers: [DoctorsController],
})
export class DoctorsModule {}