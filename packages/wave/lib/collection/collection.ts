import { createHmac } from 'crypto';
import { TimeUnits, toMS, Wave, wave } from '../internal';
import { deepMerge, mergeTo } from '../utils';
import { Data, GenericModelTypes, ModelTypes } from "./data";

export interface ModelPayload {
  [key: string]: [GenericModelTypes, ...Array<ModelTypes>];
}

export interface DefaultsPayload {
  [key: string]: any;
}

type GenericFunction = () => GenericModelTypes | Promise<GenericModelTypes>;

export class Collection <DataType = any> {
  public _model: ModelPayload;
  public _defaults: {
    [key in keyof DataType]: GenericModelTypes|Function|Promise<GenericModelTypes>;
  };
  public _cache: boolean;
  public _cachettl: number;
  public primaryKey: string = 'id';
  public name: string;
  public instance: () => Wave;

  constructor (name: string) {
    this.name = name;
    this.instance = wave;
  }

  public cache (ttl: number | false = 60, timeUnit: TimeUnits = "minutes") {
    if (ttl) {
      this._cachettl = toMS(ttl, timeUnit);
      this._cache = true;
    } else this._cache = false;
    return this;
  }

  /**
   * 
   * @param data 
   */
  public async create (data: Partial<DataType>) {
    data = deepMerge<DataType>(data, this._defaults);
    for (const key in data) {
      const value = data[key];
      if (this.isFunction(value)) data[key] = await (value as any)(data);
    }
    for (const key in this._model) {
      const types = this._model[key];
      if (types.includes('Unique')) {
        let exists = undefined;
        try {
          const check = await this.findOne({
            [key]: data[key]
          } as DataType);
          if (check) exists = { key, value: check.value[key] };
        } catch (error) {}
        if (exists) throw `[Wave] Found a duplicate for key ${exists.key} with value ${exists.value} on collection ${this.name} when trying to create a new document`
      }
    }
    const doc = await this.instance().storage.createDocument(this, data);
    return new Data(() => this, doc);
  }

  public defaults (defaults: Partial<{
    [key in keyof DataType]: GenericModelTypes | GenericFunction;
  }>) {
    this._defaults = defaults as any; // because it's a partial
    return this;
  }

  public async findById (id: string): Promise<Data<DataType>> {
    try {
      let key = '';
      if (this._cache) {
        key = this.makeCacheKey({ id, type: 'findById' });
        const cached = await this.instance().cache.get(key);
        if (cached) return new Data(() => this, cached);
      } 
      const value = await this.instance().storage.findById(this, id);
      if (value) {
        if (this._cache) {
          await this.instance().cache.set(key, value, {
            time: this._cachettl,
            unit: 'milliseconds'
          });
        }
        return new Data(() => this, value);
      }
    } catch (error) {}
    return undefined;
  }

  public async find (fields: Partial<DataType>): Promise<Data<DataType>[]> {
    try {
      const results = await this.instance().storage.find(this, fields);
      if (!results) return undefined;
      const datas: Data<DataType>[] = [];
      for (const value of results) {
        datas.push(new Data(() => this, value));
      }
      return datas;
    } catch (error) {
      return undefined;
    }
  }
  
  public async findOne (fields: Partial<DataType>): Promise<Data<DataType>> {
    try {
      const result = await this.instance().storage.findOne(this, fields);
      if (!result) return undefined;
      return new Data(() => this, result);
    } catch (error) {
      return undefined;
    }
  }

  public async findByIndex (index: keyof DataType, value: any) {
    console.log(await this.instance().storage.findByIndex(this, String(index), value));
  }

  public async update (id: string, payload: Partial<DataType>, options?: {
    nested?: boolean;
  }): Promise<DataType> {
    options = mergeTo(options, {
      nested: true
    });
    if (options.nested) {
      try {
        const original = (await this.findById(id)).value;
        payload = deepMerge(original, payload) as DataType;
      } catch (error) {}
    }
    await this.instance().storage.updateDocument(this, id, payload);
    await this.resetCache();
    return undefined;
  }

  public async delete (id: string) {
    return await this.instance().storage.deleteDocument(this, id);
  }

  public model (model: {
    [key in keyof DataType]: [GenericModelTypes, ...Array<ModelTypes>];
  }) {
    this._model = model;
    return this;
  }

  private isFunction (func: any): boolean {
    return func && {}.toString.call(func) === '[object Function]';
  }

  private makeCacheKey (query: any) {
    try {
      query = JSON.stringify(query);
    } catch (error) {}
    return `${this.instance()._config.cache?.prefix || 'wave_cache'}_${this.name}_${createHmac('sha256', 'cache').update(`${this.name}${query}`).digest('hex')}`;
  }

  private async resetCache () {
    return new Promise((resolve) => {
      const match = `*${this.instance()._config.cache?.prefix || 'wave_cache'}_${this.name}*`;
      const stream = this.instance().cache.client.scanStream({
        match
      });
      const pipeline = this.instance().cache.client.pipeline();
      stream.on('data', (keys) => {
        if (keys.length) {
          keys.forEach((key) => pipeline.del(key));
          pipeline.exec();
        }
      });
      stream.on('end', async () => {
        await pipeline.exec();
        return resolve(true);
      });
    })
  }
  
}

/**
 * Idea: have a query system (for link) that allows to write action-like queries in collections, but they return a subscribable data set.
 * So that if the orignal data changes, our ws connection gets a message with the data update
 */