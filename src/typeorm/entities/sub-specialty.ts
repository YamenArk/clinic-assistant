import {
    Column,
    Entity,
    ManyToMany,
    ManyToOne,
    PrimaryGeneratedColumn,
  } from 'typeorm';
import { Doctor } from './doctors';
import { Specialty } from './specialty';
import { IsNotEmpty, IsString } from 'class-validator';

@Entity({ name: 'subSpecialties' })
export class SubSpecialty {
    @PrimaryGeneratedColumn({ type: 'bigint' })
    subSpecialtyId: number;

    @Column({ nullable: false })
    @IsString()
    @IsNotEmpty()
    subSpecialtyName: string;

    @ManyToOne(() => Specialty, (specialty) => specialty.subSpecialties)
    specialty: Specialty;

    @ManyToMany(() => Doctor, doctor => doctor.subSpecialty)
    public doctor: Doctor[];  
}