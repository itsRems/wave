export interface ActionReturn {
  status: number | string;
  data?: any;
}

export type ProcessReturn = Promise<ActionReturn> | ActionReturn;

export interface ProcessFunc<PayloadType> {
  (payload: PayloadType): ProcessReturn;
}

export class Action<PayloadType = any> {
  public name: string;
  public func: Function;

  constructor (name: string) {
    this.name = name;
    return this;
  }

  public process (callback: ProcessFunc<PayloadType>) {
    this.func = callback;
    return this;
  }

  public async call (payload: PayloadType) {
    try {
      return await this.func(payload);
    } catch (error) {
      
    }
  }
}