import { Test } from '@nestjs/testing';
import { UnauthorizedException } from '@nestjs/common';
import { AuthService } from '../auth.service';
import * as authUtils from '../auth.utils';
import { PrismaService } from '../../prisma/prisma.service';
import { RedisService } from 'src/redis/redis.service';
import { redisMock } from '../../../test/redis.mock';


describe('AuthService', () => {
  let authService: AuthService;
  let prisma: PrismaService;

  beforeEach(async () => {
    const createMock = jest.fn();
    const findUniqueMock = jest.fn();

    const moduleRef = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: PrismaService,
          useValue: {
            user: {
              create: createMock,
              findUnique: findUniqueMock
            },
          },
        },
        {
          provide: RedisService,
          useValue: redisMock, // 👈 THIS IS THE FIX
        },
      ],
    }).compile();

    authService = moduleRef.get(AuthService);
    prisma = moduleRef.get(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('register', () => {
    it('should create a new user', async () => {
      const createMock = jest.fn().mockResolvedValue({
        id: 'uuid',
        email: 'test@mail.com',
        password: 'hashed',
        createdAt: new Date(),
      });

      prisma.user.create = createMock;

      const result = await authService.register(
        'test@mail.com',
        'password123',
      );

      expect(createMock).toHaveBeenCalled();
      expect(result.email).toBe('test@mail.com');
    });
  });

  describe('login', () => {
    it('should throw if user not found', async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(
        authService.login('test@mail.com', 'password'),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should return access token on success', async () => {
      const mockUser = {
        id: 'uuid',
        email: 'test@mail.com',
        password: '$hashed',
      };

      (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);

      jest
        .spyOn(authUtils, 'comparePassword')
        .mockResolvedValue(true);

      jest
        .spyOn(authUtils, 'signToken')
        .mockReturnValue('jwt-token');

      const result = await authService.login(
        'test@mail.com',
        'password',
      );

      expect(result.accessToken).toBe('jwt-token');
    });
  });
});
