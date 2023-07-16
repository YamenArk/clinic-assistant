import { IsEmail, IsEnum, IsNotEmpty, IsString, Matches } from "class-validator";

enum TypeEnum {
  One = 1,
  Four = 4,
  Five = 5,
}
export class CreateAdminDto {
    @IsNotEmpty()
    @IsEmail()
    email: string;

    @IsNotEmpty()
    @IsString()
    @Matches(/^09\d{8}$/)
    phonenumber: string;

    @IsNotEmpty()
    @IsString()
    firstname: string;

   
    @IsNotEmpty()
    @IsString()
    lastname: string;

    @IsNotEmpty()
    @IsEnum(TypeEnum, {
      each: true,
      message: 'admin type must be 1 or 4 or 5'
    })
    type: TypeEnum;
    
  };
  