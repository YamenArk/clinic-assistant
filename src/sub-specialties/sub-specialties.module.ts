import { Module } from '@nestjs/common';
import { SubSpecialtiesService } from './services/sub-specialties/sub-specialties.service';
import { SubSpecialtiesController } from './controllers/sub-specialties/sub-specialties.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SubSpecialty } from 'src/typeorm/entities/sub-specialty';
import { Specialty } from 'src/typeorm/entities/specialty';

@Module({
  imports: [TypeOrmModule.forFeature([SubSpecialty,Specialty])],
  providers: [SubSpecialtiesService],
  controllers: [SubSpecialtiesController]
})
export class SubSpecialtiesModule {}
