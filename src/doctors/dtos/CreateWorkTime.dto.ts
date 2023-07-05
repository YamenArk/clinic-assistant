import { HttpException, HttpStatus } from "@nestjs/common";
import { ArrayMinSize, IsDateString, IsEnum, IsNotEmpty, IsOptional, IsString, Matches } from "class-validator";
import { stat } from "fs";

enum Day {
  الأحد = 'الأحد',
  الاثنين = 'الاثنين',
  الثلاثاء = 'الثلاثاء',
  الأربعاء = 'الأربعاء',
  الخميس = 'الخميس',
  الجمعة = 'الجمعة',
  السبت = 'السبت',
}

export class CreateWorkTimeDto {

  @IsNotEmpty()
  @IsString()
  @Matches(/^([01]\d|2[0-3]):([0-5]\d)$/) // Check that the value is in the format HH:mm
  startingTime: string;

  @IsNotEmpty()
  @IsString()
  @Matches(/^([01]\d|2[0-3]):([0-5]\d)$/) // Check that the value is in the format HH:mm
  finishingTime: string;

  @ArrayMinSize(1)
  @IsEnum(Day, {
    each: true,
    message: 'القيمة "${value}" غير صالحة. يجب أن تكون إحدى الأيام التالية: الأحد، الاثنين الثلاثاء، الأربعاء، الخميس، الجمعة، السبت.'
  })
  days: Day[];

  @IsNotEmpty()
  @IsDateString()
  startDate: string;

  @IsNotEmpty()
  @IsDateString()
  endDate: string;

  static validate(workTimeDetails: CreateWorkTimeDto) {
    const startDate = new Date(workTimeDetails.startDate + 'T00:00:00');
    const endDate = new Date(workTimeDetails.endDate + 'T00:00:00');
    const today = new Date();
    startDate.setHours(0, 0, 0, 0);
    endDate.setHours(0, 0, 0, 0);
    today.setHours(0, 0, 0, 0);
    if (startDate < today) {
      throw new HttpException('يجب أن يكون تاريخ البدء في المستقبل أو اليوم الحالي', HttpStatus.BAD_REQUEST);
    }
    if (endDate.getTime() <= startDate.getTime()) {
      throw new HttpException('يجب أن يكون تاريخ الانتهاء أكبر من تاريخ البدء', HttpStatus.BAD_REQUEST);
    }
  }
}