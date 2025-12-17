import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import { AuthService } from './auth.service';
import { GqlContext } from 'src/graphql/graphql.context';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private readonly authService: AuthService) { }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const gqlCtx =
      GqlExecutionContext.create(context).getContext<GqlContext>();

    const authHeader = gqlCtx.req.headers.authorization;

    if (!authHeader) {
      throw new UnauthorizedException();
    }

    const token = authHeader.replace('Bearer ', '');

    gqlCtx.user = await this.authService.validateToken(token);

    return true;
  }
}
