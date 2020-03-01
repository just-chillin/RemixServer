import { AccessToken, AuthorizationScope } from './auth/AuthTypes';
import { IdentityProvider } from './auth/IdentityProvider';
import { probe } from '../video/FFprobeService';
import S3Service from '../database/S3Service';
import MongoService from '../database/MongoService';
import { OK, INTERNAL_SERVER_ERROR, UNAUTHORIZED, UNSUPPORTED_MEDIA_TYPE } from "http-status-codes";
import fs = require('fs');


class Video {
    
    constructor(private readonly name: string, private readonly description: string) {
    }

    /**
     * Inserts the video into the database.
     * @param access The user's authorization token.
     */
    async upload(access: AccessToken, path: string) {
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