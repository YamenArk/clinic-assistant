import {
    Column,
    Entity,
    ManyToOne,
    OneToMany,
    PrimaryGeneratedColumn,
  } from 'typeorm';
import { DoctorClinic } from './doctor-clinic';
import { IsNotEmpty, IsNumber, IsString, Max, Min } from 'class-validator';
import { Area } from './Area';
import { WorkTime } from './work-time';
import { Specialty } from './specialty';

@Entity({ name: 'clinics' })
export class Clinic {
    @PrimaryGeneratedColumn({ type: 'bigint' })
    clinicId: number;

    @Column()
    @IsString()
    @IsNotEmpty()
    clinicName: string;


    @Column({ type: 'decimal', precision: 16, scale: 14 })
    @IsNotEmpty()
    @Min(34)
    @Max(39)
    Latitude: number;

    @Column({ type: 'decimal', precision: 16, scale: 14})
    @IsNotEmpty()
    @Min(34)
    @Max(39)
    Longitude: number;

    @Column()
    createdAt: Date;
  
    @Column({ nullable: true })
    phonenumber: string;

    @Column({ default: 0 })
    numDoctors: number;

    @ManyToOne(() => Area, (area) => area.clinic)
    area: Area;



    
    @OneToMany(() => WorkTime, workTime => workTime.clinic)
    public workTime: WorkTime[];


    @OneToMany(() => DoctorClinic, doctorClinic => doctorClinic.clinic)
    public doctorClinic: DoctorClinic[];


    
    @ManyToOne(() => Specialty, (specialty) => specialty.clinic)
    public specialty: Specialty; // Ensure that the type of this property is Clinic
}
