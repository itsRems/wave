import { mergeTo } from "./utils";

export interface StorageDriver {
  
}

export class Storage {
  public driver: StorageDriver;

  constructor (driver: StorageDriver) {
    this.driver = mergeTo(driver, {
      
    })
  }
}