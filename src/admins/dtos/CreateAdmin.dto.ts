import { IsEmail, IsNotEmpty, IsString, Matches } from "class-validator";

export class CreateAdminDto {
    @IsNotEmpty()
    @IsEmail()
    email: string;

    @IsNotEmpty()
    @IsString()
    @Matches(/^09\d{8}$/)
    phonenumber: string;

    @IsNotEmpty()
    @IsString()
    firstname: string;

   
    @IsNotEmpty()
    @IsString()
    lastname: string;
    
  };
  