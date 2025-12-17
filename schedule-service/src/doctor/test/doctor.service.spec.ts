import { DoctorService } from '../doctor.service';
import { PrismaService } from '../../prisma/prisma.service';
import { prismaMock } from '../../../test/prisma.mock';
import { RedisService } from 'src/redis/redis.service';
import { redisMock } from '../../../test/redis.mock';


describe('DoctorService', () => {
  let service: DoctorService;

  beforeEach(() => {
    service = new DoctorService(
      prismaMock as unknown as PrismaService,
      redisMock as unknown as RedisService
    );
  });

  it('should return paginated doctors', async () => {
    prismaMock.doctor.findMany.mockResolvedValue([
      { id: '1', name: 'Dr A' },
    ]);

    const result = await service.findAll({ skip: 0, take: 10 });

    expect(result).toHaveLength(1);
    expect(prismaMock.doctor.findMany).toHaveBeenCalled();
  });

  it('should create doctor', async () => {
    prismaMock.doctor.create.mockResolvedValue({
      id: '1',
      name: 'Dr A',
    });

    const result = await service.create('Dr A');

    expect(result.name).toBe('Dr A');
  });
});
