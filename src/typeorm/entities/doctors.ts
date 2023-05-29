import {
    Column,
    Entity,
    JoinTable,
    ManyToMany,
    OneToMany,
    PrimaryGeneratedColumn,
    ValueTransformer,
  } from 'typeorm';
import { Insurance } from './insurance';
import { SubSpecialty } from './sub-specialty';
import { DoctorClinic } from './doctor-clinic';
import { IsBoolean, IsEmail, IsEnum, IsIn, IsNotEmpty, IsNumber, IsOptional, IsString, Max, Min } from 'class-validator';
import { Commission } from './commission';
import { WorkTime } from './work-time';
import { DoctorPatient } from './doctor-patient';


const decimalTransformer: ValueTransformer = {
  to: (value: number): number => value,
  from: (value: string | null): number => (value ? parseFloat(value) : 0),
};

@Entity({ name: 'doctors' })
export class Doctor {
    @PrimaryGeneratedColumn({ type: 'bigint' })
    doctorId: number;

    @Column({ nullable: true })
    @IsOptional()
    @IsString()
    description : string;

    @Column({unique : true})
    @IsString()
    @IsNotEmpty()
    @IsEmail()
    email : string;

    //accepte null
    @Column()
    @IsNotEmpty()
    @IsString()
    phonenumberForAdmin: string ;


    @Column({default : true})
    @IsBoolean()
    active: boolean;

   
    @Column({ nullable: true })
    @IsString()
    @IsOptional()
    password: string;

    
    @Column()
    @IsEnum(['male', 'female'])
    gender: string;
    
    @Column({ nullable: true })
    @IsString()
    @IsOptional()
    profilePicture: string;

    
    @Column()
    @IsNotEmpty()
    @IsString()
    firstname: string;

   
    @Column()
    @IsNotEmpty()
    @IsString()
    lastname: string;
    
    @Column({ type: 'decimal', precision: 4, scale: 2, default: 3.0 })
    @Min(1)
    @Max(5)
    evaluate: number;

    @Column({default : 0})
    @IsNumber()
    @IsNotEmpty()
    numberOfPeopleWhoVoted: number;


    //accepte null
    @Column({ nullable: true })
    @IsString()
    @IsOptional()
    phonenumber: string | null;



    @Column()
    createdAt: Date;

    @ManyToMany(() => Insurance, insurance => insurance.doctor)
    @JoinTable()
    public insurance: Insurance[];

    @ManyToMany(() => SubSpecialty, subSpecialty => subSpecialty.doctor)
    @JoinTable()
    public subSpecialty: SubSpecialty[];

    
    @OneToMany(() => DoctorClinic, doctorClinic => doctorClinic.doctor)
    public doctorClinic: DoctorClinic[];

    @OneToMany(() => DoctorPatient, doctorPatient => doctorPatient.doctor)
    public doctorPatient: DoctorPatient[];

    @OneToMany(() => WorkTime, workTime => workTime.doctor)
    public workTime: WorkTime[];

    @OneToMany(() => Commission, (commission) => commission.doctor)
    commission: Commission[]    
    length: number;
}