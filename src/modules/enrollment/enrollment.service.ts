import { Injectable } from '@nestjs/common';

import { InjectQueue } from '@nestjs/bull';
import type { Queue } from 'bull';

@Injectable()
export class EnrollmentService {

  constructor(
    @InjectQueue('enrollment')
    private enrollmentQueue: Queue,
  ) {}

  async addEnrollmentJob(email: string) {

    await this.enrollmentQueue.add(
      'send-email',
      {
        email,
      },
    );

    console.log('Job added to queue');
  }
}