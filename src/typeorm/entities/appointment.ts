import {
  Column,
    Entity,
    ManyToOne,
    PrimaryGeneratedColumn,
  } from 'typeorm';
import { Doctor } from './doctors';
import { Clinic } from './clinic';
import { Transform} from 'class-transformer';
import { Patient } from './patient';
import { IsEnum, IsNotEmpty, IsString } from 'class-validator';
import { WorkTime } from './work-time';

enum Day {
  الأحد = 'الأحد',
  الإثنين = 'الإثنين',
  الثلاثاء = 'الثلاثاء',
  الأربعاء = 'الأربعاء',
  الخميس = 'الخميس',
  الجمعة = 'الجمعة',
  السبت = 'السبت',
}

@Entity({ name: 'appointments' })
export class Appointment {
  @PrimaryGeneratedColumn({ type: 'bigint' })
    id: number;

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

    @ManyToOne(() => WorkTime, (workTime) => workTime.appointment)
    public workTime: WorkTime


    @ManyToOne(() => Patient, (patient) => patient.appointment)
    public patient: Patient

}



