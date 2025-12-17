import { registerAs } from '@nestjs/config';

export default registerAs('redis', () => ({
  host: process.env.REDIS_HOST as string,
  port: parseInt(process.env.REDIS_PORT as string, 10),
  username: process.env.REDIS_USERNAME,
  password: process.env.REDIS_PASSWORD,
  url: process.env.REDIS_URL,
  default_ttl: 300
}));
