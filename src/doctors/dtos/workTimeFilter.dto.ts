import { IsNotEmpty, IsString, Matches, validate } from 'class-validator';
import { HttpException, HttpStatus } from "@nestjs/common";


export class workTimeFilterDto {
  @IsNotEmpty()
  @IsString()
  @Matches(/^(0?[1-9]|1[0-2])$/, {
    message: 'The month must be a valid 2-digit number between 01 and 12.',
  })
  month: string;

  @IsNotEmpty()
  @IsString()
  @Matches(/^[0-9]{4}$/, {
    message: 'The year must be a valid 4-digit number in the format yyyy.',
  })
  year: string;

  static validate(workTimeFilterDto: workTimeFilterDto) {
    const { month, year } = workTimeFilterDto;
    const currentYear = new Date().getFullYear();
    const currentMonth = new Date().getMonth() + 1; // January is 0, so we add 1 to get the current month number

    if (Number(year) < currentYear || Number(year) > currentYear + 1 || (Number(year) === currentYear && Number(month) < currentMonth)) {
        throw new HttpException('The selected month and year must be equal to or greater than the current month and year, and no more than one year in the future.', HttpStatus.BAD_REQUEST);
      }
  }
}