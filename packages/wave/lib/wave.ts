import Queue from 'bee-queue';
import { Action, LinkServer, makeQueueName } from './internal';

export interface WaveConfig {
  redis?: {
    host?: string;
    port?: number;
  };
  queue?: {};
  rest?: {};
  link?: {
    port?: number;
  };
}

export class Wave {
  public _actions: Set<Action> = new Set();
  public _config: WaveConfig = {
    redis: {
      host: '127.0.0.1',
      port: 6379
    },
    link: {
      port: 1500
    }
  };
  public _link: LinkServer;

  public ready: boolean = false;

  constructor () {
    if (!globalThis.__wave__app) this.globalBind();
  }

  public Action <PayloadType = any> (name: string): Action<PayloadType> {
    const action = new Action<PayloadType>(name);
    this._actions.add(action);
    return action;
  }

  public async Start () {
    if (this.ready) {
      console.warn('Wave start was already called, aborting...');
    }
    for (const action of this._actions) {
      action.initListen();
    }
    if (!this._link) this._link = new LinkServer();
    this._link.Listen(this);
    console.log(`[Wave] Wave is up and running !`);
    this.ready = true;
  }

  public Configure (config: WaveConfig) {
    this._config = config;
  }

  public getAction (name: string): Action {
    let result: Action;
    for (const action of this._actions) {
      if (name === action.name) result = action; 
    }
    return result;
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