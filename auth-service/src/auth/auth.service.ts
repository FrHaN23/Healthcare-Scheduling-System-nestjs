import { Injectable, UnauthorizedException } from '@nestjs/common';
import {
  hashPassword,
  comparePassword,
  signToken,
  verifyToken,
} from './auth.utils';
import { PrismaService } from 'src/prisma/prisma.service';
import { User as prismaUser } from 'generated/prisma/client';
import { JwtPayload } from './auth.types';
import { RedisService } from 'src/redis/redis.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly cache: RedisService
  ) { }

  async register(email: string, password: string): Promise<prismaUser> {
    const hashed = await hashPassword(password);

    return this.prisma.user.create({
      data: { email, password: hashed },
    });
  }

  async login(
    email: string,
    password: string,
  ): Promise<{ accessToken: string }> {
    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const valid = await comparePassword(password, user.password);
    if (!valid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    return {
      accessToken: signToken({
        sub: user.id,
        email: user.email,
      }),
    };
  }

  async validateToken(token: string): Promise<JwtPayload> {
    const cacheKey = `auth:token:${token}`;

    const cached = await this.cache.get<JwtPayload>(cacheKey);
    if (cached) return cached;

    const payload = verifyToken(token);

    await this.cache.set(cacheKey, payload);
    return payload;
  }
}
