import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { jwtPayloadSchema, JwtPayload } from './auth.schema';

@Injectable()
export class AuthService {
  private readonly authServiceUrl: string;

  constructor(private readonly configService: ConfigService) {
    const url = this.configService.get<string>('AUTH_SERVICE_URL');
    if (!url) {
      throw new Error('AUTH_SERVICE_URL is not defined');
    }
    this.authServiceUrl = url;
  }

  async validateToken(token: string): Promise<JwtPayload> {
    const res = await fetch(
      `${this.authServiceUrl}/internal/validate-token`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );

    if (!res.ok) {
      throw new UnauthorizedException();
    }

    const data: unknown = await res.json();
    return jwtPayloadSchema.parse(data);
  }
}
