import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';
import { OneToMany } from 'typeorm';
import { Course } from '../courses/course.entity';

@Entity()
export class Users {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  email: string;

  @Column( {select : false } ) // Exclude password from query results by default
  password: string;

  @Column({ default: 'student' })
  role: string;

  @Column()
  name: string;

  @OneToMany(() => Course, (course) => course.user)
  courses: Course[];
}

