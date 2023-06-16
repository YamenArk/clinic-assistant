import { IsNotEmpty, IsNumber, IsOptional, IsString, Max, Min } from "class-validator";

export class UpdateClinicDto {
    @IsString()
    @IsOptional()
    clinicName:string;

    @IsOptional()
    @IsNumber()
    @Min(30)
    @Max(40)
    Latitude:number;

    @IsOptional()
    @IsNumber()
    @Min(30)
    @Max(40)
    Longitude:number;
  };
  