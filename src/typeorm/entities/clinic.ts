import {
    Column,
    Entity,
    ManyToOne,
    OneToMany,
    PrimaryGeneratedColumn,
  } from 'typeorm';
import { DoctorClinic } from './doctor-clinic';
import { IsNotEmpty, IsString } from 'class-validator';
import { Area } from './Area';
import { WorkTime } from './work-time';

@Entity({ name: 'clinics' })
export class Clinic {
    @PrimaryGeneratedColumn({ type: 'bigint' })
    clinicId: number;

    @Column()
    @IsString()
    @IsNotEmpty()
    clinicName: string;

    @Column()
    @IsString()
    @IsNotEmpty()
    Latitude: string;

    @Column()
    @IsString()
    @IsNotEmpty()
    Longitude: string;

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
}
