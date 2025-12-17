import { Resolver, Query, Mutation, Args } from '@nestjs/graphql';
import { Customer } from './customer.model';
import { CustomerService } from './customer.service';
import { CustomerPage } from './customer.page';
import {
  CreateCustomerInput,
  UpdateCustomerInput,
} from './customer.input';
import { PaginationArgs } from 'src/graphql/graphql.paginate';

@Resolver(() => Customer)
export class CustomerResolver {
  constructor(private readonly customerService: CustomerService) { }

  // LIST
  @Query(() => CustomerPage)
  async customers(
    @Args() { skip, take }: PaginationArgs,
  ): Promise<CustomerPage> {
    const [items, total]: [Customer[], number] = await Promise.all([
      this.customerService.findAll({ skip, take }),
      this.customerService.count(),
    ]);

    return { items, total };
  }

  // GET ONE
  @Query(() => Customer)
  customer(@Args('id') id: string): Promise<Customer> {
    return this.customerService.findById(id);
  }

  // CREATE
  @Mutation(() => Customer)
  createCustomer(
    @Args('input') input: CreateCustomerInput,
  ): Promise<Customer> {
    return this.customerService.create(input);
  }

  // UPDATE
  @Mutation(() => Customer)
  updateCustomer(
    @Args('id') id: string,
    @Args('input') input: UpdateCustomerInput,
  ): Promise<Customer> {
    return this.customerService.update(id, input);
  }

  // DELETE
  @Mutation(() => Customer)
  deleteCustomer(@Args('id') id: string): Promise<Customer> {
    return this.customerService.delete(id);
  }
}
