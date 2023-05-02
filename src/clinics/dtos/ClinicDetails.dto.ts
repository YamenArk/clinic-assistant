import { IsNotEmpty, IsString } from "class-validator";

export class ClinicDto {
    @IsString()
    @IsNotEmpty()
    clinicName:string;

    @IsString()
    @IsNotEmpty()
    location:string;

    @IsString()
    @IsNotEmpty()
    locationId:string;
  };
  