import { action, config, start } from '@pulsejs/wave';

const test = action<{
  username: string;
}>('yep');

async function afterStart () {
  console.log(await test.call({ username: 'nico' }));
}

config({
  link: false
});

start();
afterStart();