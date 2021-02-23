import { action, collection, data, start } from '@pulsejs/wave';

const test = action<{
  username: string;
}>('yep').process(async function ({ username }) {
  return {
    status: 'success',
    data: `${username} is a cool dood !`
  };
});

const store = collection<{
  id: string;
  username: string;
  test: string;
}>('test-collection')
  .model({
    id: [String, data.PrimaryKey],
    username: [String, data.Required],
    test: [String]
  })

async function afterStart () {
  console.log(await test.call({ username: 'nico' }));
  console.log(store);
}

start();
afterStart();