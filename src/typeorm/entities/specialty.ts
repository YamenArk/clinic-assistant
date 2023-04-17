import { SrvRecord } from 'dns';
import {
    Column,
    Entity,
    ManyToMany,
    OneToMany,
    PrimaryGeneratedColumn,
  } from 'typeorm';
import { Doctor } from './doctors';
import { SubSpecialty } from './sub-specialty';

@Entity({ name: 'specialties' })
export class Specialty {
    map(arg0: (task: any) => any) {
        throw new Error('Method not implemented.');
    }
    @PrimaryGeneratedColumn({ type: 'bigint' })
    specialtyId: number;

    @Column({unique : true})
    specialtyName: string;

    @OneToMany(() => SubSpecialty, (subSpecialty) => subSpecialty.specialty)
    subSpecialties: SubSpecialty[]    
    length: number;
}