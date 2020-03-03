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

class UploadError extends Error {
  constructor(readonly http_error_code: number) {
    super("Upload Failed");
  }
}

export class Video extends Model {
  _id?: ObjectId;
  title?: string;
  key?: string;
  owner?: ForeignKey<User>;

  constructor(title: string) {
    super();
    this.title = title;
  }

  async insert() {
    const insertResult = await videoCollection.insertOne(this);
    this._id = insertResult.insertedId;
  }

  /**
   * Inserts the video into the database.
   * @param access The user's authorization token.
   */
  async upload_new(access: AccessToken, path: string): Promise<number> {
    const token_identity = await IdentityProvider.get_identity(AuthorizationScope.UPLOAD_VIDEO, access);
    if (!token_identity) return UNAUTHORIZED;
    const authorized =
      token_identity.authorizations.includes(AuthorizationScope.UPLOAD_VIDEO) ||
      token_identity.authorizations.includes(AuthorizationScope.ALL);
    if (!authorized) return UNAUTHORIZED;
    this.owner = token_identity.owner_id;

    const valid_video = "format" in (await probe(path));
    if (!valid_video) return UNSUPPORTED_MEDIA_TYPE;


    try {
      const rs = fs.createReadStream(path);
      const upload = await S3Service.uploadVideo(rs);
      this.key = upload.Key;
      this.insert();
      return OK;
    } catch (error) {
      console.error(error);
      return INTERNAL_SERVER_ERROR;
    }
  }
}
