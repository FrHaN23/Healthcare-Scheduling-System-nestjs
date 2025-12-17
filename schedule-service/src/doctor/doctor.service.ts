import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Doctor as PrismaDoctor } from 'generated/prisma/client';
import { RedisService } from 'src/redis/redis.service';

@Injectable()
export class DoctorService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly cache: RedisService,
  ) { }

  private cacheServiceKey = 'doctor'

  count(): Promise<number> {
    return this.prisma.doctor.count();
  }

  create(name: string): Promise<PrismaDoctor> {
    return this.prisma.doctor.create({
      data: { name },
    });
  }

  async findAll(params: { skip: number; take: number }): Promise<PrismaDoctor[]> {
    const cacheKey = `${this.cacheServiceKey}:all:${JSON.stringify(params)}`;

    const cached = await this.cache.get<PrismaDoctor[]>(cacheKey);
    if (cached) return cached;

    const doctors = await this.prisma.doctor.findMany({
      skip: params.skip,
      take: params.take,
      orderBy: { createdAt: 'desc' },
    });

    await this.cache.set(cacheKey, doctors)
    return doctors
  }

  async findById(id: string): Promise<PrismaDoctor> {
    const cacheKey = `${this.cacheServiceKey}:${id}`;

    const cached = await this.cache.get<PrismaDoctor>(cacheKey);
    if (cached) return cached;

    const doctor = await this.prisma.doctor.findUnique({
      where: { id },
    });

    if (!doctor) {
      throw new NotFoundException('doctor not found');
    }
    await this.cache.set(cacheKey, doctor);

    return doctor;
  }

  async update(
    id: string,
    data: { name?: string },
  ): Promise<PrismaDoctor> {
    await this.findById(id);

    const res = await this.prisma.doctor.update({
      where: { id },
      data,
    });
    if (res.id) {
      const cacheKey = `${this.cacheServiceKey}:${id}`;
      await this.cache.del(cacheKey)
    }
    return res
  }

  async delete(id: string): Promise<PrismaDoctor> {
    await this.findById(id);

    const res = await this.prisma.doctor.delete({
      where: { id },
    });
    if (res) {
      const cacheKey = `${this.cacheServiceKey}:${id}`;
      await this.cache.del(cacheKey)
    }
    return res
  }
}
