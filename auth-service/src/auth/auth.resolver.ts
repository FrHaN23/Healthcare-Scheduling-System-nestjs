import { Resolver, Mutation, Args, Query } from '@nestjs/graphql';
import { AuthService } from './auth.service';
import { registerSchema, loginSchema } from './auth.schema';
import { User } from './auth.model';

@Resolver()
export class AuthResolver {
  constructor(private readonly authService: AuthService) { }

  @Query(() => String)
  health(): string {
    return 'ok';
  }

  @Mutation(() => User)
  async register(
    @Args('email') email: string,
    @Args('password') password: string,
  ): Promise<User> {
    registerSchema.parse({ email, password });
    return this.authService.register(email, password)
  }

  @Mutation(() => String)
  async login(
    @Args('email') email: string,
    @Args('password') password: string,
  ): Promise<string> {
    loginSchema.parse({ email, password });
    const { accessToken } = await this.authService.login(email, password);
    return accessToken;
  }
}
