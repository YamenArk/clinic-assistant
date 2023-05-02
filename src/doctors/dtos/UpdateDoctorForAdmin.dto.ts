import { IsBoolean, IsEmail, IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator'

export class UpdateDoctorForAdminDto {
    @IsString()
    @IsNotEmpty()
    @IsEmail()
    @IsOptional()
    email?: string;

    @IsString()
    @IsNotEmpty()
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

    @IsNotEmpty()
    @IsOptional()
    @IsBoolean()
    active?: boolean;

}