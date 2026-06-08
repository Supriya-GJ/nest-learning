import { forwardRef, Module } from '@nestjs/common';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Users } from './user.entity';
import { AuthModule } from '../auth/auth.module';
import { Course } from '../courses/course.entity';
import { EnrollmentModule } from '../enrollment/enrollment.module';


@Module({
  controllers: [UserController],
  providers: [UserService],
  imports: [TypeOrmModule.forFeature([Users, Course]), forwardRef(() => AuthModule), forwardRef(() => EnrollmentModule)],
  exports: [UserService],
})
export class UserModule {}
