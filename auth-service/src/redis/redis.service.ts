import {
  Inject,
  Injectable,
  OnModuleDestroy,
  OnModuleInit,
  Logger,
} from '@nestjs/common';
import * as Redis from 'ioredis';
import redisConfig from './redis.config';
import type { ConfigType } from '@nestjs/config';

@Injectable()
export class RedisService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(RedisService.name);

  public redisClient: Redis.Redis;

  constructor(
    @Inject(redisConfig.KEY)
    private readonly redisConfiguration: ConfigType<typeof redisConfig>,
  ) { }

  onModuleInit() {
    const config = {
      host: this.redisConfiguration.host,
      port: this.redisConfiguration.port,
      username: this.redisConfiguration.username,
      password: this.redisConfiguration.password,
      url: this.redisConfiguration.url,
      retryDelayOnFailover: 100,
      enableReadyCheck: true,
      maxRetriesPerRequest: 3,
    };

    this.logger.log('Connecting to Redis...', config);
    this.redisClient = new Redis.Redis(config);

    this.redisClient.on('connect', () => {
      this.logger.log('Redis client connected successfully');
    });

    this.redisClient.on('error', (error) => {
      this.logger.error('Redis client error:', error);
    });
  }

  onModuleDestroy() {
    this.redisClient.quit().catch((e) => this.logger.error('failed to shutdown: ', e))
    this.logger.log('Redis connection closed');
  }

  /**
   * Set a value in Redis under the given key.
   * If the value is an object, we convert it to a JSON string before saving,
   * because Redis only stores strings.
   */
  async set(key: string, value: any, ttlSeconds?: number): Promise<string> {
    try {
      const stringValue =
        typeof value === 'object' ? JSON.stringify(value) : String(value);

      const ttl = ttlSeconds ?? this.redisConfiguration.default_ttl;

      return await this.redisClient.set(key, stringValue, "EX", ttl);
    } catch (error) {
      this.logger.error(`Error setting key "${key}":`, error);
      throw error;
    }
  }

  /**
   * Get a value from Redis using a key.
   * If the value is in JSON format, we parse it to convert it back to an object.
   */
  async get<T = any>(key: string): Promise<T | null> {
    try {
      const value = await this.redisClient.get(key);
      if (!value) return null;

      try {
        // Try to parse JSON string back to object
        return JSON.parse(value, (_key, val) => {
          // iso date
          if (typeof val === 'string' && /^\d{4}-\d{2}-\d{2}T/.test(val)) {
            return new Date(val);
          }
          return val as unknown;
        }) as T;
      } catch {
        // If parsing fails, just return the raw string value
        return value as T;
      }
    } catch (error) {
      this.logger.error(`Error getting key "${key}":`, error);
      return null;
    }
  }

  /**
   * delete key redis
  */
  async del(key: string): Promise<void> {
    await this.redisClient.del(key);
  }
}
