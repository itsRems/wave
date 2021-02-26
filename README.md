# Wave
### An all-in-one backend framework for NodeJS, built with love & Typescript by itsRems.

# @itsrems/wave
### The wave server package, used to build backend applications.
## Requirements
Wave requires NodeJS v12+ and a redis instance to connect to. It also requires a storage driver (if you plan on using collections - WHICH DO NOT WORK AT THE TIME OF WRITING THESE DOCS).

The default redis instance wave will try to connect to is 127.0.0.1:6379, but you can change this using `config`.

While this is not *required*, **I strongly recommend using typescript**. This is what wave was built on and more importantly, for. If you're not using typescript already, give it a try !

## Getting Started
### Installing
`yarn add @itsrems/wave` or `npm i @itsrems/wave`

## Actions
Actions are both your functions and "routes", all in one.

They are queue-based using `bee-queue`, allowing for easy scaling of any wave-based app.



Defining an action is a simple as this:
```ts
import { action } from '@itsrems/wave';

const myAction = action('my-action');
```
The first parameter is your action's name, and it should be unique. This is also the name you'll use to call it from link (more on that in the [link section](#itsremslink)).

Actions also take a [generic](https://www.typescriptlang.org/docs/handbook/generics.html) to type the payload. Here's an example
```ts
import { action } from '@itsrems/wave';

const myAction = action<{
  username: string;
}>('my-action');
```
Your action is now typed in such a way that the payload object will match `{ username: string }`.

This is all fun and games but our action is pretty... useless (*[unless... ?]()*). Let's change that !

We'll call the `process` function and pass along a function for our action to run on call.
```ts
import { action } from '@itsrems/wave';

const myAction = action<{
  username: string;
}>('my-action').process(async function ({ username }) {
  console.log(`My super action got a new request ! The username I was provided is: ${username}`);
  return {
    status: 'success',
    data: `You are a super cool person !`
  }
});
```
In the `return` section, we're returning a standard wave "action return payload". This will always be an object with two props: `data` and `status`.

Your `status` is going to be a string, and it can be anything you want it to be. You should use this to specify whether or not your action ran properly, and what went wrong if it failed. Examples: `success, error, duplicate, ...`


With this out of the way, our action is ready to be called ! But first, we need to start wave. 

Does that sound like one of those horribly complicated tasks ? Fear not ! It's dead simple.

```ts
import { action, start } from '@itsrems/wave';

const myAction = action<{
  username: string;
}>('my-action').process(async function ({ username }) {
  console.log(`My super action got a new request ! The username I was provided is: ${username}`);
  return {
    status: 'success',
    data: `You are a super cool person !`
  }
});

start();
```
That's... it ! Provided you have a redis server open on your computer with the default port, and that your `1500` is free, wave should start.

Let's celebrate by calling our action.
```ts
import { action, start } from '@itsrems/wave';

const myAction = action<{
  username: string;
}>('my-action').process(async function ({ username }) {
  console.log(`My super action got a new request ! The username I was provided is: ${username}`);
  return {
    status: 'success',
    data: `You are a super cool person !`
  }
});

// Wrapping our app so we can wait for wave to start before calling our action
// This is not required as wave will not run any action before it's ready, leaving promises pending for as long as it starts. Magic !
async function myApp () {
  await start();
  const { status, data } = await myAction.call({ username: 'nico' });
  console.log(status, data);
}

myApp();
```
If all went well, you should see something a bit like this:
![output](https://i.imgur.com/n2YloFM.png)

One more cool thing we can do is cache this action.

While the actual process of how we cache actions is a bit complicated to explain, know that we generate the cache key using the action's name and the payload, making the caching safe to use in situations where the output depends on the payload.

So, let's cache it !
```ts
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
```
You should see something like this appear in your console:
![console](https://imgur.com/ViLBd3U.png)

We can see a few things here: first, the latency of the first call was of only 2ms compared to the ~2.5s of the first call.
2nd, we can see that our console didn't output the username on the 2nd run. This is because as the action was cache, the function wasn't actually ran.

Instead, we made a cache key, checked for it inside our redis server, and got an output - only the 2nd time, as the first run took care of actually running our function and saving the result. Neat, right ?
## Collections
@todo

## Config
@todo

## Storage
@todo

# @itsrems/link
#### Link is the communication library for use in the browser