import { Module } from '@nestjs/common';
import { SpecialtiesController } from './controllers/specialties/specialties.controller';
import { SpecialtiesService } from './services/specialties/specialties.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Specialty } from 'src/typeorm/entities/specialty';
import { SubSpecialty } from 'src/typeorm/entities/sub-specialty';

@Module({
  imports: [TypeOrmModule.forFeature([Specialty,SubSpecialty])],
  controllers: [SpecialtiesController],
  providers: [SpecialtiesService]
})
export class SpecialtiesModule {}
