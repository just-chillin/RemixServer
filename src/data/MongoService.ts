import { MongoClient, ObjectId } from "mongodb";

import utils from "../utils";

const connectionString =
  "mongodb+srv://colins:AThkGeEHyrSK7W2Q@cluster0-fkrys.gcp.mongodb.net/test?retryWrites=true&w=majority";
const client = new MongoClient(connectionString, { useUnifiedTopology: true }).connect();
const db = Promise.resolve(client.then(client => client.db("remix")));

interface Video {
  _id: ObjectId;
  s3_url: string;
  name: string;
  description: string;
  owner_id: ObjectId;
  url: string;
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

function getCollection<T>(name: string) {
  return Promise.resolve(db.then(db => db.collection<T>(name)));
}

export default {
  users: getCollection<User>("users"),
  videos: getCollection<Video>("videos"),
  beta_registrations: getCollection<BetaRegistration>("beta_registrations"),

  async betaRegister(email: string) {
    const beta_registrations = await this.beta_registrations;
    return await beta_registrations.insertOne({ email: email });
  },

  /**
   * TODO IMPLEMENT PAGINATION
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

  async createVideoMetadata(ownerAuthToken: string, name: string, description: string, url: URL, key: string) {
    const videos = await this.videos;
    const owner = await this.findUserByAuth(ownerAuthToken);
    if (!owner) {
      throw new Error("Invalid ownerAuthToken or user not found when attempting to create video metadata");
    }
    await videos.insertOne({
      s3_url: "hello", //TODO get s3 URL
      name: name,
      description: description,
      owner_id: owner._id,
      url: url.href,
      key: key,
      timestamp: new Date(),
    });
  },

  async findUser(username: string, password: string) {
    return this.users.then(users =>
      users.findOne({
        auth: utils.hash(username, password),
      })
    );
  },

  async findUserByAuth(auth: string) {
    return this.users.then(users => users.findOne({ auth: auth }));
  },

  async userExists(token: string) {
    const users = await this.users;
    const numAccountsWithToken = await users.countDocuments({ auth: token });
    if (numAccountsWithToken > 1) {
      console.error("CRITICAL BUG: USER DATA CLASH");
    }
    return numAccountsWithToken === 1;
  },

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
