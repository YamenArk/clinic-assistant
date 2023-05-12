import { IsNotEmpty, IsString } from "class-validator";

export class ClinicDto {
    @IsNotEmpty()
    @IsString()
    clinicName:string;

    @IsNotEmpty()
    @IsString()
    Latitude:string;

    @IsNotEmpty()
    @IsString()
    Longitude:string;
  };
  