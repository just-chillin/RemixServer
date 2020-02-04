import { MongoClient, Db, Collection, ObjectID, ObjectId, Cursor } from "mongodb";

import utils from "./utils";
import btoa from "btoa";

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
  created_on: Date;
}

interface User {
  _id: ObjectId;
  handle: string;
  email: string;
  auth: string;
}

function getCollection<T>(name: string) {
  return Promise.resolve(db.then(db => db.collection<T>(name)));
}

const DbUtil = {
  users: getCollection<User>("users"),
  videos: getCollection<Video>("videos"),

  async createVideoMetadata(ownerAuthToken: string, name: string, description: string) {
    const videos = await DbUtil.videos;
    const owner = await DbUtil.findUserByAuth(ownerAuthToken);
    if (!owner) {
      throw new Error("Invalid ownerAuthToken");
    }
    videos.insertOne({
      s3_url: "hello", //TODO get s3 URL
      name: name,
      description: description,
      owner_id: owner._id,
      created_on: new Date(),
    });
  },

  async findUser(username: string, password: string) {
    const users = await DbUtil.users;
    return users.findOne({ auth: utils.hash(username, password) });
  },

  async findUserByAuth(auth: string) {
    const users = await DbUtil.users;
    return users.findOne({ auth: auth });
  },

  async userExists(token: string) {
    const users = await DbUtil.users;
    const numAccountsWithToken = await users.countDocuments({ auth: token });
    if (numAccountsWithToken > 1) {
      console.error("CRITICAL BUG: USER DATA CLASH");
    }
    return numAccountsWithToken === 1;
  },

  async createUser(handle: string, email: string, password: string) {
    const users = await DbUtil.users;
    console.log("Creating user " + handle);
    users.insertOne({
      handle: handle,
      email: email,
      auth: utils.hash(email, password),
    });
  },
};

export { DbUtil as default };
