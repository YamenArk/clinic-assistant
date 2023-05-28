import { IsBoolean, IsNotEmpty, IsNumber, IsOptional, IsString } from "class-validator";

export class secondFilterDocrotsDto {
    @IsOptional()
    @IsNumber()
    subSpecialtyId:number | null;

    @IsOptional()
    @IsString()
    filterName : string | null;

    @IsOptional()
    @IsBoolean()
    orderByEvaluate:boolean | null;
}
