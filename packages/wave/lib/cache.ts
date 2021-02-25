import Redis, { Redis as RedisType } from 'ioredis';
import { mergeTo, RedisConfig, TimeUnits, Wave, wave } from "./internal";
import { toMS } from './utils';

export interface CacheConfig {
  ttl: number;
  prefix: string;
  redis: Partial<RedisConfig>;
};

export class Cache {
  public _config: Partial<CacheConfig>;
  public instance: () => Wave;
  public client: RedisType;
  public ready: boolean;

  constructor (config?: CacheConfig) {
    this.instance = wave;
    this._config = mergeTo(config, {
      prefix: 'wave_cache'
    });
    this.client = new Redis(this._config.redis || this.instance()._config.redis);
    this.ready = true;
  }

  public async get (key: string): Promise<any> {
    try {
      if (!this.ready) return undefined;
      key = this.makeKey(key);
      let value = await this.client.get(key);
      if (!value) return undefined;
      try {
        value = JSON.parse(value);
      } catch (error) {}
      return value;
    } catch (error) {
      return undefined;
    }
  }

  public async set (key: string, value: any, ttl?: {
    time: number;
    unit: TimeUnits;
  }): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.ready) reject('redis client not ready');
      key = this.makeKey(key);
      const ms = ttl ? toMS(ttl.time, ttl.unit) : this._config.ttl;
      try {
        value = JSON.stringify(value);
      } catch (error) {}
      this.client.set(key, value, 'ex', ms / 1000).then(() => resolve()).catch(reject);
    });
  }

  public async delete (key: string): Promise<void> {
    try {
      key = this.makeKey(key);
      await this.client.del(key);
      return;
    } catch (error) {
      
    }
  }

  private makeKey (key: string) {
    return `__${this._config.prefix}__${key}`;
  }
}