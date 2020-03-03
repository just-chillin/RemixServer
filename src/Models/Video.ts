import { AccessToken, AuthorizationScope } from "./auth/AuthTypes";
import { IdentityProvider } from "./auth/IdentityProvider";
import { probe } from "../video/FFprobeService";
import S3Service from "../database/S3Service";
import MongoService from "../database/DeprecatedMongoService";
import { getCollection, Model, ForeignKey } from "./db/MongoUtils";
import { OK, INTERNAL_SERVER_ERROR, UNAUTHORIZED, UNSUPPORTED_MEDIA_TYPE } from "http-status-codes";
import fs = require("fs");
import { User } from "./User";
import { ObjectId } from "mongodb";

export const videoCollection = getCollection<Video>("video");

enum RequiredAuthorizations {}

export class Video extends Model {
  _id?: ObjectId;
  title?: string; // Required
  key?: string; // Required
  owner?: ForeignKey<User>;

  private constructor(title: string) {
    super();
    this.title = title;
  }

  async insert() {
    if (!this.title || !this.key || !this.owner) throw new Error("Required fields on document not filled.");
    const insertResult = await videoCollection.insertOne(this);
    this._id = insertResult.insertedId;
  }

  /**
   * Inserts the video into the database.
   * @param access The user's authorization token.
   */
  static async upload(title: string, access: AccessToken, path: string): Promise<{ status: number; video?: Video }> {
    const video = new Video(title);
    const token_identity = await IdentityProvider.get_identity(AuthorizationScope.UPLOAD_VIDEO, access);
    if (!token_identity) return { status: UNAUTHORIZED };
    const authorized =
      token_identity.authorizations.includes(AuthorizationScope.UPLOAD_VIDEO) ||
      token_identity.authorizations.includes(AuthorizationScope.ALL);
    if (!authorized) return { status: UNAUTHORIZED };
    video.owner = token_identity.owner_id;

    const valid_video = "format" in (await probe(path));
    if (!valid_video) return { status: UNSUPPORTED_MEDIA_TYPE };

    const rs = fs.createReadStream(path);
    const upload = await S3Service.uploadVideo(rs);
    video.key = upload.Key;
    video.insert();
    return { status: OK, video: video };
  }
}
