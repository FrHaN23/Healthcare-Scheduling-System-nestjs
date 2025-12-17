import * as bcrypt from 'bcrypt';
import * as jwt from 'jsonwebtoken';
import { JwtPayload } from './auth.types';

export const hashPassword = async (password: string): Promise<string> =>
  bcrypt.hash(password, 10);

export const comparePassword = async (
  password: string,
  hash: string,
): Promise<boolean> => bcrypt.compare(password, hash);

export const signToken = (payload: JwtPayload): string =>
  jwt.sign(payload, process.env.JWT_SECRET as string, {
    expiresIn: '1h',
  });

export const verifyToken = (token: string): JwtPayload =>
  jwt.verify(token, process.env.JWT_SECRET as string) as JwtPayload;
