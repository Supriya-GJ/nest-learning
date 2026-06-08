import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserModule } from './modules/users/user.module';
import { AuthModule } from './modules/auth/auth.module';
import { CourseModule } from './modules/courses/course.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { LoggerMiddleware } from './common/middleware/logger';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { CacheModule } from '@nestjs/cache-manager';
import { BullModule } from '@nestjs/bull';
import { EnrollmentModule } from './modules/enrollment/enrollment.module';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { HealthModule } from './health/health.module';

@Module({
  imports: [UserModule, AuthModule, CourseModule, HealthModule,
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],

      useFactory: (
        configService: ConfigService,
      ) => ({
        type: 'postgres',

        host: configService.get<string>(
          'DB_HOST',
        ),

        port: Number(
          configService.get<string>(
            'DB_PORT',
          ),
        ),

        username: configService.get<string>(
          'DB_USERNAME',
        ),

        password: configService.get<string>(
          'DB_PASSWORD',
        ),

        database: configService.get<string>(
          'DB_NAME',
        ),

        autoLoadEntities: true,

        synchronize: true,
      }),
    }),
    ThrottlerModule.forRoot([{
      ttl: 60000, // Time to live in milliseconds (e.g., 1 minute)
      limit: 10,   // Maximum number of requests within the ttl
    }]),
    CacheModule.register({
      ttl: 10000, // Cache expires after 10 seconds
      max: 100, //Cache can store maximum 100 entries
      isGlobal: true,
    }),
    BullModule.forRootAsync({
      inject: [ConfigService],

      useFactory: (
        configService: ConfigService,
      ) => ({
        redis: {
          host:
            configService.get(
              'REDIS_HOST',
            ),

          port: Number(
            configService.get(
              'REDIS_PORT',
            ),
          ),
        },
      }),
    }),
    EnrollmentModule,
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'uploads'),
      serveRoot: '/uploads',
    }),
  ],
  controllers: [AppController],
  providers: [AppService,
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },],
})
export class AppModule
  implements NestModule {

  configure(
    consumer: MiddlewareConsumer,
  ) {

    consumer
      .apply(LoggerMiddleware)
      .forRoutes('*');
  }
}
