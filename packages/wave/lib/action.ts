import Queue from 'bee-queue';
import { makeQueueName } from './internal';

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

  constructor (name: string) {
    this.name = name;
    const qName = makeQueueName(name);
    this.queue = new Queue(qName);
    return this;
  }

  public process (callback: ProcessFunc<PayloadType>) {
    this.func = callback;
    return this;
  }

  public async call (payload: PayloadType): Promise<ActionReturn> {
    return await new Promise((resolve, reject) => {
      const job = this.queue.createJob(payload);
      job.on('succeeded', (result) => (resolve(result)));
      job.on('failed', (error) => (reject(error)));
      job.save();
    });
  }

  public initListen () {
    if (!this.func || !this.queue) return;
    this.queue.process(async ({ data }) => (await this.func(data)));
  }
}