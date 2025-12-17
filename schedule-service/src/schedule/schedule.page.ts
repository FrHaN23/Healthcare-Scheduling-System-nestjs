import { ObjectType, Field, Int } from '@nestjs/graphql';
import { Schedule } from './schedule.model';

@ObjectType()
export class SchedulePage {
  @Field(() => [Schedule])
  items: Schedule[];

  @Field(() => Int)
  total: number;
}
