import {
    Column,
    Entity,
    JoinTable,
    ManyToMany,
    ManyToOne,
    OneToMany,
    PrimaryGeneratedColumn,
  } from 'typeorm';
import { SubSpecialty } from './sub-specialty';
import { IsNotEmpty, IsString } from 'class-validator';
import { Clinic } from './clinic';
import { Doctor } from './doctors';

@Entity({ name: 'doctorNotifications' })
export class Doctornotification {
    @PrimaryGeneratedColumn({ type: 'bigint' })
    id: number;

    @Column({ nullable: false})
    @IsNotEmpty()
    @IsString()
    message: string;

    
    @ManyToOne(() => Doctor, (doctor) => doctor.doctorMessage)
    public doctor: Doctor; // Ensure that the type of this property is Clinic
}