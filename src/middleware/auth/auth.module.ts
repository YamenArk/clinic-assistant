import { Module } from '@nestjs/common';
import { Admin } from 'src/typeorm/entities/admin';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule,ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Doctor } from 'src/typeorm/entities/doctors';
import { AdminIsAdminJwtStrategy, AdminJwtStrategy, DoctorJwtStrategy, PatientJwtStrategy, SecretaryJwtStrategy } from './jwt.strategy';
import { Patient } from 'src/typeorm/entities/patient';
import { Secretary } from 'src/typeorm/entities/secretary';

@Module({
  imports: [
    TypeOrmModule.forFeature([Admin]),
    TypeOrmModule.forFeature([Doctor]),
    TypeOrmModule.forFeature([Patient]),
    TypeOrmModule.forFeature([Secretary]),
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
  controllers: [],
  providers: [AdminJwtStrategy,DoctorJwtStrategy,AdminIsAdminJwtStrategy,PatientJwtStrategy,SecretaryJwtStrategy]
})
export class AuthModule {}
