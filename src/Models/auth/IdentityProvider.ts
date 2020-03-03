import crypto = require("crypto");
import MongoService from "../../database/DeprecatedMongoService";
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

  public static async check_authorization(required_scope: AuthorizationScope, token?: AccessToken) {
    if (!token) return []; // The token is null, so just immediately return false.
    const ids = await MongoService.identities;
    const res = await ids.findOne({ access_token: token });
    if (!res || !res.authorizations) return []; // The authorization record does not exist.
    return res.authorizations;

  }

  public static async is_authorized(required_scope: AuthorizationScope, token?: AccessToken) {
    const authorized_scopes = await this.check_authorization(required_scope, token);
    if (authorized_scopes.includes(AuthorizationScope.ALL)) return true; // The token is authorized to do anything.
    else return authorized_scopes.includes(required_scope); // Check if the token is authorized to do the requested operation.
  }
}

// Recommended access length: 86400
// Recommended refresh_length: 2629743 (1 month) * 6
