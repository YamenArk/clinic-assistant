import { IsNotEmpty, IsString } from "class-validator";

export class InsuranceDto  {
    @IsString()
    @IsNotEmpty()
    companyName:string;
  };
  