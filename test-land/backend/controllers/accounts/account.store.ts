// @ts-nocheck
import { collection, data, utils } from '@itsrems/wave';
import { AccountBody } from './account.interfaces';

export const AccountCollection = collection<AccountBody>('account-collection')
  .model({
    id: [String, data.PrimaryKey],
    username: [String, data.Required],
    email: [String, data.Required],
    password: [String, data.Secret]
  })
  .defaults({
    id: utils.Snowflake
  })
  .transforms({
    password: async function (pswd: string) {
      return pswd.split('').reverse().join('');
    }
  })
  .cache(15, 'minutes');