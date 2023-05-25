import { BeforeInsert, Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { IsEmail, IsNotEmpty, IsString } from 'class-validator';
import { DoctorClinic } from './doctor-clinic';

@Entity({ name: 'secretaries' })
export class Secretary {
    @PrimaryGeneratedColumn({ type: 'bigint' })
    secretaryId: number;

    @Column({unique : true})
    @IsString()
    @IsNotEmpty()
    @IsEmail()
    email : string;

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

    @OneToMany(() => DoctorClinic, doctorClinic => doctorClinic.secretary)
    public doctorClinic: DoctorClinic[];
}