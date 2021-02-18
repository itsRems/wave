# @rocketplay/cache
A dead simple ioredis wrapper for caching

## Installing
`yarn add @rocketplay/cache` or `npm i @rocketplay/cache`

## Initializing
```typescript
import { initCache } from '@rocketplay/cache';

initCache({
  prefix: 'mysupercache'
});
```

## Simple example with express

```typescript
import { cacheItem, getCached } from '@rocketplay/cache';

// ... assuming you have a base express app

// Dummy async function
async function getLink () {
  return await new Promise((resolve) => {
    setTimeout(() => {
      resolve('twitch.tv/itsRems');
    }, 1337);
  })
}

app.get('/cached', async function (req, res) {
  const key = "thing_Icached";
  const cached = await getCached(key);
  if (cached) return res.send({ link: cached });
  const link = await getLink();
  await cacheItem(key, link, 15*60); // Cache for 15 minutes
  return res.send({ link });
});

```

moar docs coming soon, feel free to take a look at the source code ;)