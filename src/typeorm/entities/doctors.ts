import {
    Column,
    Entity,
    JoinTable,
    ManyToMany,
    OneToMany,
    PrimaryGeneratedColumn,
  } from 'typeorm';
import { Insurance } from './insurance';
import { SubSpecialty } from './sub-specialty';
import { DoctorClinic } from './doctor-clinic';
import { IsEmail, IsEnum, IsIn, IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';
import { Commission } from './commission';

@Entity({ name: 'doctors' })
export class Doctor {
    static find(arg0: { relations: string[]; }) {
      throw new Error('Method not implemented.');
    }
    @PrimaryGeneratedColumn({ type: 'bigint' })
    doctorId: number;

    @Column({ nullable: true })
    @IsOptional()
    @IsString()
    description : string;

    @Column()
    @IsString()
    @IsNotEmpty()
    @IsEmail()
    email : string;

    //accepte null
    @Column()
    @IsString()
    @IsNotEmpty()
    phonenumberForAdmin: string ;


    @Column({default : true})
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
    @IsString()
    @IsNotEmpty()
    firstname: string;

   
    @Column()
    @IsString()
    @IsNotEmpty()
    lastname: string;

   
    @Column({default : 20})
    @IsNumber()
    @IsNotEmpty()
    appointmentDuring: number;

    @Column({default : "3"})
    evaluate: number;

    @Column({default : 0})
    @IsNumber()
    @IsNotEmpty()
    numberOfPeopleWhoVoted: number;

    @Column({default : 0,nullable: true})
    @IsOptional()
    @IsNumber()
    checkupPrice: number;

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

    @OneToMany(() => Commission, (commission) => commission.doctor)
    commission: Commission[]    
    length: number;
}