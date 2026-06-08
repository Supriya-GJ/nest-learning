import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Course } from './course.entity';
import { Users } from '../users/user.entity';

import { CourseService } from './course.service';
import { CourseController } from './course.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Course, Users])],
  providers: [CourseService],
  controllers: [CourseController],
})
export class CourseModule {}