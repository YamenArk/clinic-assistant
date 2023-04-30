import {
    Column,
    Entity,
    OneToMany,
    PrimaryGeneratedColumn,
  } from 'typeorm';
import { SubSpecialty } from './sub-specialty';
import { IsNotEmpty, IsString } from 'class-validator';

@Entity({ name: 'specialties' })
export class Specialty {
    @PrimaryGeneratedColumn({ type: 'bigint' })
    specialtyId: number;

    @Column({ nullable: false, unique: true })
    @IsString()
    @IsNotEmpty()
    specialtyName: string;

    @OneToMany(() => SubSpecialty, (subSpecialty) => subSpecialty.specialty)
    subSpecialties: SubSpecialty[]    
    length: number;
}