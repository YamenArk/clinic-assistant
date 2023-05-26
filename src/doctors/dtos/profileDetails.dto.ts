import {IsOptional, IsString, Matches } from "class-validator";
import { IsNull } from "typeorm";

export class profileDetailsDto {
    @IsOptional()
    @IsString()
    description ?: string;

    @IsOptional()
    @IsString()
    @Matches(/^09\d{8}$/)
    phonenumber ?: string;

    @IsString()
    @IsOptional()
    profilePicture: string;
}