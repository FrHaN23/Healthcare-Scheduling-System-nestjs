import { ArgsType, Field, ID } from '@nestjs/graphql';

@ArgsType()
export class ScheduleFilterArgs {
  @Field(() => ID, { nullable: true })
  doctorId?: string;

  @Field(() => ID, { nullable: true })
  customerId?: string;

  @Field({ nullable: true })
  from?: Date;

  @Field({ nullable: true })
  to?: Date;
}
