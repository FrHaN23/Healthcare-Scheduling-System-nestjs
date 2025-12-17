import { InputType, Field } from '@nestjs/graphql';

@InputType()
export class CreateDoctorInput {
  @Field()
  name: string;
}

@InputType()
export class UpdateDoctorInput {
  @Field({ nullable: true })
  name?: string;
}
