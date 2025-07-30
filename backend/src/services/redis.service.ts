import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import Redis from 'ioredis';
import { HttpService } from '@nestjs/axios';

@Injectable()
export class RedisService implements OnModuleInit, OnModuleDestroy {
  private client: Redis;

  onModuleInit() {
    const host = process.env.REDIS_HOST || '127.0.0.1';
    const port = parseInt(process.env.REDIS_PORT || '6379', 10);

    this.client = new Redis({
      host,
      port,
    });

    this.client.on('connect', () => {
      console.log(`✅ Connected to Redis at ${host}:${port}`);
    });

    this.client.on('error', (err) => {
      console.error('❌ Redis error:', err);
    });
  }

  getClient(): Redis {
    return this.client;
  }

  async set(key: string, value: string, ttlSeconds?: number): Promise<'OK'> {
    if (ttlSeconds) {
      return this.client.set(key, value, 'EX', ttlSeconds);
    }
    return this.client.set(key, value);
  }

  async get(key: string): Promise<string | null> {
    return this.client.get(key);
  }
  async setObject(key: string, value: any, ttlSeconds?: number) {
  return this.set(key, JSON.stringify(value), ttlSeconds);
}

async getObject<T>(key: string): Promise<T | null> {
  const val = await this.get(key);
  return val ? JSON.parse(val) : null;
}


  async del(key: string): Promise<number> {
    return this.client.del(key);
  }

  onModuleDestroy() {
    this.client.quit();
  }
}
