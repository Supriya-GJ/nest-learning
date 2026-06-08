import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { Users } from '../users/user.entity';

@Entity()
export class Course {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  title: string;

  @ManyToOne(() => Users, (user) => user.courses)
  user: Users; // 👈 owner of course

  @Column({ nullable: true })
  thumbnail: string;
}