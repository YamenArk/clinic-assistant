import { ArrayMinSize, IsBoolean, IsEmail, IsEnum, IsNotEmpty, IsOptional, IsString } from "class-validator";

export class CreateDoctorDto {
  @IsString()
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @IsString()
  @IsNotEmpty()
  phonenumberForAdmin: string;

  @IsNotEmpty()
  @IsEnum(['male', 'female'])
  gender: 'male' | 'female'; // update type here

  @IsString()
  @IsNotEmpty()
  firstname: string;

  @IsString()
  @IsNotEmpty()
  lastname: string;


  @ArrayMinSize(1) 
  clinics: { clinicId: number }[];

  @ArrayMinSize(1) 
  subSpecialties: { subSpecialtyId: number }[];

  @IsOptional()
  insurances: { insuranceId: number }[];
}
