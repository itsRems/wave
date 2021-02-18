import Action from './action';

export function action <PayloadType = any> (name: string): Action<PayloadType> {
  return new Action<PayloadType>(name);
}