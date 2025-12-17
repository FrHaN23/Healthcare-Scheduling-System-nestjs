import { ObjectType, Field, ID } from '@nestjs/graphql';
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

  @Field()
  scheduledAt: Date;

  @Field(() => Customer)
  customer?: Customer;

  @Field(() => Doctor)
  doctor?: Doctor;

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;
}
