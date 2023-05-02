import { IsNotEmpty, IsString } from "class-validator";

export class CreateSubSpecialtyDto  {
  @IsString()
  @IsNotEmpty()
  subSpecialtyName:string;
  };
  