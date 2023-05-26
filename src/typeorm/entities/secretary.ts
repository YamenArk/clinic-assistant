import { BeforeInsert, Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { IsEmail, IsNotEmpty, IsNumber, IsString } from 'class-validator';
import { DoctorClinic } from './doctor-clinic';
import { v4 as uuidv4 } from 'uuid';

@Entity({ name: 'secretaries' })
export class Secretary {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  secretaryId: number;

  @Column({ unique: true })
  @IsString()
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @Column()
  @IsString()
  @IsNotEmpty()
  password: string;

  @Column()
  @IsNotEmpty()
  @IsString()
  phonenumber: string;

  @Column()
  @IsNotEmpty()
  @IsString()
  firstname: string;

  @Column()
  @IsNotEmpty()
  @IsString()
  lastname: string;

  @Column()
  @IsNotEmpty()
  @IsNumber()
  age: number;

  @Column({ unique: true })
  privateId: string;

  @BeforeInsert()
  private async generateId() {
    this.privateId = uuidv4().substr(0, 5);
  }

  @OneToMany(() => DoctorClinic, doctorClinic => doctorClinic.secretary)
  public doctorClinic: DoctorClinic[];
}