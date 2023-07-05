import { IsBoolean, IsEmail, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import {
    Column,
    Entity,
    OneToMany,
    PrimaryGeneratedColumn,
  } from 'typeorm';
import { PayInAdvance } from './pay-in-advance';
import { Transctions } from './transctions';

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
    @IsNotEmpty()
    @IsString()
    firstname: string;

   
    @Column()
    @IsNotEmpty()
    @IsString()
    lastname: string;
    
    @Column({ type: 'boolean', default: false })
    @IsBoolean()
    active: boolean;

    @Column()
    createdAt: Date;
 
    @OneToMany(() => PayInAdvance, payInAdvance => payInAdvance.admin)
    public payInAdvance: PayInAdvance[];

    @OneToMany(() => Transctions, transctions => transctions.admin)
    public transctions: Transctions[];


}
