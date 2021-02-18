import Queue from 'bee-queue';

export default class core {
  public queues: {
    [key: string]: Queue
  };
  constructor () {

  }
}