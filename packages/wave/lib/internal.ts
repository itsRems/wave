import Action from './action';
import Core from './core';

let WaveInstance: Core;

export function action <PayloadType = any> (name: string): Action<PayloadType> {
  return new Action<PayloadType>(name);
}

export function core () {
  if (WaveInstance) return WaveInstance;
  const core = new Core();
  WaveInstance = core;
  return core;
}