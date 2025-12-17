import { Resolver, Query, Mutation, Args } from '@nestjs/graphql';
import { Doctor, DoctorPage } from './doctor.model';
import { DoctorService } from './doctor.service';
import { PaginationArgs } from 'src/graphql/graphql.paginate';
import { CreateDoctorInput, UpdateDoctorInput } from './doctor.input';

@Resolver(() => Doctor)
export class DoctorResolver {
  constructor(private readonly doctorService: DoctorService) { }

  @Query(() => DoctorPage)
  async doctors(
    @Args() { skip, take }: PaginationArgs,
  ): Promise<DoctorPage> {
    const [items, total] = await Promise.all([
      this.doctorService.findAll({ skip, take }),
      this.doctorService.count(),
    ]);

    return { items, total };
  }

  @Mutation(() => Doctor)
  createDoctor(
    @Args('input') input: CreateDoctorInput,
  ) {
    return this.doctorService.create(input.name);
  }

  @Query(() => Doctor)
  doctor(@Args('id') id: string): Promise<Doctor> {
    return this.doctorService.findById(id);
  }

  @Mutation(() => Doctor)
  updateDoctor(
    @Args('id') id: string,
    @Args('input') input: UpdateDoctorInput,
  ): Promise<Doctor> {
    return this.doctorService.update(id, input);
  }

  @Mutation(() => Doctor)
  deleteDoctor(@Args('id') id: string): Promise<Doctor> {
    return this.doctorService.delete(id);
  }

}
