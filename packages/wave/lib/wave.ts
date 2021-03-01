import { Action, Cache, CacheConfig, Collection, LinkConfig, LinkServer, Storage, StorageDriver } from './internal';

export interface RedisConfig {
  host: string;
  port: number;
  password: string;
}

export interface WaveConfig {
  redis?: Partial<RedisConfig>;
  cache?: CacheConfig;
  collections?: false | {};
  queue?: {};
  rest?: {};
  link?: false | LinkConfig;
}

export class Wave {
  public _actions: Set<Action> = new Set();
  public _collections: Set<Collection> = new Set();
  public _config: WaveConfig = {
    redis: {
      host: '127.0.0.1',
      port: 6379
    },
    link: {
      port: 1500
    }
  };
  public link: LinkServer;
  public storage: Storage;
  public cache: Cache;

  public ready: boolean = false;

  constructor () {
    if (!globalThis.__wave__app) this.globalBind();
  }

  public Action <PayloadType = any> (name: string): Action<PayloadType> {
    const action = new Action<PayloadType>(name);
    this._actions.add(action);
    return action;
  }

  public Collection <DataType = any> (name: string): Collection<DataType> {
    const collection = new Collection<DataType>(name);
    this._collections.add(collection);
    return collection;
  }

  public async Start () {
    if (this.ready) {
      console.warn('Wave start was already called, aborting...');
      return;
    }
    if (!this.cache) {
      this.cache = new Cache(this._config.cache);
    }
    if (!this.storage) {
      if (this._collections.size > 0) {
        try {
          const test = require('@itsrems/wave-sqlite');
          this.storage = new Storage(test);
        } catch (error) {
          return Promise.reject(`
            [Wave] It looks like you forgot to set a storage for wave. \n
            If you're just checking us out, install @itsrems/wave-sqlite for a seamless configuration !
          `);
        }
      } else {
        console.log(`[Wave] No collections appear to have been created, aborting storage creation...`)
      }
    }
    if (this.storage) await this.storage.initialize();
    for (const action of this._actions) {
      action.initListen();
    }
    if (this._config.link) {
      if (!this.link) this.link = new LinkServer(this._config.link);
      this.link.Listen(this);
    }
    console.log(`[Wave] Wave is up and running !`);
    this.ready = true;
    return this;
  }

  public Configure (config: WaveConfig) {
    this._config = {
      ...this._config,
      ...config
    };
  }

  public getAction (name: string): Action {
    let result: Action;
    for (const action of this._actions) {
      if (name === action.name) result = action; 
    }
    return result;
  }

  public setStorage (driver: StorageDriver): this {
    this.storage = new Storage(driver);
    return this;
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