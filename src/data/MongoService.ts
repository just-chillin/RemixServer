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
  likes: number;
  comments: Comment;
}

interface User {
  _id: ObjectId;
  handle: string;
  email: string;
  auth: string;
  followers: ObjectId[];
  following: ObjectId[];
  videos: ObjectId[];
}

interface Comment {
  _id: ObjectId; //This is the user identifier
  comment: string;
  likes: number;
  timestamp: Date;
}

interface BetaRegistration {
  _id: ObjectId;
  email: string;
}

function getCollection<T>(name: string) {
  return Promise.resolve(db.then(db => db.collection<T>(name)));
}

const MongoService = {
  users: getCollection<User>("users"),
  videos: getCollection<Video>("videos"),
  beta_registrations: getCollection<BetaRegistration>("beta_registrations"),

  async betaRegister(email: string) {
    const beta_registrations = await this.beta_registrations;
    return await beta_registrations.insertOne({ email: email });
  },

  /**
   * TODO IMPLEMENT PAGINATION
   *  Purpose of newest videos for the feed
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
      s3_url: url, //TODO get s3 URL
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

  /**
   * Add new followers to User's followers
   */
  async addAFollower(userId: ObjectId, auth: string) {
    const users = await MongoService.users;
    try {
      const userFollower = await users.findOne({
        auth: auth,
      });
      const userProfile = await users.findOne({
        _id: userId,
      });
      return true;
    } catch {
      console.log("Couldn't Add Follower in List");
      return false;
    }
    //return true or false
  },

  /**
   * Remove a follower
   */
  async removeFollower(userId: ObjectId, auth: string) {
    const users = await MongoService.users;
    try {
      const userFollower = await users.findOne({
        auth: auth,
      });
      const userProfile = await users.findOne({
        _id: userId,
      });
      return true;
    } catch {
      console.log("Couldn't Add Follower in List");
      return false;
    }
  },

  /**
   * Access followers
   */
  async seeFollowers(auth: string) {
    const users = await MongoService.users;
    const user = users.findOne({
      auth: auth,
    });
    const followers = (await user).followers;
    return followers;
  },

  /**
   * Add new followings to User's followings
   */
  async addAFollowing(userId: ObjectId, auth: string) {
    const users = await MongoService.users;
    try {
      const userFollowing = await users.findOne({
        auth: auth,
      });
      const userProfile = await users.findOne({
        _id: userId,
      });
      return true;
    } catch {
      console.log("Couldn't Add Following in List");
      return false;
    }
  },

  /**
   * Remove a follower
   */
  async removeFollowing(userId: ObjectId, auth: string) {
    const users = await MongoService.users;
    try {
      const userFollower = await users.findOne({
        auth: auth,
      });
      const userProfile = await users.findOne({
        _id: userId,
      });
      return true;
    } catch {
      console.log("Couldn't Add Follower in List");
      return false;
    }
  },
  /**
   * Access followings
   */
  async seeFollowing(auth: string) {
    const users = await MongoService.users;
    const user = users.findOne({
      auth: auth,
    });
    const followings = (await user).following;
    return followings;
  },

  /**
   * Like new video
   */
  async likeAVideo(_id: ObjectId) {},

  /**
   * Unlike Video
   */
  async unlikeAVideo(_id: ObjectId) {},

  /**
   * Comment on video
   */
  async commentOnVideo(_id: ObjectId) {},

  async likeCommentOnVideo(_id: ObjectId) {},

  async unlikeCommentOnVideo(_id: ObjectId) {},
};

export default MongoService;
