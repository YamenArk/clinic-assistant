import { IsEmail, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import {
    Column,
    Entity,
    PrimaryGeneratedColumn,
  } from 'typeorm';

@Entity({ name: 'admins' })
export class Admin {
    @PrimaryGeneratedColumn({ type: 'bigint' })
    adminId: number;

    @Column({default : false})
    isAdmin: boolean;

    @Column({unique : true})
    @IsString()
    @IsNotEmpty()
    @IsEmail()
    email: string;

    
    @Column({ nullable: true })
    @IsString()
    @IsOptional()
    password: string;

    @Column({ nullable: true })
    phonenumber: string;

    @Column()
    createdAt: Date;
  
}
