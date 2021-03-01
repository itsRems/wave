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
  test?: string;
}>('test-collection')
  .model({
    id: [String, data.PrimaryKey],
    username: [String, data.Required, data.Index, data.Unique],
    test: [String, data.Secret]
  })
  .defaults({
    test: 'spooky'
  })
  .cache(1);

async function afterStart () {
  let start = Date.now()
  console.log(await test.call({ username: 'nico' }), Date.now() - start);
  const user = await store.findById('test');
  if (user) {
    console.log(user.public());
    user.update({
      username: 'Nicolas'
    })
  }
  try {
    await store.delete('megatest');
    await store.create({
      id: "megatest",
      username: 'nicolas_thazeaeck'
    });
  } catch (error) {
    console.log('te', error);
  }
  try {
    console.log(await store.findOne({
      username: 'nico'
    }))
  } catch (error) {
    
  }
}

start();
afterStart();