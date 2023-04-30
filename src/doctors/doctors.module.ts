import { Module, CacheModule } from '@nestjs/common';
import { DoctorsService } from './services/doctors/doctors.service';
import { DoctorsController } from './controllers/doctors/doctors.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Doctor } from 'src/typeorm/entities/doctors';
import { Insurance } from 'src/typeorm/entities/insurance';
import { SubSpecialty } from 'src/typeorm/entities/sub-specialty';
import { MailService } from 'src/middleware/mail/mail.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Doctor, Insurance, SubSpecialty]),
    CacheModule.register(), // add CacheModule here
  ],
  providers: [DoctorsService, MailService],
  controllers: [DoctorsController],
})
export class DoctorsModule {}