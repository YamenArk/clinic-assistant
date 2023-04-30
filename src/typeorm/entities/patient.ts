import { IsNotEmpty, IsNumber, IsString } from 'class-validator';
import {
    Column,
    Entity,
    OneToMany,
    PrimaryGeneratedColumn,
  } from 'typeorm';
import { Appointment } from './appointment';

@Entity({ name: 'patients' })
export class Patient {
    @PrimaryGeneratedColumn({ type: 'bigint' })
    patientId: number;

    //accepte null
    @Column({ nullable: true })
    phoneNumber: string | null;

    @Column()
    @IsString()
    @IsNotEmpty()
    password: string;

    @Column()
    @IsString()
    @IsNotEmpty()
    firstname: string;

    @Column()
    @IsString()
    @IsNotEmpty()
    lastname: string;

    //accepte null
    @Column({ nullable: true })
    @IsNumber()
    age: number;

    //accepte null
    @Column({ nullable: true })
    @IsString()
    profilePicture: string;

    @Column({default : 0})
    numberOfMissAppointment: number;

    @OneToMany(() => Appointment, appointment => appointment.patient)
    public appointment: Appointment[];
}