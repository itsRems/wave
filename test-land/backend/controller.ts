// @ts-nocheck
import { collection, controller, data } from '@itsrems/wave';

interface AccountBody {
  username: string;
}

const UserStore = collection<AccountBody>().model({
  id: [String, data.PrimaryKey],
  username: [String, data.Required, data.index()]
}).defaults({
  id: function () {
    return `id_${Math.floor(Math.random() * 100)}`;
  }
}).cache(15, 'minutes');

async function updateUsername (id: string) {
  UserStore.update(id, {
    username: 'jeff'
  })
}

const AccountController = controller({
  actions: {
    updateUsername
  },
  data: UserStore
})

export default AccountController;