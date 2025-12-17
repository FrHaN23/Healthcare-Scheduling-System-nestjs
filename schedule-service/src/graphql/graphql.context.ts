import { Request } from 'express';

export interface GqlContext {
  req: Request;
  user?: {
    sub: string;
    email: string;
    iat: number;
    exp: number;
  };
}
