import { StorageConfig } from "./storage";

export interface WaveConfig {
  storage: StorageConfig;
}

export default class Wave {
  constructor(public config: WaveConfig) {
    
  }
}