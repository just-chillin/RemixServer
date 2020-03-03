import env = require('env-var');
import { WithTransactionCallback, MongoClient, Collection } from 'mongodb';
import _ = require('lodash');


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

export type SchemaOf<M extends Model> = ReturnType<M['seralize']>;

export abstract class Model<Schema = any> {
  public abstract seralize(): Schema; 
  /**
   * Returns the collection that this document belongs to. MUST BE Overriden and MUST BE cached unless you want to kill preformance.
   */
  public static get collection(): SchemaOf<>;
  public insert() {
    return this.collection.insertOne(this.seralize());
  };
}