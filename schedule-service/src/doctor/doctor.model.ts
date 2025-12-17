import { ObjectType, Field, Int, ID } from '@nestjs/graphql';

@ObjectType({ description: "doctor entity" })
export class Doctor {
  @Field(() => ID)
  id: string;

  @Field()
  name: string;

  @Field()
  createdAt: Date;
}


@ObjectType({ description: "expect for paginate" })
export class DoctorPage {
  @Field(() => [Doctor])
  items: Doctor[];

  @Field(() => Int)
  total: number;
}
