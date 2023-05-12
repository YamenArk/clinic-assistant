import { IsNotEmpty, IsOptional, IsString } from "class-validator";

export class UpdateClinicDto {
    @IsString()
    @IsNotEmpty()
    @IsOptional()
    clinicName:string;

    @IsNotEmpty()
    @IsString()
    @IsOptional()
    Latitude:string;

    @IsNotEmpty()
    @IsString()
    @IsOptional()
    Longitude:string;
  };
  