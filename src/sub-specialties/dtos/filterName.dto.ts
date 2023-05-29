import { IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString } from "class-validator";

export class filterNameDto  {
    @IsNotEmpty()
    @IsString()
    filterName : string;
  };
  