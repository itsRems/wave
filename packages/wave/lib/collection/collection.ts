import { createHmac } from 'crypto';
import { TimeUnits, toMS, Wave, wave } from '../internal';
import { mergeTo } from '../utils';
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

  public async create (data: DataType) {
    data = mergeTo(data, this._defaults as DataType);
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
    return await this.instance().storage.createDocument(this, data);
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
      if (this.cache) {
        key = this.makeCacheKey({ id, type: 'findById' })
        const cached = await this.instance().cache.get(key);
        if (cached) return new Data(() => this, cached);
      } 
      const value = await this.instance().storage.findById(this, id);
      if (value) {
        if (this.cache) {
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

  public async findByIndex (index: string, value: any) {

  }

  public async update (id: string, payload: Partial<DataType>, options?: {
    nested?: boolean;
  }) {
    mergeTo(options, {
      nested: true
    });
    return await this.instance().storage.updateDocument(this, {
      updates: payload,
      nested: options.nested,
      id
    });
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
    return createHmac('sha256', 'cache').update(`${this.name}${query}`).digest('hex');
  }
  
}

/**
 * Idea: have a query system (for link) that allows to write action-like queries in collections, but they return a subscribable data set.
 * So that if the orignal data changes, our ws connection gets a message with the data update
 */