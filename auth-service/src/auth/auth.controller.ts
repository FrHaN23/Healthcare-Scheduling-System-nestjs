import { Controller, Post, Headers, UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';

@Controller('internal')
export class AuthController {
  constructor(private authService: AuthService) { }

  @Post('validate-token')
  validate(@Headers('authorization') auth: string) {
    if (!auth) throw new UnauthorizedException();

    const token = auth.replace('Bearer ', '');
    return this.authService.validateToken(token);
  }
}
