import { ScheduleService } from '../schedule.service';
import { PrismaService } from '../../prisma/prisma.service';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { prismaMock } from '../../../test/prisma.mock';
import { redisMock } from '../../../test/redis.mock';
import { RedisService } from 'src/redis/redis.service';
import { emailQueueMock } from '../../../test/queue.mock';
import { Test } from '@nestjs/testing';

describe('ScheduleService', () => {
  let service: ScheduleService;

  beforeEach(async () => {
    jest.clearAllMocks();

    const moduleRef = await Test.createTestingModule({
      providers: [
        ScheduleService,
        {
          provide: PrismaService,
          useValue: prismaMock,
        },
        {
          provide: RedisService,
          useValue: redisMock,
        },
        {
          provide: 'EMAIL_QUEUE',
          useValue: emailQueueMock,
        },
      ],
    }).compile();

    service = moduleRef.get(ScheduleService);
  });

  it('should prevent schedule collision', async () => {
    prismaMock.customer.findUnique.mockResolvedValue({ id: 'c1' });
    prismaMock.doctor.findUnique.mockResolvedValue({ id: 'd1' });
    prismaMock.schedule.findFirst.mockResolvedValue({ id: 'existing' });

    await expect(
      service.create({
        objective: 'Consult',
        customerId: 'c1',
        doctorId: 'd1',
        scheduledAt: new Date(),
      }),
    ).rejects.toThrow(ConflictException);
  });
});

describe('ScheduleServiceCollision', () => {
  let service: ScheduleService;

  beforeEach(async () => {
    jest.clearAllMocks();

    const moduleRef = await Test.createTestingModule({
      providers: [
        ScheduleService,
        {
          provide: PrismaService,
          useValue: prismaMock,
        },
        {
          provide: RedisService,
          useValue: redisMock,
        },
        {
          provide: 'EMAIL_QUEUE',
          useValue: emailQueueMock,
        },
      ],
    }).compile();

    service = moduleRef.get(ScheduleService);
  });

  const baseInput = {
    objective: 'Consultation',
    customerId: 'customer-1',
    doctorId: 'doctor-1',
    scheduledAt: new Date('2025-12-20T10:00:00Z'),
  };

  it('should throw ConflictException if doctor has schedule at same time', async () => {
    prismaMock.customer.findUnique.mockResolvedValue({ id: 'customer-1' });
    prismaMock.doctor.findUnique.mockResolvedValue({ id: 'doctor-1' });

    prismaMock.schedule.findFirst.mockResolvedValue({
      id: 'existing-schedule',
    });

    await expect(
      service.create(baseInput),
    ).rejects.toThrow(ConflictException);

    expect(prismaMock.schedule.create).not.toHaveBeenCalled();
  });

  it('should create schedule if no collision exists', async () => {
    prismaMock.customer.findUnique.mockResolvedValue({
      id: 'customer-1',
      email: 'customer@test.com',
    });

    prismaMock.doctor.findUnique.mockResolvedValue({
      id: 'doctor-1',
      name: 'Dr Test',
    });

    prismaMock.schedule.findFirst.mockResolvedValue(null);

    prismaMock.schedule.create.mockResolvedValue({
      id: 'schedule-1',
      ...baseInput,
      customer: {
        id: 'customer-1',
        email: 'customer@test.com',
      },
      doctor: {
        id: 'doctor-1',
        name: 'Dr Test',
      },
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const result = await service.create(baseInput);

    expect(result.id).toBe('schedule-1');
    expect(prismaMock.schedule.create).toHaveBeenCalled();
  });

  it('should prevent updating schedule to colliding time', async () => {
    prismaMock.schedule.findUnique.mockResolvedValue({
      id: 'schedule-1',
      doctorId: 'doctor-1',
      scheduledAt: new Date(),
    });

    prismaMock.schedule.findFirst.mockResolvedValue({
      id: 'conflict-schedule',
    });

    await expect(
      service.update('schedule-1', {
        scheduledAt: new Date('2025-12-20T10:00:00Z'),
      }),
    ).rejects.toThrow(ConflictException);

    expect(prismaMock.schedule.update).not.toHaveBeenCalled();
  });

  it('should update schedule when no collision exists', async () => {
    prismaMock.schedule.findUnique.mockResolvedValue({
      id: 'schedule-1',
      doctorId: 'doctor-1',
    });

    prismaMock.schedule.findFirst.mockResolvedValue(null);

    prismaMock.schedule.update.mockResolvedValue({
      id: 'schedule-1',
      objective: 'Updated',
      scheduledAt: new Date('2025-12-21T10:00:00Z'),
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const result = await service.update('schedule-1', {
      scheduledAt: new Date('2025-12-21T10:00:00Z'),
    });

    expect(result.objective).toBe('Updated');
    expect(prismaMock.schedule.update).toHaveBeenCalled();
  });

  it('should throw if customer does not exist', async () => {
    prismaMock.customer.findUnique.mockResolvedValue(null);
    prismaMock.doctor.findUnique.mockResolvedValue({ id: 'doctor-1' });

    await expect(
      service.create(baseInput),
    ).rejects.toThrow(NotFoundException);
  });

  it('should throw if doctor does not exist', async () => {
    prismaMock.customer.findUnique.mockResolvedValue({ id: 'customer-1' });
    prismaMock.doctor.findUnique.mockResolvedValue(null);

    await expect(
      service.create(baseInput),
    ).rejects.toThrow(NotFoundException);
  });
});
