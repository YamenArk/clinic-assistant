import { Module } from '@nestjs/common';
import { GovernoratesController } from './controllers/governorates/governorates.controller';
import { GovernoratesService } from './services/governorates/governorates.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Governorate } from 'src/typeorm/entities/Governorate';
import { Area } from 'src/typeorm/entities/Area';

@Module({
  imports: [TypeOrmModule.forFeature([Governorate,Area])],
  controllers: [GovernoratesController],
  providers: [GovernoratesService]
})
export class GovernoratesModule {}
