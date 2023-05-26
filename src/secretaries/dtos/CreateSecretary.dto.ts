
import { ArrayMinSize, IsBoolean, IsEmail, IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString } from "class-validator";

export class CreateSecretaryDto {
    @IsString()
    @IsNotEmpty()
    @IsEmail()
    email : string;

    @IsNotEmpty()
    @IsString()
    phonenumber: string ;


    @IsNotEmpty()
    @IsString()
    firstname: string;


    @IsNotEmpty()
    @IsString()
    lastname: string;

    @IsNotEmpty()
    @IsNumber()
    age: number;

}
