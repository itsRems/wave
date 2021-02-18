// @ts-nocheck
import { action, core, dial } from '@pulsejs/wave';
import {
  OrderCollection as collection
} from './order.store';

export const get = action('get-order').process(async function ({ id }: { id: string }) {
  const order = await collection.findById(id);
  if (!order) return { status: 'not_found' };
  const customer = await core().accounts.get({ id: order.customerId });
  return {
    status: 'success',
    data: {
      order, customer
    }
  }
});