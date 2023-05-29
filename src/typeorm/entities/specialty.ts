import {
    Column,
    Entity,
    JoinTable,
    ManyToMany,
    OneToMany,
    PrimaryGeneratedColumn,
  } from 'typeorm';
import { SubSpecialty } from './sub-specialty';
import { IsNotEmpty, IsString } from 'class-validator';
import { Clinic } from './clinic';

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


    
    @OneToMany(() => Clinic, clinic => clinic.specialty)
    public clinic: Clinic[];
}