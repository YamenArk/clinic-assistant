import { HttpException, HttpStatus } from "@nestjs/common";
import { IsNotEmpty, IsNumber, IsString, Max, Min, validate } from "class-validator";

export class ClinicDto {
    @IsNotEmpty()
    @IsString()
    clinicName:string;

    @IsNotEmpty()
    @IsNumber()
    @Min(34)
    @Max(39)
    Latitude:number;

    @IsNotEmpty()
    @IsNumber()
    @Min(34)
    @Max(39)
    Longitude:number;

    
    static validate(createSpecialtyDto: ClinicDto) {
 

    if (!/^([+-]?\d{1,2}\.\d{14})$/.test(createSpecialtyDto.Latitude.toString())) {
      throw new HttpException("Latitude must be in the format of '2 digits before the decimal point and 14 digits after the decimal point'", HttpStatus.BAD_REQUEST);
    }

    if (!/^([+-]?\d{1,2}\.\d{14})$/.test(createSpecialtyDto.Longitude.toString())) {
      throw new HttpException("Longitude must be in the format of '2 digits before the decimal point and 14 digits after the decimal point'", HttpStatus.BAD_REQUEST);
    }
  }
    
  };
  