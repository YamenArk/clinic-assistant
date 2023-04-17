import { SrvRecord } from 'dns';
import {
    Column,
    Entity,
    JoinColumn,
    OneToMany,
    OneToOne,
    PrimaryGeneratedColumn,
  } from 'typeorm';

@Entity({ name: 'admins' })
export class Admin {
    @PrimaryGeneratedColumn({ type: 'bigint' })
    adminId: number;

    @Column()
    type: number;

    @Column()
    username: string;

    @Column()
    password: string;

    @Column()
    phonenumber: string;

    @Column()
    createdAt: Date;
  
}
