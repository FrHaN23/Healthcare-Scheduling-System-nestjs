import 'dotenv/config';
import { Worker } from 'bullmq';
import Redis from 'ioredis';
import { EmailService } from 'src/mail/mail.service';
import { SendEmailJob } from 'src/queue/jobs/mail.job';


const redis = new Redis({
  host: process.env.REDIS_HOST,
  port: Number(process.env.REDIS_PORT),
  username: process.env.REDIS_USERNAME,
  password: process.env.REDIS_PASSWORD,
  maxRetriesPerRequest: null,
});
const emailService = new EmailService();

const worker = new Worker<SendEmailJob>(
  'email-queue',
  async (job) => {
    await emailService.sendMail(
      job.data.to,
      job.data.subject,
      job.data.body,
    );
  },
  {
    connection: redis,
    concurrency: 3,
  },
);

worker.on('failed', (job, err) => {
  console.error(
    `[EMAIL WORKER] Job ${job?.id} failed after ${job?.attemptsMade} attempts`,
    {
      queue: job?.queueName,
      data: job?.data,
      error: err.message,
    },
  );
});

worker.on('completed', (job) => {
  console.log(
    `[EMAIL WORKER] Job ${job.id} completed successfully`,
  );
});
