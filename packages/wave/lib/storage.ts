import { Collection, Wave, wave } from "./internal";
import { mergeTo } from "./utils";

export interface StorageDriver {
  usesJson?: boolean;
  supportsIndexing?: boolean;
  initialize: {
    (instance: Wave): Promise<void>;
  };
  doMigrations: {
    (collections: Collection[]): Promise<void>;
  };
  createDocument: {
    (collection: Collection, document: Object): Promise<string>;
  };
  updateDocument: {
    (collection: Collection, id: string, updates: Object): Promise<any>;
  };
  deleteDocument: {
    (collection: Collection, id: string): Promise<void>;
  };
  findById: {
    (collection: Collection, id: string): Promise<any>;
  };
  findByIndex: {
    (collection: Collection, payload: {
      index: string;
      value: any;
    }): Promise<any>;
  };
  find: {
    (collection: Collection, fields: any): Promise<any[]>;
  };
  findOne: {
    (collection: Collection, fields: any): Promise<any>;
  };
  createTableIfNotExist: {
    (collection: Collection): Promise<void>;
  };
  deleteTable: {
    (collection: Collection): Promise<void>;
  };
  createIndex: {
    (collection: Collection, indexKey: string): Promise<void>;
  };
  deleteIndex: {
    (collection: Collection, indexKey: string): Promise<void>;
  };
}

export class Storage {
  public driver: StorageDriver;
  public storageReady: boolean;
  public instance: () => Wave;

  constructor (driver: StorageDriver) {
    this.driver = mergeTo(driver, {
      usesJson: false
    });
    this.instance = wave;
  }

  public async initialize () {
    if (!this.isFunction(this.driver.initialize)) throw 'The driver\'s initialize function is not valid ! Aborting...';
    await this.driver.initialize(this.instance());
    if (this.isFunction(this.driver.doMigrations)) {
      try {
        this.driver.doMigrations(Array.from(this.instance()._collections));
      } catch (error) {
        console.error('[Wave] The storage driver returned an error on migrations:', error);
      }
    }
    for (const collection of this.instance()._collections) {
      await this.driver.createTableIfNotExist(collection);
      const model = collection._model;
      for (const key in model) {
        const types = model[key];
        if (types.includes('Index') && this.driver.supportsIndexing) await this.driver.createIndex(collection, key);
      }
    }
    this.storageReady = true;
    console.log('[Wave] Storage is ready and initialized !');
  }

  public async createDocument (collection: Collection, payload: Object) {
    if (!await this.waitInit()) return undefined;
    return await this.driver.createDocument(collection, payload);
  }

  public async deleteDocument (collection: Collection, id: any) {
    if (!await this.waitInit()) return undefined;
    return await this.driver.deleteDocument(collection, id);
  }

  public async updateDocument (collection: Collection, id: string, updates: Object) {
    if (!await this.waitInit()) return undefined;
    return await this.driver.updateDocument(collection, id, updates);
  }

  public async findById (collection: Collection, id: string) {
    if (!await this.waitInit()) return undefined;
    return await this.driver.findById(collection, id);
  }

  public async findByIndex (collection: Collection, index: string, value: string) {
    if (!await this.waitInit()) return undefined;
    return await this.driver.findByIndex(collection, {
      index, value
    });
  }

  public async find (collection: Collection, fields: Object) {
    if (!await this.waitInit()) return undefined;
    return await this.driver.find(collection, fields);
  }

  public async findOne (collection: Collection, fields: Object) {
    if (!await this.waitInit()) return undefined;
    return await this.driver.findOne(collection, fields);
  }

  private isFunction (func: any): boolean {
    return func && {}.toString.call(func) === '[object Function]';
  }

  private async waitInit (tries = 25) {
    return await new Promise((resolve) => {
      let int = undefined;
      let attempt = 0;
      const checkInit = () => {
        if (this.storageReady || attempt >= tries) {
          clearInterval(int);
          return resolve(true);
        }
        attempt++;
      }
      int = setInterval(checkInit, 50);
    });
  }
}