import { HttpException, HttpStatus } from "@nestjs/common";
import { IsNotEmpty, IsNumber, Max, Min } from "class-validator";

export class LongitudeLatitudeDto {
    @IsNotEmpty()
    @IsNumber()
    @Min(30)
    @Max(40)
    Latitude:number;

    @IsNotEmpty()
    @IsNumber()
    @Min(30)
    @Max(40)
    Longitude:number;

    
    static validate(longitudeLatitudeDto: LongitudeLatitudeDto) {
 

      if (!/^([+-]?\d{1,2}\.\d{14,15})$/.test(longitudeLatitudeDto.Latitude.toString())) {
        throw new HttpException("Latitude must be in the format of '2 digits before the decimal point and either 14 or 15 digits after the decimal point'", HttpStatus.BAD_REQUEST);
      }
      
      if (!/^([+-]?\d{1,2}\.\d{14,15})$/.test(longitudeLatitudeDto.Longitude.toString())) {
        throw new HttpException("Longitude must be in the format of '2 digits before the decimal point and either 14 or 15 digits after the decimal point'", HttpStatus.BAD_REQUEST);
      }
  }
    
  };
  