import { MongoClient, ObjectId, WithTransactionCallback } from "mongodb";
import {RefreshToken, AccessToken, Identity} from "../auth/IdentityProvider"
import utils from "../utils";

const connectionString =
  "mongodb+srv://colins:AThkGeEHyrSK7W2Q@cluster0-fkrys.gcp.mongodb.net/test?retryWrites=true&w=majority";
const client = new MongoClient(connectionString, { useUnifiedTopology: true }).connect();
const db = Promise.resolve(client.then(client => client.db("remix")));

interface Video {
  _id: ObjectId;
  name: string;
  description: string;
  owner_id: ObjectId;
  key: string;
  timestamp: Date;
}

interface User {
  _id: ObjectId;
  handle: string;
  email: string;
  auth: string;
}

interface BetaRegistration {
  _id: ObjectId;
  email: string;
}

/**
 * A convenience function that retrieves a collection by it's key.
 * @param name The name of the collection
 */
function getCollection<T>(name: string) {
  return Promise.resolve(db.then(db => db.collection<T>(name)));
}

const MongoService = {
  users: getCollection<User>("users"),
  videos: getCollection<Video>("videos"),
  beta_registrations: getCollection<BetaRegistration>("beta_registrations"),
  identities: getCollection<Identity>("identities"),
  client: client,

  /**
   * Inserts a userr into the beta_registrations collection.
   * @param email The email of the user
   */
  async betaRegister(email: string) {
    const beta_registrations = await this.beta_registrations;
    return await beta_registrations.insertOne({ email: email });
  },

  /**
   * Gets a list of the newest videos from timestamp
   * TODO: IMPLEMENT PAGINATION
   * @param timestamp When to start retreiving the videos from.
   * @param page Should get the page to look from, but currently pagination is not implemented, so this parameter does nothing.
   */
  async getNewVideos(timestamp: Date, page: number) {
    const videos = await this.videos;
    return await videos
      .find({
        $expr: { $lt: ["$timestamp", timestamp] },
      })
      .sort({ timestamp: -1 })
      .toArray();
  },

  /**
   *
   * @param ownerAuthToken The auth token of the video's owner
   * @param name The name of the video
   * @param description The description of the video.
   * @param url The video's url in S3.
   * @param key The video's uuid
   */
  async createVideoMetadata(ownerAuthToken: string, name: string, description: string, url: string, key: string) {
    const videos = await this.videos;
    const owner = await this.findUserByAuth(ownerAuthToken);
    if (!owner) {
      throw new Error("Invalid ownerAuthToken or user not found when attempting to create video metadata");
    }
    await videos.insertOne({
      name: name,
      description: description,
      owner_id: owner._id,
      key: key,
      timestamp: new Date(),
    });
  },

  /**
   * Retreives a user by their username and password combo
   * @param username The username
   * @param password The password
   */
  async findUser(username: string, password: string) {
    return this.users.then(users =>
      users.findOne({
        auth: utils.hash(username, password),
      })
    );
  },

  /**
   * Finds a user by their auth token.
   * @param auth The user's auth token.
   */
  async findUserByAuth(auth: string) {
    return this.users.then(users => users.findOne({ auth: auth }));
  },

  /**
   * Checks to see if a user exists.
   * @param token The user's auth token
   */
  async userExists(token: string) {
    const users = await this.users;
    const numAccountsWithToken = await users.countDocuments({ auth: token });
    if (numAccountsWithToken > 1) {
      console.error("CRITICAL BUG: USER DATA CLASH");
    }
    return numAccountsWithToken === 1;
  },

  async doTransaction<T>(transaction: WithTransactionCallback<T>) {
    const cli = await client;
    return await cli.withSession(s => s.withTransaction(transaction));
  },

  /**
   * Creates a user document in mongodb
   * @param handle The user's username
   * @param email The user's email
   * @param password The user's password
   */
  async createUser(handle: string, email: string, password: string) {
    const users = await this.users;
    console.log("Creating user " + handle);
    return users.insertOne({
      handle: handle,
      email: email,
      auth: utils.hash(email, password),
    });
  },
};

export { MongoService as default };
