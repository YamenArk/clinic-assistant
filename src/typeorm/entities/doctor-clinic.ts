import {
  Column,
    Entity,
    JoinColumn,
    ManyToOne,
    PrimaryGeneratedColumn,
  } from 'typeorm';
import { Doctor } from './doctors';
import { Clinic } from './clinic';
import { Secreatry } from './secretary';
import { IsNumber, IsOptional, Min, Validate } from 'class-validator';

@Entity({ name: 'doctorClinics' })
export class DoctorClinic {
  @PrimaryGeneratedColumn({ type: 'bigint' })
    id: number;

   
    @Column()
    @IsNumber()
    @IsOptional()
    @Min(5, { message: 'يجب أن يكون العدد أكبر من 5' })
    appointmentDuring: number;



    @Column()
    @IsNumber()
    @IsOptional()
    @Min(1, { message: 'يجب أن يكون العدد أكبر من 1' })
    daysToSeeLastAppointment: number;


    @Column({default : 0,nullable: true})
    @IsOptional()
    @IsNumber()
    @Min(500, { message: 'يجب أن يكون العدد أكبر من 500' })
    checkupPrice: number;

    @ManyToOne(() => Doctor, (doctor) => doctor.doctorClinic)
    public doctor: Doctor

    @ManyToOne(() => Clinic, (clinic) => clinic.doctorClinic)
    public clinic: Clinic; // Ensure that the type of this property is Clinic

    @ManyToOne(() => Secreatry, (secreatry) => secreatry.doctorClinic)
    public secreatry: Secreatry


}
