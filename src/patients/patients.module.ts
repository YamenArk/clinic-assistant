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

@Module({
  imports : [
    TypeOrmModule.forFeature([Patient,Appointment]),
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
})
export class PatientsModule {}
