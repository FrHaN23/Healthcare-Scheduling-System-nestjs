import { Resolver, Query, Mutation, Args } from '@nestjs/graphql';
import { Schedule } from './schedule.model';
import { ScheduleService } from './schedule.service';
import { ScheduleFilterArgs } from './schedule.args';
import { SchedulePage } from './schedule.page';
import {
  CreateScheduleInput,
  UpdateScheduleInput,
} from './schedule.input';
import { PaginationArgs } from 'src/graphql/graphql.paginate';

@Resolver(() => Schedule)
export class ScheduleResolver {
  constructor(private readonly scheduleService: ScheduleService) { }

  @Query(() => SchedulePage, {
    description: "get list of schedule with filter(i.e: doctorId, customerId, etc) and pagination"
  })
  async schedules(
    @Args() { skip, take }: PaginationArgs,
    @Args() filter: ScheduleFilterArgs,
  ): Promise<SchedulePage> {
    const [items, total]: [Schedule[], number] = await Promise.all([
      this.scheduleService.findAll({ skip, take, ...filter }),
      this.scheduleService.count(filter),
    ]);
    return { items, total };
  }

  @Mutation(() => Schedule, {
    description: 'Create a new consultation schedule',
  })
  createSchedule(
    @Args('input') input: CreateScheduleInput,
  ): Promise<Schedule> {
    return this.scheduleService.create(input);
  }

  @Mutation(() => Schedule, {
    description: "update existing schedule"
  })
  updateSchedule(
    @Args('id') id: string,
    @Args('input') input: UpdateScheduleInput,
  ): Promise<Schedule> {
    return this.scheduleService.update(id, input);
  }

  @Mutation(() => Schedule, {
    description: "delete exisiting schedule"
  })
  deleteSchedule(@Args('id') id: string): Promise<Schedule> {
    return this.scheduleService.delete(id);
  }
}
