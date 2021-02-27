import Queue from 'bee-queue';
import { createHmac } from 'crypto';
import { makeQueueName, TimeUnits, toMS, Wave, wave } from './internal';

export interface ActionReturn {
  status: number | string;
  data?: any;
}

export type ProcessReturn = Promise<ActionReturn> | ActionReturn;

export interface ProcessFunc<PayloadType> {
  (payload: PayloadType): ProcessReturn;
}

export class Action<PayloadType = any> {
  public name: string;
  public func: Function;
  public queue: Queue;
  public _cache: false | number = false;
  public instance: () => Wave;

  constructor (name: string) {
    if (name.indexOf('wave_internal_') > -1) throw 'Please don\'t create collections that start with "wave_internal_"';
    this.name = name;
    const qName = makeQueueName(name);
    this.queue = new Queue(qName);
    this.instance = wave;
    return this;
  }

  public process (callback: ProcessFunc<PayloadType>) {
    this.func = callback;
    return this;
  }

  public cache (time: number, unit: TimeUnits = "minutes") {
    time = toMS(time, unit);
    this._cache = time > 0 ? time : 5000;
    return this;
  }

  public async call (payload: PayloadType): Promise<ActionReturn> {
    return await new Promise(async (resolve, reject) => {
      let key = "";
      if (this._cache) {
        try {
          key = this.makeCacheKey(payload);
          const cached = await this.instance().cache.get(key);
          if (cached) return resolve(cached);
        } catch (error) {}
      }
      const job = this.queue.createJob(payload);
      job.on('succeeded', (result) => {
        if (this._cache) {
          try {
            this.instance().cache.set(key, result, { time: this._cache, unit: 'milliseconds' });
          } catch (error) {}
        }
        return resolve(result);
      });
      job.on('failed', (error) => (reject(error)));
      job.save();
    });
  }

  public initListen () {
    if (!this.func || !this.queue) return;
    this.queue.process(async ({ data }) => (await this.func(data)));
  }

  private makeCacheKey (payload: any): string {
    let forKey = payload;
    try {
      forKey = JSON.stringify(payload);
    } catch (error) {}
    return createHmac('sha256', 'cache').update(`${this.name}${forKey}`).digest('hex');
  }
}