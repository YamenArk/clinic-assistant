import { IsNotEmpty, IsString } from 'class-validator';
import {
    Column,
    Entity,
    PrimaryGeneratedColumn,
  } from 'typeorm';

@Entity({ name: 'blackLists' })
export class BlackList {
    @PrimaryGeneratedColumn({ type: 'bigint' })
    id: number;

   //accepte null
   @Column()
    @IsString()
    @IsNotEmpty()
   phoneNumber: string | null;

    @Column()
    createdAt: Date;
  
}
