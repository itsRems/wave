// @ts-nocheck
import { action } from '@pulsejs/wave';
import {
  AccountCollection as collection
} from './account.store';

interface AccountCreationPayload {
  username: string;
  email: string;
  password: string;
}

export const newAccount = action('account-create').function(async function (payload: AccountCreationPayload) {
  const exists = await collection.exists(payload, { mode: 'any' });
  if (exists) return {
    status: 'duplicate', // was using 'error' first but I thought we could have a standard status/data format
    data: exists.fields[exists.firstFound]
  };
}).rest({ method: 'POST', route: '/create' }); // should we assume the route will be under /accounts/create ? I think so

// ... actions would be wrapped in the controller so that they are defined and "catchable" by the WS server