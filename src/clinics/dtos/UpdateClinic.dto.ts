import { IsNotEmpty, IsNumber, IsOptional, IsString, Max, Min } from "class-validator";

export class UpdateClinicDto {
    @IsString()
    @IsOptional()
    clinicName:string;

    @IsOptional()
    @IsNumber()
    @Min(34)
    @Max(38)
    Latitude:number;

    @IsOptional()
    @IsNumber()
    @Min(34)
    @Max(38)
    Longitude:number;
  };
  