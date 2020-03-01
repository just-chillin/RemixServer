import crypto = require("crypto");
import MongoService from "../database/MongoService";
import {AuthorizationScope, Token, RefreshToken, AccessToken, Identity} from "./AuthTypes";

function referenceHashFunc() {
  return crypto.randomBytes(256).toString("base64");
}

export abstract class IdentityProvider {
  constructor(
    protected readonly hash_func = referenceHashFunc,
    protected readonly refresh_length = -1,
    protected readonly access_length = 86400000
  ) {}

  protected make_token(expiry: number): Token {
    const now = Date.now();
    return {
      token: this.hash_func(),
      issued_on: now,
      expires_on: expiry > 0 ? undefined : now + expiry,
    };
  }

  public abstract async auth_request(scopes: AuthorizationScope[], ...other: any): Promise<Identity>;

  public async auth_grant(refresh: RefreshToken) {
    const new_token = this.make_token(this.access_length);
    const ids = await MongoService.identities;
    ids.updateOne({ refresh_token: refresh }, { refresh_token: new_token });
    return new_token;
  }

  public async check_authorization(token: AccessToken) {
    const ids = await MongoService.identities;
    const res = await ids.findOne({ access_token: token });
    return res ? res.authorizations : [];
  }
}

// Recommended access length: 86400
// Recommended refresh_length: 2629743 (1 month) * 6
