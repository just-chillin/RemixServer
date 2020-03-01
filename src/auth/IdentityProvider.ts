import MongoService from "../database/MongoService";
import btoa = require("btoa");
import crypto = require("crypto");
import { ObjectId } from "mongodb";
enum AuthorizationScope {
  ALL = "all",
}

export type RefreshToken = {
  token: string;
  issued_on: number;
  expires_on: number;
};
export type AccessToken = {
  token: string;
  issued_on: number;
  expires_on: number;
};
export type Identity = {
  owner_id: ObjectId;
  refresh_token: RefreshToken;
  access_token: AccessToken;
  authorizations: AuthorizationScope[];
};
type HashFunc = () => string;

const REFRESH_GRANT_LENGTH = 2629743 * 6;

interface IdentityProvider {
  readonly hash_func: () => string;
  readonly refresh_length: number;
  readonly access_length: number;
  auth_request(scopes: AuthorizationScope[], ...other: any): Promise<Identity>;
  auth_grant(refresh: RefreshToken["token"]): Promise<AccessToken>;
  check_authorization(token: AccessToken): Promise<AuthorizationScope[]>;
}

export function referenceHashFunc() {
  return crypto.randomBytes(256);
}

// Recommended access length: 86400
// Recommended refresh_length: 2629743 (1 month) * 6
export class PasswordIdentityProvider implements IdentityProvider {
  access_token() {
    const now = Date.now();
    return {
      token: this.hash_func(),
      issued_on: now,
      expires_on: now + this.access_length,
    };
  }

  constructor(readonly hash_func: () => string, readonly refresh_length: number, readonly access_length: number) {}

  async auth_request(scopes: AuthorizationScope[], username: string, password: string) {
    const requester = await MongoService.findUser(username, password);
    if (!requester) {
      throw new Error("Authentication Request Rejected.");
    }

    const now = Date.now();
    const identity: Identity = {
      owner_id: requester._id,
      refresh_token: {
        token: this.hash_func(),
        issued_on: now,
        expires_on: -1, // Never expires
      },
      access_token: this.access_token(),
      authorizations: scopes,
    };
    await MongoService.doTransaction(async () => {
      const identities = await MongoService.identities;
      await identities.insertOne(identity);
      await identities.deleteMany(
        identities
          .find({ owner_id: requester._id })
          .sort({ _id: -1 })
          .skip(2)
      );
    });
    return identity;
  }

  async auth_grant(refresh: RefreshToken["token"]) {
    const new_token = this.access_token();
    const ids = await MongoService.identities;
    ids.updateOne({ "refresh_token.token": refresh }, { refresh_token: new_token });
    return new_token;
  }

  async check_authorization(token: AccessToken) {
    const ids = await MongoService.identities;
    const res = await ids.findOne({ access_token: token });
    return res ? res.authorizations : [];
  }
}
