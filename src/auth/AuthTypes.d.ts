import { ObjectId } from 'mongodb';

declare enum AuthorizationScope {
    ALL = "all",
    UPLOAD_VIDEO = "upload_video",
  }
declare type Token = {
    token: string;
    issued_on: number;
    expires_on?: number;
  };
declare type RefreshToken = Token;
declare type AccessToken = Token;
declare type Identity = {
    owner_id: ObjectId;
    refresh_token: RefreshToken;
    access_token: AccessToken;
    authorizations: AuthorizationScope[];
  };