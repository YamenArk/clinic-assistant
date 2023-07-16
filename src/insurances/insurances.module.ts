import { Module } from '@nestjs/common';
import { InsurancesController } from './controllers/insurances/insurances.controller';
import { InsurancesService } from './services/insurances/insurances.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Insurance } from 'src/typeorm/entities/insurance';
import { Doctor } from 'src/typeorm/entities/doctors';
import { DoctorAdminJwtStrategy } from 'src/middleware/auth/jwt.strategy';
import { Admin } from 'src/typeorm/entities/admin';

@Module({
  imports: [TypeOrmModule.forFeature([Admin,Insurance])],
  controllers: [InsurancesController],
  providers: [DoctorAdminJwtStrategy,InsurancesService]
})
export class InsurancesModule {}
