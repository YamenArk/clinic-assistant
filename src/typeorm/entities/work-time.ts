import {
    Column,
    Entity,
    ManyToOne,
    PrimaryGeneratedColumn,
  } from 'typeorm';
import { IsEnum, IsNotEmpty, IsString } from 'class-validator';
import { Doctor } from './doctors';
import { Clinic } from './clinic';

enum Day {
    SUNDAY = 'sunday',
    MONDAY = 'monday',
    TUESDAY = 'tuesday',
    WEDNESDAY = 'wednesday',
    THURSDAY = 'thursday',
    FRIDAY = 'friday',
    SATURDAY = 'saturday',
}

@Entity({ name: 'workTimes' })
export class WorkTime {
    @PrimaryGeneratedColumn({ type: 'bigint' })
    workTimeId: number;

    @Column({ nullable: false })
    @IsString()
    @IsNotEmpty()
    starting_time: string;

    @Column({ nullable: false })
    @IsString()
    @IsNotEmpty()
    finishing_time: string;

    @Column({ type: 'enum', enum: Day, nullable: false })
    @IsEnum(Day)
    day: Day;

    @ManyToOne(() => Doctor, (doctor) => doctor.doctorClinic)
    public doctor: Doctor

    @ManyToOne(() => Clinic, (clinic) => clinic.doctorClinic)
    public clinic: Clinic

}