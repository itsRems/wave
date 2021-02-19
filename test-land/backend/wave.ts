// @ts-nocheck
import { auto, config, start } from '@pulsejs/wave';

config({
  cache: {
    prefix: 'wave_test',
    ttl: 15 * 60 // Default TTL in seconds
  },
  redis: {
    host: '127.0.0.1',
    port: 6379
  },
  rest: {
    // req/res from Fastify
    send: async function (req, res, ctx) {
      let status: number;
      switch (ctx.status) {
        case 'not_found':
          status = 404;
          break;

        case 'duplicate':
          status = 409;
          break;

        case 'error':
          status = 500;
          break;
      
        default:
          status = 200;
          break;
      }
      return res.status(status).send({ data: ctx.data })
    }
  },
  link: {
    port: 1500
  }
});

auto.controllers('./controllers'); // Automatically import & initialize controllers under the 'controllers' directory

start();