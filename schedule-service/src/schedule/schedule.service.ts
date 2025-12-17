import {
  Injectable,
  ConflictException,
  NotFoundException,
  Inject,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
  Schedule as PrismaSchedule,
  Customer as PrismaCustomer,
  Doctor as PrismaDoctor
} from 'generated/prisma/client';
import { RedisService } from 'src/redis/redis.service';
import { Queue } from 'bullmq';

type ScheduleRelations = PrismaSchedule & {
  customer: PrismaCustomer;
  doctor: PrismaDoctor;
};


@Injectable()
export class ScheduleService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly cache: RedisService,
    @Inject('EMAIL_QUEUE') private readonly emailQueue: Queue,
  ) { }

  private cacheServiceKey = 'customer'

  private async validateEntities(
    customerId: string,
    doctorId: string,
  ): Promise<void> {
    const [customer, doctor] = await Promise.all([
      this.prisma.customer.findUnique({ where: { id: customerId } }),
      this.prisma.doctor.findUnique({ where: { id: doctorId } }),
    ]);

    if (!customer) throw new NotFoundException('Customer not found');
    if (!doctor) throw new NotFoundException('Doctor not found');
  }

  // Prevent collision
  private async ensureNoCollision(
    doctorId: string,
    scheduledAt: Date,
    excludeId?: string,
  ): Promise<void> {
    const conflict = await this.prisma.schedule.findFirst({
      where: {
        doctorId,
        scheduledAt,
        ...(excludeId && { id: { not: excludeId } }),
      },
    });

    if (conflict) {
      throw new ConflictException(
        'Doctor already has a schedule at this time',
      );
    }
  }

  // CREATE
  async create(input: {
    objective: string;
    customerId: string;
    doctorId: string;
    scheduledAt: Date;
  }): Promise<PrismaSchedule> {
    await this.validateEntities(input.customerId, input.doctorId);
    await this.ensureNoCollision(input.doctorId, input.scheduledAt);

    const schedule: ScheduleRelations =
      await this.prisma.schedule.create({
        data: input,
        include: {
          doctor: true,
          customer: true,
        },
      });

    await this.emailQueue.add('send-email', {
      to: schedule.customer.email,
      subject: 'Appointment Scheduled',
      body: `Your appointment with Dr. ${schedule.doctor.name} is scheduled at ${schedule.scheduledAt.toString()}`,
    },
      {
        attempts: 3,
        backoff: {
          type: 'exponential',
          delay: 5000,
        },
        removeOnComplete: true,
        removeOnFail: false,
      },
    );

    return schedule;
  }

  // LIST
  async findAll(params: {
    skip: number;
    take: number;
    doctorId?: string;
    customerId?: string;
    from?: Date;
    to?: Date;
  }): Promise<ScheduleRelations[]> {
    const cacheKey = `${this.cacheServiceKey}:all:${JSON.stringify(params)}`;

    const cached = await this.cache.get<ScheduleRelations[]>(cacheKey);
    if (cached) return cached;

    const schedules: ScheduleRelations[] =
      await this.prisma.schedule.findMany({
        skip: params.skip,
        take: params.take,
        where: {
          doctorId: params.doctorId,
          customerId: params.customerId,
          scheduledAt: {
            gte: params.from,
            lte: params.to,
          },
        },
        include: {
          doctor: true,
          customer: true,
        },
        orderBy: { scheduledAt: 'asc' },
      });
    await this.cache.set(cacheKey, schedules)

    return schedules;
  }

  count(filter: {
    doctorId?: string;
    customerId?: string;
    from?: Date;
    to?: Date;
  }): Promise<number> {
    return this.prisma.schedule.count({
      where: {
        doctorId: filter.doctorId,
        customerId: filter.customerId,
        scheduledAt: {
          gte: filter.from,
          lte: filter.to,
        },
      },
    });
  }

  // UPDATE
  async update(
    id: string,
    input: { objective?: string; scheduledAt?: Date },
  ): Promise<PrismaSchedule> {
    const schedule = await this.prisma.schedule.findUnique({
      where: { id },
    });

    if (!schedule) {
      throw new NotFoundException('Schedule not found');
    }

    if (input.scheduledAt) {
      await this.ensureNoCollision(
        schedule.doctorId,
        input.scheduledAt,
        id,
      );
    }

    const updated: PrismaSchedule =
      await this.prisma.schedule.update({
        where: { id },
        data: input,
      });

    const cacheKey = `${this.cacheServiceKey}:${id}`;
    await this.cache.del(cacheKey)

    return updated;
  }

  // DELETE
  async delete(id: string): Promise<PrismaSchedule> {
    const schedule = await this.prisma.schedule.findUnique({
      where: { id },
    });

    if (!schedule) {
      throw new NotFoundException('Schedule not found');
    }

    const deleted: PrismaSchedule =
      await this.prisma.schedule.delete({
        where: { id },
      });

    const cacheKey = `${this.cacheServiceKey}:${id}`;
    await this.cache.del(cacheKey)

    return deleted;
  }
}
