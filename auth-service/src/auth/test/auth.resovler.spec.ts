import { Test } from '@nestjs/testing';
import { AuthResolver } from '../auth.resolver';
import { AuthService } from '../auth.service';

describe('AuthResolver', () => {
  let resolver: AuthResolver;
  let registerMock: jest.Mock;

  beforeEach(async () => {
    registerMock = jest.fn();

    const moduleRef = await Test.createTestingModule({
      providers: [
        AuthResolver,
        {
          provide: AuthService,
          useValue: {
            register: registerMock,
            login: jest.fn(),
          },
        },
      ],
    }).compile();

    resolver = moduleRef.get(AuthResolver);
  });

  it('should call register service', async () => {
    registerMock.mockResolvedValue({
      id: 'uuid',
      email: 'test@mail.com',
    });

    const result = await resolver.register(
      'test@mail.com',
      'password',
    );

    expect(registerMock).toHaveBeenCalled();
    expect(result.email).toBe('test@mail.com');
  });
});
