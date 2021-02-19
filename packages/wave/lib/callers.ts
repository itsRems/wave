import { Action, getWave, Wave } from './internal';

export function action <PayloadType = any> (name: string): Action<PayloadType> {
  return getWave().Action<PayloadType>(name);
}

export function start (): Wave {
  getWave().Start();
  return getWave();
}