import { IsBoolean, IsEnum, IsNotEmpty, IsNumber, IsNumberString, IsOptional, IsString, Matches } from 'class-validator';
import {
    Column,
    Entity,
    OneToMany,
    PrimaryGeneratedColumn,
  } from 'typeorm';
import { Appointment } from './appointment';
import { DoctorPatient } from './doctor-patient';

@Entity({ name: 'patients' })
export class Patient {
    @PrimaryGeneratedColumn({ type: 'bigint' })
    patientId: number;

    @Column()
    @IsEnum(['ذكر', 'أنثى'])
    gender: string;

    @Column({unique : true})
    @IsNotEmpty()
    @IsNumberString()
    @Matches(/^09\d{8}$/)
    phoneNumber: string;

    @Column()
    @IsNotEmpty()
    @IsString()
    password: string;

    @Column()
    @IsNotEmpty()
    @IsString()
    firstname: string;

    @Column()
    @IsNotEmpty()
    @IsString()
    lastname: string;

    @Column({ type: 'boolean', default: false })
    @IsBoolean()
    active: boolean;


    //accepte null
    @Column({ nullable: true })
    @IsString()
    @IsOptional()
    profilePicture: string;


    @Column({ type: 'date', nullable: false })
    @IsNotEmpty()
    birthDate: string;

    @Column({default : 0})
    numberOfMissAppointment: number;

    @OneToMany(() => Appointment, appointment => appointment.patient)
    public appointment: Appointment[];


    @OneToMany(() => DoctorPatient, doctorPatient => doctorPatient.patient)
    public doctorPatient: DoctorPatient[];
}