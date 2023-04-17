import { SrvRecord } from 'dns';
import {
    Column,
    Entity,
    ManyToMany,
    ManyToOne,
    OneToMany,
    PrimaryGeneratedColumn,
  } from 'typeorm';
import { Doctor } from './doctors';
import { Specialty } from './specialty';

@Entity({ name: 'subSpecialties' })
export class SubSpecialty {
    @PrimaryGeneratedColumn({ type: 'bigint' })
    subSpecialtyId: number;

    @Column()
    subSpecialtyName: string;

    @ManyToOne(() => Specialty, (specialty) => specialty.subSpecialties)
    specialty: Specialty;

    @ManyToMany(() => Doctor, doctor => doctor.insurance)
    public doctor: Doctor[];  
}