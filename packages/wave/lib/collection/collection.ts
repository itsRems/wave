import { TimeUnits, toMS } from '../internal';
import { GenericModelTypes, ModelTypes } from "./data";

export interface ModelPayload {
  [key: string]: [GenericModelTypes, ...Array<ModelTypes>];
}

export interface DefaultsPayload {
  [key: string]: any;
}

export class Collection <DataType = any> {
  public _model: ModelPayload;
  public _cache: boolean;
  public _cachettl: number;
  public name: string;

  constructor (name: string) {
    this.name = name;
  }

  public model (model: ModelPayload) {
    console.log(model, this._model);
    for (const key in model) {
      const value = model[key];
      console.log(key, value);
    }
    this._model = model;
    return this;
  }

  public defaults (defaults: DefaultsPayload) {
    return this;
  }

  public cache (ttl: number | false = 60, timeUnit: TimeUnits = "seconds") {
    if (ttl) {
      this._cachettl = toMS(ttl, timeUnit);
      this._cache = true;
    } else this._cache = false;
    return this;
  }

  public findById (id: string) {

  }
}

const test = new Collection('test-collection').model({
  id: [String, ModelTypes.PrimaryKey]
})