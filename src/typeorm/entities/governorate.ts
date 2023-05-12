import {
    Column,
    Entity,
    OneToMany,
    PrimaryGeneratedColumn,
  } from 'typeorm';
import { IsNotEmpty, IsString } from 'class-validator';
import { Area } from './Area';

@Entity({ name: 'governorates' })
export class Governorate {
    @PrimaryGeneratedColumn({ type: 'bigint' })
    governorateId: number;

    @Column({ nullable: false, unique: true })
    @IsString()
    @IsNotEmpty()
    name: string;

    @OneToMany(() => Area, (area) => area.governorate)
    area: Area[]    
    length: number;
}