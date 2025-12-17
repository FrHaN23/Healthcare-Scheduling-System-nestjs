import { CustomerService } from '../customer.service';
import { PrismaService } from '../../prisma/prisma.service';
import { prismaMock } from '../../../test/prisma.mock';
import { redisMock } from '../../../test/redis.mock';
import { RedisService } from 'src/redis/redis.service';


describe('CustomerService', () => {
  let service: CustomerService;

  beforeEach(() => {
    service = new CustomerService(
      prismaMock as unknown as PrismaService,
      redisMock as unknown as RedisService
    );
  });

  it('should create customer', async () => {
    prismaMock.customer.create.mockResolvedValue({
      id: '1',
      name: 'John',
      email: 'john@mail.com',
    });

    const result = await service.create({
      name: 'John',
      email: 'john@mail.com',
    });

    expect(result.email).toBe('john@mail.com');
  });
});
