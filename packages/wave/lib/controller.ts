import { Action, Collection } from './internal';

export type FuncObj = { [key: string]: (...args: any) => any };
export type EventObj = { [key: string]: Event };
export type AnyObj = { [key: string]: any };

//
export interface ControllerConfig {
  name?: string;
  root: { [key: string]: any };
  collection: Collection<any>;
  collections: { [key: string]: Collection<any> };
  actions: {
    [key: string]: Action
  };
  helpers: FuncObj;
}

export class Controller<O extends Partial<ControllerConfig> = Partial<ControllerConfig>> {
  public name?: string;
  public config: O;

  // primary collection
  public collection: this['config']['collection'];
  public collections: this['config']['collections'];

  // actions, helpers and routes simply containers for functions
  public actions: this['config']['actions'];
  public helpers: this['config']['helpers'];

  // convert config to partial type to allow for certain config properties to be excluded
  constructor(config: Partial<O>) {
    this.config = config as Required<O>;

    // assign every property in config to root, types inferred above at declaration (state, collection etc..)
    for (const sectionName in this.config) this[sectionName as string] = this.config[sectionName];

  }
  public root<R extends AnyObj = AnyObj>(bindObj: R): this & R {
    for (const propertyName in bindObj) this[propertyName as string] = bindObj[propertyName];
    return this as this & R;
  }
}

/**
 * Yoink'd from pulse !
 */