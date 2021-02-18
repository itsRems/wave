// @ts-nocheck
import { auto, config } from '@pulsejs/wave';

config({
  cache: {
    prefix: 'wave_test',
    ttl: 15 * 60 // Default TTL in seconds
  },
  redis: {
    host: '127.0.0.1',
    port: 6379
  },
  api: {
    rest: {
      port: 1501
    },
    ws: {
      port: 1500
    }
  }
});

auto.controllers('./controllers'); // Automatically import & initialize controllers under the 'controllers' directory