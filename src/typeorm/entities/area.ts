import {
    Column,
    Entity,
    ManyToOne,
    OneToMany,
    PrimaryGeneratedColumn,
  } from 'typeorm';
import { IsNotEmpty, IsString } from 'class-validator';
import { Governorate } from './Governorate';
import { Clinic } from './clinic';

@Entity({ name: 'areas' })
export class Area {
    @PrimaryGeneratedColumn({ type: 'bigint' })
    areaId: number;

    @Column({ nullable: false })
    @IsString()
    @IsNotEmpty()
    name: string;

    @ManyToOne(() => Governorate, (governorate) => governorate.area)
    governorate: Governorate;
 
    @OneToMany(() => Clinic, (clinic) => clinic.area)
    clinic: Clinic[] 

}