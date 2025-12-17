import { ObjectType, Field, ID } from '@nestjs/graphql';

@ObjectType({ description: "customor entity" })
export class Customer {
  @Field(() => ID)
  id: string;

  @Field()
  name: string;

  @Field()
  email: string;

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;
}
