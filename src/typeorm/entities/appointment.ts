import {
  Column,
    Entity,
    ManyToOne,
    OneToMany,
    PrimaryGeneratedColumn,
  } from 'typeorm';
import { Transform} from 'class-transformer';
import { Patient } from './patient';
import { IsBoolean, IsNotEmpty } from 'class-validator';
import { WorkTime } from './work-time';
import { PatientReminders } from './patient-reminders';


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

    @Column({ type: 'boolean', default: false })
    @IsBoolean()
    missedAppointment: boolean;



    @ManyToOne(() => WorkTime, (workTime) => workTime.appointment, { onDelete: 'CASCADE' })
    public workTime: WorkTime;
    
    @ManyToOne(() => Patient, (patient) => patient.appointment)
    public patient: Patient


    @OneToMany(() => PatientReminders, patientReminders => patientReminders.appointment)
    public patientReminders: PatientReminders[];

}



