import { Controller, Get, Post, Body, UseGuards, Param, Query } from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create.user.dto';
import { JwtGuard } from '../auth/jwt/jwt.guard';
import { RolesGuard } from '../auth/roles/roles.guard';
import { EnrollmentService} from '../enrollment/enrollment.service';

@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService,
    private readonly enrollmentService: EnrollmentService,
  ) { }

  // Commenting this out to test pagination and course relations separately
  // @Get('')
  // getUsers() {
  //   return this.userService.getUsers();
  // }

  @Post()
  async createUser(@Body() body: CreateUserDto) {
    await this.enrollmentService
      .addEnrollmentJob(body.email);
    return this.userService.createUserWithCourse(body);
  }

  @UseGuards(JwtGuard, RolesGuard)
  @Get('admin')
  getAdminData() {
    return 'Only admins can access this';
  }

  @Get('with-courses')
  getUsersWithCourses() {
    return this.userService.getUsersWithCourses();
  }

  @Get(':id')
  getUser(@Param('id') id: string) {
    return this.userService.getUserWithCourses(Number(id));
  }

  @Get()
  getUsersData(
    @Query('page') page = 1,
    @Query('limit') limit = 10,
    @Query('role') role?: string,
    @Query('search') search?: string,
  ) {
    return this.userService.getUsersAdvanced(
      Number(page),
      Number(limit),
      role,
      search,
    );
  }

}