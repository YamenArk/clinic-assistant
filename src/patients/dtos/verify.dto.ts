import { IsDateString, IsEnum, IsNotEmpty, IsNumber, IsNumberString, IsString, Matches } from "class-validator";

export class verifyDto {
  @IsNotEmpty()
  @IsString()
  patientId: string;

  @IsNotEmpty()
  @IsNumber()
  code: number;
}
