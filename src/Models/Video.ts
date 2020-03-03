import { AccessToken, AuthorizationScope } from './auth/AuthTypes';
import { IdentityProvider } from './auth/IdentityProvider';
import { probe } from '../video/FFprobeService';
import S3Service from '../database/S3Service';
import MongoService from '../database/DeprecatedMongoService';
import {getCollection, Model, SchemaOf} from './db/MongoUtils';
import { OK, INTERNAL_SERVER_ERROR, UNAUTHORIZED, UNSUPPORTED_MEDIA_TYPE } from "http-status-codes";
import fs = require('fs');
import {User}  from './User'
import { ObjectId } from 'mongodb';

export const VideoCollection = getCollection<Video>("video");
type VideoModel = {
    title: string,
    key?: string,
    owner: SchemaOf<User>;
}

class Video extends Model<VideoModel> {
    _id?: ObjectId;
    
    constructor(private readonly name: string, private readonly description: string) {
        super();
    }


    /**
     * Inserts the video into the database.
     * @param access The user's authorization token.
     */
    static async upload(access: AccessToken, path: string): Promise<Video> {
        const authorized = await IdentityProvider.is_authorized(AuthorizationScope.UPLOAD_VIDEO, access);
        if (!authorized) return UNAUTHORIZED;

        const valid_video = 'format' in await probe(path);
        if (!valid_video) return UNSUPPORTED_MEDIA_TYPE;

        try {
            const rs = fs.createReadStream(path);
            const upload = await S3Service.uploadVideo(rs);
            await MongoService.createVideoMetadata(access.token, this.description, this.description, upload.Location, upload.Key);
            return OK;
        } catch (error) {
            console.error(error);
            return INTERNAL_SERVER_ERROR;
        }
    }
}