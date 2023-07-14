import { CacheModule, Module } from '@nestjs/common';
import { AdminsController } from './controllers/admins/admins.controller';
import { AdminsService } from './services/admins/admins.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Admin } from 'src/typeorm/entities/admin';
import { AdminJwtStrategy } from 'src/middleware/auth/jwt.strategy';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule,ConfigService } from '@nestjs/config';
import { PassportModule } from '@nestjs/passport';
import { MailService } from 'src/middleware/mail/mail.service';
import { Secretary } from 'src/typeorm/entities/secretary';
import { Doctor } from 'src/typeorm/entities/doctors';
import { JWTAuthGuardAdmin } from 'src/middleware/auth/jwt-auth.guard';
import { Transctions } from 'src/typeorm/entities/transctions';
import { PayInAdvance } from 'src/typeorm/entities/pay-in-advance';
import { MonthlySubscription } from 'src/typeorm/entities/monthly-subscription';
import { SubAdminPayment } from 'src/typeorm/entities/sub-admin-payment';
import { SubAdminPaymentReport } from 'src/typeorm/entities/sub-admin-payment-report';
import { NewDoctorReports } from 'src/typeorm/entities/new-doctor-reports';
import { TransctionsReports } from 'src/typeorm/entities/transctions-reports';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Admin,
      Secretary,
      Doctor,
      Transctions,
      PayInAdvance,
      MonthlySubscription,
      SubAdminPayment,
      SubAdminPaymentReport,
      NewDoctorReports,
      TransctionsReports
    ]),
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
  controllers: [AdminsController],
  providers: [AdminsService,AdminJwtStrategy,MailService,JWTAuthGuardAdmin]
})
export class AdminsModule {}
