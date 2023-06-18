import { IsEmail, IsNotEmpty } from "class-validator";

export class emailDto {
  @IsNotEmpty()
  @IsEmail()
  email: string;
}