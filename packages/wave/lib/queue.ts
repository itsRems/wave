/**
 * This would eventually end up being fully custom, I'm only using bee-queue as a POC
 */

import { core } from "./internal";
import Queue from 'bee-queue';

export async function createQueue (name: string, callback: any) {
  const q = new Queue(`wave-q-${name}`); // how do I doooo thiiiiings I need controller name n stuuuuf
  q.process(async function ({ data }) {
    const { payload } = data;
    return await callback(payload);
  });
  core().queues[name] = q;
}