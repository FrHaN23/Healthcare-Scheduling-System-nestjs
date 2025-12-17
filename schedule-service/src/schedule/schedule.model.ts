import { ObjectType, Field, ID, GraphQLISODateTime } from '@nestjs/graphql';
import { Customer } from '../customer/customer.model';
import { Doctor } from '../doctor/doctor.model';

@ObjectType({
  description: "schedule entity"
})
export class Schedule {
  @Field(() => ID)
  id: string;

  @Field()
  objective: string;

  @Field(() => GraphQLISODateTime)
  scheduledAt: Date;

  @Field(() => Customer)
  customer?: Customer;

  @Field(() => Doctor)
  doctor?: Doctor;

  @Field(() => GraphQLISODateTime)
  createdAt: Date;

  @Field(() => GraphQLISODateTime)
  updatedAt: Date;
}
