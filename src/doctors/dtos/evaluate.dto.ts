import {  IsIn, IsNotEmpty, IsNumber } from "class-validator";

export class evaluateDto  {
    @IsNotEmpty()
    @IsNumber()
    @IsIn([1, 1.5, 2, 2.5, 3, 3.5, 4, 4.5, 5])
    evaluate: number;
  };
  