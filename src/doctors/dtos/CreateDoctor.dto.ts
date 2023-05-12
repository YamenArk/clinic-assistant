import { ArrayMinSize, IsBoolean, IsEmail, IsEnum, IsNotEmpty, IsOptional, IsString } from "class-validator";

export class CreateDoctorDto {
  @IsNotEmpty()
  @IsString()
  @IsEmail()
  email: string;

  @IsNotEmpty()
  @IsString()
  phonenumberForAdmin: string;

  @IsNotEmpty()
  @IsEnum(['male', 'female'])
  gender: 'male' | 'female'; // update type here

  @IsNotEmpty()
  @IsString()
  firstname: string;

  @IsNotEmpty()
  @IsString()
  lastname: string;

  @IsNotEmpty()
  @ArrayMinSize(1) 
  clinics: { clinicId: number }[];

  @IsNotEmpty()
  @ArrayMinSize(1) 
  subSpecialties: { subSpecialtyId: number }[];

  @IsOptional()
  insurances: { insuranceId: number }[];
}
