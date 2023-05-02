import { Module } from '@nestjs/common';
import { Admin } from 'src/typeorm/entities/admin';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule,ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Doctor } from 'src/typeorm/entities/doctors';
import { AdminIsAdminJwtStrategy, AdminJwtStrategy, DoctorJwtStrategy } from './jwt.strategy';

@Module({
  imports: [
    TypeOrmModule.forFeature([Admin]),
    TypeOrmModule.forFeature([Doctor]),
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
  providers: [AdminJwtStrategy,DoctorJwtStrategy,AdminIsAdminJwtStrategy]
})
export class AuthModule {}
