import {
    Column,
    Entity,
    ManyToOne,
    OneToMany,
    PrimaryGeneratedColumn,
  } from 'typeorm';
import { Transform} from 'class-transformer';
import { IsEnum, IsNotEmpty, IsString } from 'class-validator';
import { Doctor } from './doctors';
import { Clinic } from './clinic';
import { Appointment } from './appointment';





enum Day {
    الأحد = 'الأحد',
    الإثنين = 'الإثنين',
    الثلاثاء = 'الثلاثاء',
    الأربعاء = 'الأربعاء',
    الخميس = 'الخميس',
    الجمعة = 'الجمعة',
    السبت = 'السبت',
  }

@Entity({ name: 'workTimes' })
export class WorkTime {
    @PrimaryGeneratedColumn({ type: 'bigint' })
    workTimeId: number;



    @Column({ type: 'time' })
    @IsNotEmpty()
    @Transform(({ value }) => value.toTimeString().slice(0, 5))
    startingTime: string;

    @Column({ type: 'time' })
    @IsNotEmpty()
    @Transform(({ value }) => value.toTimeString().slice(0, 5))
    finishingTime: string;

   

    @Column({ type: 'enum', enum: Day, nullable: false })
    @IsNotEmpty()
    @IsEnum(Day)
    day: Day;

    @Column({ type: 'date', nullable: false })
    @IsNotEmpty()
    date: string;

    @ManyToOne(() => Doctor, (doctor) => doctor.workTime) 
    public doctor: Doctor

    @ManyToOne(() => Clinic, (clinic) => clinic.workTime)
    public clinic: Clinic
 
    @OneToMany(() => Appointment, appointment => appointment.workTime)
    public appointment: Appointment[];


}