import { IsBoolean, IsEmail, IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator'

export class UpdateDoctorForAdminDto {
    @IsNotEmpty()
    @IsString()
    @IsEmail()
    @IsOptional()
    email?: string;

    @IsNotEmpty()
    @IsString()
    @IsOptional()
    phonenumberForAdmin?: string;

    @IsNotEmpty()
    @IsEnum(['male', 'female'])
    @IsOptional()
    gender?: string;

    @IsString()
    @IsNotEmpty()
    @IsOptional()
    firstname?: string;

    @IsString()
    @IsNotEmpty()
    @IsOptional()
    lastname?: string;

}