import { HttpException, HttpStatus } from '@nestjs/common';
import { IsNotEmpty, IsString, Matches, ArrayMinSize, IsEnum, IsDateString, ArrayNotEmpty } from 'class-validator';

enum Day {
  الأحد = 'الأحد',
  الاثنين = 'الاثنين',
  الثلاثاء = 'الثلاثاء',
  الأربعاء = 'الأربعاء',
  الخميس = 'الخميس',
  الجمعة = 'الجمعة',
  السبت = 'السبت',
}

export class CreateManyWorkTimeDto {
  @ArrayNotEmpty()
  appointments: {
    day: Day;
    
    // @IsString()
    // @Matches(/^([01]\d|2[0-3]):([0-5]\d)$/) // Check that the value is in the format HH:mm
    // @IsNotEmpty()
    startingTime: string;
    
    // @IsNotEmpty()
    // @IsString()
    // @Matches(/^([01]\d|2[0-3]):([0-5]\d)$/) // Check that the value is in the format HH:mm
    finishingTime: string;
  }[];

  @IsNotEmpty()
  @IsDateString()
  startDate: string;

  @IsNotEmpty()
  @IsDateString()
  endDate: string;


  static validate(workTimeDetails: CreateManyWorkTimeDto) {
    const startDate = new Date(workTimeDetails.startDate + 'T00:00:00');
    const endDate = new Date(workTimeDetails.endDate + 'T00:00:00');
    const today = new Date();
    startDate.setHours(0, 0, 0, 0);
    endDate.setHours(0, 0, 0, 0);
    today.setHours(0, 0, 0, 0);
    if (startDate < today) {
      throw new HttpException('يجب أن يكون تاريخ البدء في المستقبل أو اليوم الحالي', HttpStatus.BAD_REQUEST);
    }
    if (endDate.getTime() < startDate.getTime()) {
      throw new HttpException('يجب أن يكون تاريخ الانتهاء أكبر من تاريخ البدء', HttpStatus.BAD_REQUEST);
    }
  }
}