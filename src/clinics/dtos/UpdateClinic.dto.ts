import { IsNotEmpty, IsOptional, IsString } from "class-validator";

export class UpdateClinicDto {
    @IsString()
    @IsNotEmpty()
    @IsOptional()
    clinicName:string;

    @IsString()
    @IsNotEmpty()
    @IsOptional()
    location:string;

    @IsString()
    @IsNotEmpty()
    @IsOptional()
    locationId:string;
  };
  