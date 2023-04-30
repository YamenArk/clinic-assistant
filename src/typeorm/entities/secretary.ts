import { BeforeInsert, Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { IsNotEmpty, IsString } from 'class-validator';
import { DoctorClinic } from './doctor-clinic';

@Entity({ name: 'secreatries' })
export class Secreatry {
    @PrimaryGeneratedColumn({ type: 'bigint' })
    secreatryId: number;

    @Column()
    @IsString()
    @IsNotEmpty()
    userName: string;

    @Column()
    @IsString()
    @IsNotEmpty()
    password: string;

    @Column()
    @IsString()
    @IsNotEmpty()
    firstname: string;

    @Column({ unique: true })
    privateId: string;

    @BeforeInsert()
    private async generateId() {
        const { nanoid } = await import('nanoid');
        this.privateId = nanoid(5);
    }

    @OneToMany(() => DoctorClinic, doctorClinic => doctorClinic.secreatry)
    public doctorClinic: DoctorClinic[];
}