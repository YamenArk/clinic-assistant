import {
    Column,
    Entity,
    ManyToMany,
    PrimaryGeneratedColumn,
  } from 'typeorm';
import { Doctor } from './doctors';
import { IsDefined, IsNotEmpty, IsString } from 'class-validator';

@Entity({ name: 'insurances' })
export class Insurance {
    @PrimaryGeneratedColumn({ type: 'bigint' })
    insuranceId: number;
    
    @Column({ unique: true })
    @IsString()
    @IsDefined() // Add IsDefined constraint
    @IsNotEmpty()
    companyName: string;


    @ManyToMany(() => Doctor, doctor => doctor.insurance)
    public doctor: Doctor[];
}