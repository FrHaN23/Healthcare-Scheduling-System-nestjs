import { Module } from '@nestjs/common';
import { ScheduleResolver } from './schedule.resolver';
import { ScheduleService } from './schedule.service';
import { QueueModule } from 'src/queue/queue.module';

@Module({
  imports: [QueueModule],
  providers: [
    ScheduleService,
    ScheduleResolver

  ],
})
export class ScheduleModule { }
