import { Action, Wave } from './internal';

export function action <PayloadType = any> (name: string): Action<PayloadType> {
  return wave().Action<PayloadType>(name);
}

export function wave (): Wave {
  if (globalThis.__wave__app) return globalThis.__wave__app;
  const wave = new Wave();
  return wave;
}

export function start (): Wave {
  wave().Start();
  return wave();
}