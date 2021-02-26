import { action, start } from '@itsrems/wave';

const myAction = action<{
  username: string;
}>('my-action').process(async function ({ username }) {
  // Force our function to wait for 2.5s when ran uncached
  await new Promise((resolve) => {
    setTimeout(() => (resolve(true)), 2500);
  });
  console.log(`My super action got a new request ! The username I was provided is: ${username}`);
  return {
    status: 'success',
    data: `You are a super cool person !`
  }
}).cache(30, 'seconds'); // Cache our action for 30 seconds (the 2nd parameter is optional - the default time unit is minutes).

// Wrapping our app so we can wait for wave to start before calling our action
// This is not required as wave will not run any action before it's ready, leaving promises pending for as long as it starts. Magic !
async function myApp () {
  await start();
  console.log(await testCall()); // this will run uncached 
  console.log(await testCall()); // this will be much faster
}

async function testCall () {
  const start = Date.now();
  const { status, data } = await myAction.call({ username: 'nico' });
  const latency = Date.now() - start;
  return { data, latency };
}

myApp();