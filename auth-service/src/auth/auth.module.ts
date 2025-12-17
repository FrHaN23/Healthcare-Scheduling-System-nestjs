import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthResolver } from './auth.resolver';
import { AuthController } from './auth.controller';

@Module({
  providers: [AuthService, AuthResolver],
  controllers: [AuthController],
})
export class AuthModule { }
