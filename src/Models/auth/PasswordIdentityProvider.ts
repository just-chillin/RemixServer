import MongoService from "../../database/MongoService";
import { IdentityProvider } from "./IdentityProvider";
import { AuthorizationScope, Identity } from "./AuthTypes";

export class PasswordIdentityProvider extends IdentityProvider {
  constructor() {
    super();
  }

  async auth_request(scopes: AuthorizationScope[], username: string, password: string) {
    const requester = await MongoService.findUser(username, password);
    if (!requester) {
      throw new Error("Authentication Request Rejected.");
    }
    const identity: Identity = {
      owner_id: requester._id,
      refresh_token: this.make_token(this.refresh_length),
      access_token: this.make_token(this.access_length),
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
}

/**
 * An identity provider that takes username and password credentials for the refresh token.
 * Gives a refresh length of 6 months, and an access length of 1 month.
 */
export const passwordProviderImpl = new PasswordIdentityProvider();
