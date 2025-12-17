import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Customer as PrismaCustomer } from 'generated/prisma/client';
import { RedisService } from 'src/redis/redis.service';

@Injectable()
export class CustomerService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly cache: RedisService,
  ) { }

  private cacheServiceKey = 'customer'

  async create(data: {
    name: string;
    email: string;
  }): Promise<PrismaCustomer> {
    try {
      return await this.prisma.customer.create({ data });
    } catch {
      throw new ConflictException('Email already exists');
    }
  }

  async findAll(params: {
    skip: number;
    take: number;
  }): Promise<PrismaCustomer[]> {
    const cacheKey = `${this.cacheServiceKey}:all:${JSON.stringify(params)}`;
    const cached = await this.cache.get<PrismaCustomer[]>(cacheKey);
    if (cached) return cached;

    const customers = await this.prisma.customer.findMany({
      skip: params.skip,
      take: params.take,
      orderBy: { createdAt: 'desc' },
    });

    await this.cache.set(cacheKey, customers)
    return customers
  }

  count(): Promise<number> {
    return this.prisma.customer.count();
  }

  async findById(id: string): Promise<PrismaCustomer> {
    const cacheKey = `${this.cacheServiceKey}:${id}`;

    const cached = await this.cache.get<PrismaCustomer>(cacheKey);
    if (cached) return cached;

    const customer = await this.prisma.customer.findUnique({
      where: { id },
    });

    if (!customer) {
      throw new NotFoundException('Customer not found');
    }
    await this.cache.set(cacheKey, customer);

    return customer;
  }

  async update(
    id: string,
    data: { name?: string; email?: string },
  ): Promise<PrismaCustomer> {
    await this.findById(id);
    try {
      const res = await this.prisma.customer.update({
        where: { id },
        data,
      });
      if (res.id) {
        const cacheKey = `${this.cacheServiceKey}:${id}`;
        await this.cache.set(cacheKey, res)
      }
      return res
    } catch {
      throw new ConflictException('Email already exists');
    }
  }

  // DELETE
  async delete(id: string): Promise<PrismaCustomer> {
    await this.findById(id);

    const res = await this.prisma.customer.delete({
      where: { id },
    });
    if (res) {
      const cacheKey = `${this.cacheServiceKey}:${id}`;
      await this.cache.del(cacheKey)
    }
    return res
  }
}
