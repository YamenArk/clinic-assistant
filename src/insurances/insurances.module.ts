import { Module } from '@nestjs/common';
import { InsurancesController } from './controllers/insurances/insurances.controller';
import { InsurancesService } from './services/insurances/insurances.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Insurance } from 'src/typeorm/entities/insurance';
import { Doctor } from 'src/typeorm/entities/doctors';

@Module({
  imports: [TypeOrmModule.forFeature([Insurance])],
  controllers: [InsurancesController],
  providers: [InsurancesService]
})
export class InsurancesModule {}
