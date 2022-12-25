// @ts-nocheck
import { call } from '@itsrems/link';

export async function createAccount (username: string, email: string, password: string) {
  const { data, status } = await call('account-create', {
    username, email, password
  });
  if (status !== 'success') {
    if (status === 'duplicate') return console.warn('User was duplicate for the field', data);
  }
}