import { action, collection, config, data, setStorage, start } from '@itsrems/wave';
import { WaveMongoDB } from '@itsrems/wave-mongodb';

const store = collection<{
  id: string;
  username: string;
  superfield: string;
  age?: number;
}>('test-super-collection').model({
  id: [String, data.PrimaryKey],
  username: [String],
  superfield: [String],
  age: [Number]
}).defaults({
  age: function () {
    return Math.floor(Math.random() * 100);
  }
})

async function afterStart () {
  // await store.create({
  //   id: 'test',
  //   username: 'nico',
  //   superfield: 'pog'
  // })
  console.log(await store.findById('test'));
}

const storage = new WaveMongoDB("mongodb://root:password@127.0.0.1:27017/?poolSize=20&writeConcern=majority");

setStorage(storage.export());

config({
  link: false
});

start();
afterStart();