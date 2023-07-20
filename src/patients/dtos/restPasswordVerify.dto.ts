import { IsDateString, IsEnum, IsNotEmpty, IsNumber, IsNumberString, IsString, Matches } from "class-validator";

export class restPasswordVerifyDto {
  @IsNotEmpty()
  @IsNumber()
  patientId: number;

  @IsNotEmpty()
  @IsNumber()
  code: number;

  @IsNotEmpty()
  @IsString()
  newPassword: string;
}
