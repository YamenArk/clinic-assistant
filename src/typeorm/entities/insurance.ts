import { SrvRecord } from 'dns';
import {
    Column,
    Entity,
    ManyToMany,
    OneToMany,
    PrimaryGeneratedColumn,
  } from 'typeorm';
import { Specialty } from './specialty';
import { Doctor } from './doctors';

@Entity({ name: 'insurances' })
export class Insurance {
    @PrimaryGeneratedColumn({ type: 'bigint' })
    insuranceId: number;

    @Column({ unique: true })
    companyName: string;


    @ManyToMany(() => Doctor, doctor => doctor.insurance)
    public doctor: Doctor[];
}