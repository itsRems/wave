import { Db, MongoClient } from 'mongodb';

export interface WaveMongoOptions {
  replaceMongoId: boolean;
}

export class WaveMongoDB {
  private client: MongoClient;
  private db: Db;
  public options: WaveMongoOptions;

  constructor (private uri: string, options?: Partial<WaveMongoOptions>) {
    this.options = {
      replaceMongoId: true,
      ...options
    }
    this.client = new MongoClient(this.uri, {
      useUnifiedTopology: true
    });
  }

  private async initialize () {
    console.log(`[Wave/MongoDB] Initiliazing wave-mongodb...`);
    await this.client.connect();
    this.db = this.client.db('wave');
    console.log(`[Wave/MongoDB] Successfully connected to the mongodb database`);
  }

  private async createOne (collection, data) {
    const dbCol = this.db.collection(collection.name);
    if (this.options.replaceMongoId) {
      data._id = data[collection.primaryKey];
      delete data[collection.primaryKey];
    }
    return (await dbCol.insertOne(data)).insertedId;
  }

  private async findById (collection, id) {
    try {
      const dbCol = this.db.collection(collection.name);
      const query = this.options.replaceMongoId ? {
        _id: id
      } : {
        [collection.primaryKey]: id
      }
      const result = await dbCol.findOne(query);
      if (!result) return undefined;
      if (this.options.replaceMongoId) {
        result[collection.primaryKey] = result._id;
        delete result._id;
      }
      return result;
    } catch (error) {
      return undefined; 
    }
  }

  private async updateDocument (collection, id, updates) {
    const dbCol = this.db.collection(collection.name);
    const query = this.options.replaceMongoId ? {
      _id: id
    } : {
      [collection.primaryKey]: id
    }
    if (this.options.replaceMongoId) delete updates[collection.primaryKey];
    else delete updates._id;
    await dbCol.updateOne(query, {
      $set: updates
    }, { upsert: true });
  }

  private async findOne (collection, fields) {
    try {
      const dbCol = this.db.collection(collection.name);
      const result = await dbCol.findOne(fields);
      if (!result) return undefined;
      if (this.options.replaceMongoId) {
        result[collection.primaryKey] = result._id;
        delete result._id;
      }
      return result;
    } catch (error) {
      return undefined;
    }
  }

  public export (): any {
    return {
      initialize: () => this.initialize(),
      createTableIfNotExist: () => (true),
      createDocument: this.createOne,
      updateDocument: this.updateDocument,
      findById: this.findById,
      findOne: this.findOne
    }
  }
}