import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { LoggingInterceptor } from './common/interceptors/interceptors';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,        // removes extra fields
      forbidNonWhitelisted: true, // throws error for unknown fields
      transform: true,        // auto-transform payloads to DTO instances
    }),
  );
  app.useGlobalInterceptors(
    new LoggingInterceptor(),
  );
  app.useGlobalFilters(
    new HttpExceptionFilter(),
  );
  await app.listen(process.env.PORT ?? 3000);

}
bootstrap();
