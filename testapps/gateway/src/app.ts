import { action, start } from '@pulsejs/wave';

const test = action<{
  username: string;
}>('yep').process(async function ({ username }) {
  return {
    status: 'success',
    data: `${username} is a cool dood !`
  };
});

async function afterStart () {
  console.log(await test.call({ username: 'nico' }));
}

start();
afterStart();