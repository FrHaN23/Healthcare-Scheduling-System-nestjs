import { Module, Global } from '@nestjs/common';
import { ConfigModule, ConfigType } from '@nestjs/config';
import redisConfig from '../redis/redis.config';
import { Queue } from 'bullmq';
import Redis from 'ioredis';

@Global()
@Module({
  imports: [ConfigModule.forFeature(redisConfig)],
  providers: [
    {
      provide: 'QUEUE_REDIS',
      inject: [redisConfig.KEY],
      useFactory: (config: ConfigType<typeof redisConfig>) => {
        return new Redis({
          host: config.host,
          port: config.port,
          username: config.username,
          password: config.password,
        });
      },
    },
    {
      provide: 'EMAIL_QUEUE',
      inject: ['QUEUE_REDIS'],
      useFactory: (redis: Redis) => {
        return new Queue('email-queue', {
          connection: redis,
        });
      },
    },
  ],
  exports: ['EMAIL_QUEUE'],
})
export class QueueModule { }
