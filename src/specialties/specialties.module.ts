import { Module } from '@nestjs/common';
import { SpecialtiesController } from './controllers/specialties/specialties.controller';
import { SpecialtiesService } from './services/specialties/specialties.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Specialty } from 'src/typeorm/entities/specialty';
import { SubSpecialty } from 'src/typeorm/entities/sub-specialty';
import { DoctorAdminJwtStrategy } from 'src/middleware/auth/jwt.strategy';
import { Admin } from 'src/typeorm/entities/admin';

@Module({
  imports: [TypeOrmModule.forFeature([Admin,Specialty,SubSpecialty])],
  controllers: [SpecialtiesController],
  providers: [DoctorAdminJwtStrategy,SpecialtiesService]
})
export class SpecialtiesModule {}
