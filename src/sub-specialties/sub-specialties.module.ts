import { Module } from '@nestjs/common';
import { SubSpecialtiesService } from './services/sub-specialties/sub-specialties.service';
import { SubSpecialtiesController } from './controllers/sub-specialties/sub-specialties.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SubSpecialty } from 'src/typeorm/entities/sub-specialty';
import { Specialty } from 'src/typeorm/entities/specialty';
import { DoctorAdminJwtStrategy } from 'src/middleware/auth/jwt.strategy';
import { Admin } from 'src/typeorm/entities/admin';

@Module({
  imports: [TypeOrmModule.forFeature([Admin,SubSpecialty,Specialty])],
  providers: [DoctorAdminJwtStrategy,SubSpecialtiesService],
  controllers: [SubSpecialtiesController]
})
export class SubSpecialtiesModule {}
