import { IsNotEmpty, IsString } from "class-validator";

export class SpecialtyDto  {
  @IsString()
  @IsNotEmpty()
  specialtyName: string;
  };
  