import { IsEnum, IsNotEmpty, IsNumber, IsOptional } from "class-validator";

export class filterDocrotsDto  {
    @IsOptional()
    @IsNumber()
    insuranceId: number | null;
    @IsOptional()
    @IsNumber()
    subSpecialtyId:number | null;
    @IsOptional()
    @IsEnum(['male', 'female', null])
    gender: 'male' | 'female' | null;
  };
  