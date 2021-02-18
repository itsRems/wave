export interface ActionReturn {
  status: number | string;
  data?: any;
}

export type ProcessReturn = Promise<ActionReturn> | ActionReturn;

export interface ProcessFunc<PayloadType> {
  (payload: PayloadType): ProcessReturn;
}

export class action<PayloadType = any> {
  public name: string;
  private func: Function;

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

export default action;