import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Course } from './course.entity';
import { Users } from '../users/user.entity';

@Injectable()
export class CourseService {
  constructor(
    @InjectRepository(Course)
    private courseRepo: Repository<Course>,

    @InjectRepository(Users)
    private userRepo: Repository<Users>,
  ) {}

  async createCourse(userId: number, title: string) {
    // Find user first
    const user = await this.userRepo.findOneBy({ id: userId });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Create course
    const course = this.courseRepo.create({
      title,
      user,
    });

    // Save to DB
    return this.courseRepo.save(course);
  }

  async saveThumbnail(
    courseId: number,
    filename: string,
  ) {

    const course =
      await this.courseRepo.findOneBy({
        id: courseId,
      });

    if (!course) {
      throw new Error('Course not found');
    }

    course.thumbnail =
      `/uploads/${filename}`;

    await this.courseRepo.save(course);

    return {
      message: 'Thumbnail saved',
      course,
    };
  }
}