import { action, collection, data, start } from '@itsrems/wave';

const test = action<{
  username: string;
}>('yep').process(async function ({ username }) {
  await new Promise((resolve) => {
    setTimeout(() => (resolve(true)), 2500);
  });
  return {
    status: 'success',
    data: `${username} is a cool dood !`
  };
}).cache(1);

const store = collection<{
  id: string;
  username: string;
  test: string;
}>('test-collection')
  .model({
    id: [String, data.PrimaryKey],
    username: [String, data.Required, data.Index],
    test: [String, data.Secret]
  });

async function afterStart () {
  console.log(await test.call({ username: 'nico' }));
  try {
    store.create({
      id: "test",
      username: 'nico',
      test: 'ahah'
    });
  } catch (error) {
    
  }
  console.log((await store.findById('test')).public());
}

start();
afterStart();