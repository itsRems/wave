import { action } from '@pulsejs/wave';

async function start () {
  const test = action<{
    username: string;
  }>('yep').process(async function ({ username }) {
    return {
      status: 'success',
      data: username
    };
  });
}

start();