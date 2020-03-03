import env = require('env-var');
import { WithTransactionCallback, MongoClient, Collection, ObjectId } from 'mongodb';
import _ = require('lodash');
import { Schema } from 'mongoose';


const connectionString = env.get('MONGO_CONNECTION_STRING').required().asUrlString();
const client = new MongoClient(connectionString, { useUnifiedTopology: true });

export const db = client.db('remix');

/**
 * A convenience function that retrieves a collection by it's key.
 * @param name The name of the collection
 */
export function getCollection<Schema>(name: string) {
  return db.collection<Schema>(name);
}

export async function doTransaction<T>(transaction: WithTransactionCallback<T>) {
  const cli = await client;
  return await cli.withSession(s => s.withTransaction(transaction));
}

// export async function insert(docs: Model<any>[]) {
//   const modelByCollection = _.groupBy(docs, doc => doc.collection.collectionName);
//   for (const collectionName in modelByCollection) {
    
//   }
// }

export type SchemaOf<M extends Model<any>> = ReturnType<M['seralize']>;

interface Schema {
  _id: ObjectId
}

 

export abstract class Model<S extends Schema, CollectionName extends stringlitera;> {
  public abstract seralize(): S;
  static collection = getCollection(CollectionName)


  public insert() {
    return .collection.insertOne(this.seralize());
  };
}