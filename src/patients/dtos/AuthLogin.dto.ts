import { IsNotEmpty, IsNumber, IsNumberString, Matches } from "class-validator";

export class AuthLoginDto {
  @IsNotEmpty()
  @IsNumberString()
  @Matches(/^09\d{8}$/)
  phoneNumber: string;

  @IsNotEmpty()
  password: string;
}
