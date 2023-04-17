import { SrvRecord } from 'dns';
import {
    Column,
    Entity,
    JoinColumn,
    JoinTable,
    ManyToMany,
    OneToMany,
    OneToOne,
    PrimaryGeneratedColumn,
  } from 'typeorm';
import { Specialty } from './specialty';

@Entity({ name: 'patients' })
export class Patient {
    @PrimaryGeneratedColumn({ type: 'bigint' })
    patientId: number;

    @Column()
    phoneNumber: string;

    @Column()
    password: string;

    @Column()
    firstname: string;

    @Column()
    lastname: string;

    @Column()
    age: number;

    @Column()
    profilePicture: string;

    @Column({default : 0})
    numberOfMissAppointment: number;
}