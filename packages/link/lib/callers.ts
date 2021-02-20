import { Link, LinkConfig } from "./internal";

export function link (): Link {
  if (globalThis.__wave_link__app) return globalThis.__wave_link__app
  const link = new Link();
  return link;
}

export function config (config: LinkConfig) {
  link().Configure(config);
  return link();
}

export async function call (action: string, payload: any) {
  return await link().Call(action, payload);
}