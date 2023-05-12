import { IsBoolean, IsEmail, IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString, Min } from 'class-validator'

export class UpdateDoctoeClinicDto {
    @IsNotEmpty()
    @IsNumber()
    @IsOptional()
    @Min(5, { message: 'يجب أن يكون العدد أكبر من 5' })
    appointmentDuring ?: number;
    
    @IsNotEmpty()
    @IsNumber()
    @IsOptional()
    @Min(1, { message: 'يجب أن يكون العدد أكبر من 1' })
    daysToSeeLastAppointment ?: number;


    @IsNotEmpty()
    @IsOptional()
    @IsNumber()
    @Min(500, { message: 'يجب أن يكون العدد أكبر من 500' })
    checkupPrice ?: number;
}