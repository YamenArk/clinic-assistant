import { IsEmail, IsNotEmpty } from "class-validator";

export class CreateAdminDto {
    @IsNotEmpty()
    @IsEmail()
    email: string;

    @IsNotEmpty()
    phonenumber: string;
  };
  