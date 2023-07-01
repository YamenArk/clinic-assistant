import { IsDateString, IsNotEmpty } from "class-validator";


export class DeleteWorkTimeDto {
  @IsNotEmpty()
  @IsDateString()
  startDate: string;

  @IsNotEmpty()
  @IsDateString()
  endDate: string;


}