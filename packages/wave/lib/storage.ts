import { Collection, Wave, wave } from "./internal";
import { mergeTo } from "./utils";

export interface StorageDriver {
  usesJson?: boolean;
  initialize: {
    (instance: Wave): Promise<void>;
  };
  doMigrations: {
    (collections: Collection[]): Promise<void>;
  };
  createDocument: {
    (collection: Collection, document: Object): Promise<void>;
  };
  updateDocument: {
    (collection: Collection, payload: {
      query: Object;
      updates: Object;
      nested?: boolean;
    }): Promise<any>;
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
  createTable: {
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
    if (this.isFunction(this.driver.doMigrations)) this.driver.doMigrations(Array.from(this.instance()._collections));
    this.storageReady = true;
  }

  public async findById (collection: Collection, id: string) {
    if (!this.storageReady) return undefined;
    return await this.driver.findById(collection, id);
  }

  private isFunction (func: any): boolean {
    return func && {}.toString.call(func) === '[object Function]';
  }
}