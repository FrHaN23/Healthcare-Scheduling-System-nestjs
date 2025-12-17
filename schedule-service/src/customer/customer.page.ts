import { ObjectType, Field, Int } from '@nestjs/graphql';
import { Customer } from './customer.model';

@ObjectType()
export class CustomerPage {
  @Field(() => [Customer])
  items: Customer[];

  @Field(() => Int)
  total: number;
}
