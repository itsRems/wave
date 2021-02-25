import { Collection, Wave } from "./internal";
import { mergeTo } from "./utils";

export interface StorageDriver {
  usesJson?: boolean;
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

  constructor (driver: StorageDriver) {
    this.driver = mergeTo(driver, {
      usesJson: false
    });
    // @todo: connect method
    this.storageReady = true;
  }

  public async findById (collection: Collection, id: string) {
    if (!this.storageReady) return undefined;
    return await this.driver.findById(collection, id);
  }
}