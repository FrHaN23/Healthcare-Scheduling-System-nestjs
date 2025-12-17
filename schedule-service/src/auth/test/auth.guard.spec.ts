import { AuthGuard } from '../auth.guard';
import { UnauthorizedException } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';

describe('AuthGuard', () => {
  let guard: AuthGuard;

  beforeEach(() => {
    guard = new AuthGuard({} as any);
  });

  it('should throw if no authorization header', async () => {
    jest
      .spyOn(GqlExecutionContext, 'create')
      .mockReturnValue({
        getContext: () => ({
          req: {
            headers: {},
          },
        }),
      } as any);

    await expect(
      guard.canActivate({} as any),
    ).rejects.toThrow(UnauthorizedException);
  });
});
