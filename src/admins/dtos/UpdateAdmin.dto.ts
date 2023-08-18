import { IsBoolean, IsEmail, IsEnum, IsNotEmpty, IsOptional, IsString, Matches } from 'class-validator'
enum TypeEnum {
    One = 1,
    Four = 4,
    Five = 5,
  }


export class UpdateAdminDto {
    @IsNotEmpty()
    @IsString()
    @IsEmail()
    @IsOptional()
    email?: string;

    @IsNotEmpty()
    @IsString()
    @Matches(/^09\d{8}$/)
    @IsOptional()
    phonenumber?: string;   

    @IsString()
    @IsNotEmpty()
    @IsOptional()
    firstname?: string;

    @IsString()
    @IsNotEmpty()
    @IsOptional()
    lastname?: string;

    @IsNotEmpty()
    @IsOptional()
    @IsBoolean()
    active?: boolean;

    
    @IsNotEmpty()
    @IsEnum(TypeEnum, {
      each: true,
      message: 'admin type must be 1 or 4 or 5'
    })
    type: TypeEnum;
    

}