import { MongoClient, Db } from "mongodb";
import utils from "./utils"

//testing some thing sorry for the disturbence
const connectionString = "mongodb+srv://colins:AThkGeEHyrSK7W2Q@cluster0-fkrys.gcp.mongodb.net/test?retryWrites=true&w=majority";
const client = new MongoClient(connectionString).connect();
const db: Promise<Db> = new Promise(async () => (await client).db('Remixx'));
const userCollection = new Promise(async () => (await db).collection('user'));

/**
 * 
 */
export default {
  getCollection: (name: string) => db.then(db => db.collection(name)),

  async findUser(username: string, password: string) {
    const useers = await this.getCollection('users');
    return useers.findOne({
      auth: utils.hash(username, password)
    });
  },

  async userExists(token: string) {
    const users = await this.getCollection('users');
    const numAccountsWithToken = await users.countDocuments({ auth: token });
    return numAccountsWithToken === 1;
  },
}