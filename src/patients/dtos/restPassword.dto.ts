import {IsNotEmpty, IsNumberString, Matches } from "class-validator";

export class restPasswordDto {
  @IsNotEmpty()
  @IsNumberString()
  @Matches(/^09\d{8}$/,{message: 'يجب أن يكون الرقم من 10 خانات ويبدأ ب 09'})
  phoneNumber: string;
}
