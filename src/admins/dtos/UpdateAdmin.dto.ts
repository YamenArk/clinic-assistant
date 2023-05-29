import { IsBoolean, IsEmail, IsEnum, IsNotEmpty, IsOptional, IsString, Matches } from 'class-validator'

export class UpdateAdminDto {
    @IsNotEmpty()
    @IsString()
    @IsEmail()
    @IsOptional()
    email?: string;

    @IsNotEmpty()
    @IsString()
    @Matches(/^09\d{8}$/)
    @IsOptional()
    phonenumber?: string;   

    @IsString()
    @IsNotEmpty()
    @IsOptional()
    firstname?: string;

    @IsString()
    @IsNotEmpty()
    @IsOptional()
    lastname?: string;

    @IsNotEmpty()
    @IsOptional()
    @IsBoolean()
    active?: boolean;

}