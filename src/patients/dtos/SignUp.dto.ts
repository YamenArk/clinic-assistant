import { IsDateString, IsEnum, IsNotEmpty, IsNumber, IsNumberString, IsString, Matches } from "class-validator";

export class SignUpDto {
  @IsNotEmpty()
  @IsNumberString()
  @Matches(/^09\d{8}$/,{message: 'يجب أن يكون الرقم من 10 خانات ويبدأ ب 09'})
  phoneNumber: string;

  @IsNotEmpty()
  password: string;

  @IsString()
  @IsNotEmpty()
  firstname: string;

  @IsString()
  @IsNotEmpty()
  lastname: string;

  @IsNotEmpty()
  @IsDateString()
  birthDate: string;

  @IsNotEmpty()
  @IsEnum(['ذكر', 'أنثى'], {message: 'يجب أن تحديد قيمة ذكر أو أنثى'})
  gender: 'ذكر' | 'أنثى';
}
