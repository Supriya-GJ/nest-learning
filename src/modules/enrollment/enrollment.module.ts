import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';
import { EnrollmentProcessor } from './enrollment.processor';
import { EnrollmentService } from './enrollment.service';

@Module({
  imports: [
    BullModule.registerQueue({
      name: 'enrollment',
    }),
  ],

  providers: [
    EnrollmentProcessor,
    EnrollmentService,
  ],

  exports: [EnrollmentService],
})
export class EnrollmentModule {}