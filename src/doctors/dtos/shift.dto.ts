import { IsDateString, IsIn, IsNotEmpty, IsNumber, max, min } from "class-validator";

export class shiftDto {
  @IsNotEmpty()
  @IsNumber()
  @IsIn([1,2,3,4,5,6])
  shiftValue: number;
}