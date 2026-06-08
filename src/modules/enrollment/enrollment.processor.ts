import {
  Processor,
  Process,
} from '@nestjs/bull';

import type { Job } from 'bull';

@Processor('enrollment')
export class EnrollmentProcessor {

  @Process('send-email')
  async handleSendEmail(job: Job) {

    console.log(
      `Sending enrollment email to ${job.data.email}`,
    );

    // simulate delay
    await new Promise(resolve =>
      setTimeout(resolve, 3000),
    );

    console.log('Email sent');
  }
}