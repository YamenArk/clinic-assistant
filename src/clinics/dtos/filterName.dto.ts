import {  IsNotEmpty, IsString } from "class-validator";

export class filterNameDto  {
    @IsNotEmpty()
    @IsString()
    filterName : string;
  };
  
