import { IsNotEmpty, IsInt, Min, Max, IsString, IsDefined, Matches } from 'class-validator';
import {
    Column,
    Entity,
    ManyToOne,
    PrimaryGeneratedColumn,
  } from 'typeorm';
import { Doctor } from './doctors';

@Entity({ name: 'commissions' })
export class Commission {
    @PrimaryGeneratedColumn({ type: 'bigint' })
    commissionId: number;

    @Column()
    @IsInt()
    @Min(1)
    @Max(12)
    @IsDefined()
    month: number | null;

    @Column()
    @IsString()
    @IsNotEmpty()
    @Matches(/^20[0-9]{2}$/i, { message: 'Invalid year format' })
    year: string | null;


    @Column()
    @IsString()
    @IsNotEmpty()
    @IsDefined()
    see: number;

    @ManyToOne(() => Doctor, (doctor) => doctor.commission)
    doctor: Doctor;

}