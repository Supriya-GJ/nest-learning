/// <reference types="jest" />

import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from './user.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Users } from './user.entity';
import { Course } from '../courses/course.entity';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { DataSource } from 'typeorm';

  const mockUserRepo = {
  find: jest.fn(),
};

describe('UserService', () => {
  let service: UserService;

  beforeEach(async () => {

    const module: TestingModule =

      await Test.createTestingModule({

        providers: [

          UserService,

          {
            provide: getRepositoryToken(Users),
            useValue: mockUserRepo,
          },

          {
            provide: getRepositoryToken(Course),
            useValue: {},
          },

          {
            provide: DataSource,
            useValue: {},
          },

          {
            provide: CACHE_MANAGER,
            useValue: {},
          },
        ],

      }).compile();

    service =
      module.get<UserService>(
        UserService,
      );
  });

  it(
    'should filter users by role',

  async () => {

    const users = [
      {
        id: 1,
        role: 'admin',
      },
    ];

    mockUserRepo.find
      .mockResolvedValue(users);

    const result =

      await service
        .filterUsers('admin');

    expect(result)
      .toEqual(users);

    expect(mockUserRepo.find)
      .toHaveBeenCalledWith({

        where: {
          role: 'admin',
        },

      });
  },
  );
});
