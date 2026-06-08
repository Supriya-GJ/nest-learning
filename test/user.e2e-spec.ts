// E2E Testing for User Module
import { Test } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { UserController } from '../src/modules/users/user.controller';
import { UserService } from '../src/modules/users/user.service';
import { JwtGuard } from '../src/modules/auth/jwt/jwt.guard';
import { RolesGuard } from '../src/modules/auth/roles/roles.guard';
import { EnrollmentService } from '../src/modules/enrollment/enrollment.service';

const mockEnrollmentService = {};

describe('User E2E', () => {

    let app: INestApplication;

    const mockUserService = {

        getUsers: jest.fn(),

        getUsersAdvanced: jest.fn()
            .mockResolvedValue([
                {
                    id: 1,
                    name: 'Supriya',
                },
            ]),
    };

    beforeEach(async () => {

        const moduleFixture =
            await Test.createTestingModule({

                controllers: [
                    UserController,
                ],

                providers: [

                    {
                        provide: UserService,
                        useValue: mockUserService,
                    },
                    {
                        provide: EnrollmentService,
                        useValue: mockEnrollmentService,
                    },
                ],

            })

                .overrideGuard(JwtGuard)
                .useValue({
                    canActivate: () => true,
                })

                .overrideGuard(RolesGuard)
                .useValue({
                    canActivate: () => true,
                })

                .compile();

        app =
            moduleFixture
                .createNestApplication();

        await app.init();
    });

    it(
        '/users (GET)',

        () => {

            return request(
                app.getHttpServer(),
            )

                .get('/users')

                .expect(200);
        },
    );
});