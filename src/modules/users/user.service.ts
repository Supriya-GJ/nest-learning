import { Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create.user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Users } from './user.entity';
import * as bcrypt from 'bcrypt';
import { DataSource } from 'typeorm';
import { Course } from '../courses/course.entity';
import { Logger } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Inject } from '@nestjs/common';
import type { Cache } from 'cache-manager';

@Injectable()
export class UserService {
  private logger = new Logger(UserService.name);
  constructor(
    @InjectRepository(Users)
    private readonly userRepo: Repository<Users>,
    @InjectRepository(Course)
    private readonly courseRepo: Repository<Course>,

    private dataSource: DataSource,
    @Inject(CACHE_MANAGER)
    private cacheManager: Cache
  ) { }

  async filterUsers(role: string) {

  return this.userRepo.find({
    where: { role },
  });
}

  async getUsers() {
    return this.userRepo.find();
  }

  // async createUser(dto: CreateUserDto) {
  //   const user = this.userRepo.create(dto); // DTO → Entity
  //   return this.userRepo.save(user);
  // }

  // Before adding transaction - we create user and course separately, so if course creation fails, user will still be created
  // async createUser(dto: CreateUserDto) {
  //   const hashedPassword = await bcrypt.hash(dto.password, 10);

  //   const user = this.userRepo.create({
  //     ...dto,
  //     password: hashedPassword,
  //   });

  //   return this.userRepo.save(user);
  // }

  // Transaction Method
  async createUserWithCourse(dto: CreateUserDto) {
    this.logger.log('Creating user...');

    const queryRunner =
      this.dataSource.createQueryRunner();

    await queryRunner.connect();

    await queryRunner.startTransaction();

    try {

      // HASH PASSWORD
      const hashedPassword = await bcrypt.hash(
        dto.password,
        10,
      );

      // CREATE USER
      const user = queryRunner.manager.create(Users, {
        ...dto,
        password: hashedPassword,
      });

      const savedUser =
        await queryRunner.manager.save(user);
        this.logger.log('User created successfully', savedUser);

      // CREATE COURSE
      const course = queryRunner.manager.create(Course, {
        title: 'NestJS Mastery',
        user: savedUser,
      });

      await queryRunner.manager.save(course);

      // SUCCESS
      await queryRunner.commitTransaction();

      return {
        user: savedUser,
        course,
      };

    } catch (err) {

      // FAILURE → undo everything
      await queryRunner.rollbackTransaction();

      throw err;

    } finally {

      // cleanup connection
      await queryRunner.release();
    }
  }

  // Basic CRUD - finds only one user and course details
  async getUserWithCourses(id: number) {
    return this.userRepo.findOne({
      where: { id },
      relations: ['courses'],
    });
  }

  // Fetch users with courses
  async getUsersWithCourses() {
    return this.userRepo
      .createQueryBuilder('user')
      .leftJoinAndSelect('user.courses', 'course')
      .getMany();
  }

  // Without Caching code
  // async getUsersAdvanced(
  //   page: number,
  //   limit: number,
  //   role?: string,
  //   search?: string,
  // ) {

  //   const query = this.userRepo.createQueryBuilder('user');

  //   // FILTERING
  //   if (role) {
  //     query.andWhere('user.role = :role', { role });
  //   }

  //   // SEARCH
  //   if (search) {
  //     query.andWhere('user.name ILIKE :search', {
  //       search: `%${search}%`,
  //     });
  //   }

  //   // PAGINATION
  //   query.skip((page - 1) * limit);
  //   query.take(limit);

  //   return query.getMany();
  // }

  // Caching code added to above method
  async getUsersAdvanced(
  page: number,
  limit: number,
  role?: string,
  search?: string,
) {

  // UNIQUE CACHE KEY
  const cacheKey =
    `users_${page}_${limit}_${role}_${search}`;

  // CHECK CACHE FIRST
  const cachedUsers =
    await this.cacheManager.get(cacheKey);

  if (cachedUsers) {
    this.logger.log('Returning users from CACHE');
    return cachedUsers;
  }

  this.logger.log('Fetching users from DATABASE');

  const query =
    this.userRepo.createQueryBuilder('user');

  // FILTERING
  if (role) {
    query.andWhere('user.role = :role', {
      role,
    });
  }

  // SEARCH
  if (search) {
    query.andWhere('user.name ILIKE :search', {
      search: `%${search}%`,
    });
  }

  // PAGINATION
  query.skip((page - 1) * limit);
  query.take(limit);

  const users = await query.getMany();

  // STORE IN CACHE
  await this.cacheManager.set(
    cacheKey,
    users,
    30000, // 30 seconds
  );

  return users;
}
}