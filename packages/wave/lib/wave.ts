import Queue from 'bee-queue';
import { Action } from './internal';

export class Wave {
  public _actions: Set<Action> = new Set();
  public _queues: Set<Queue> = new Set();
  public ready: boolean = false;

  constructor () {
    this.globalBind();
  }

  public Action <PayloadType = any> (name: string): Action<PayloadType> {
    const action = new Action<PayloadType>(name);
    this._actions.add(action);
    return action;
  }

  public async Start () {
    if (this.ready) {
      console.warn('Wave start was already called, aborting...');
    };
    for (const action of this._actions) {
      const qName = `wave-q-${action}`;
      const q = new Queue(qName);
      q.process(async function ({ data }) {
        return await action.func(data);
      });
      this._queues.add(q);
    }
    console.log(`[Wave] Wave is up and running !`);
    this.ready = true;
  }

  private globalBind () {
    try {
      globalThis.__wave__ = Wave;
      globalThis.__wave__app = this;
    } catch (error) {
      // fail silently
    }
  }
}

export function getWave (): Wave {
  if (globalThis.__wave__app) return globalThis.__wave__app;
  const wave = new Wave();
  return wave;
}