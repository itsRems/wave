import { action, config, start } from '@itsrems/wave';

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