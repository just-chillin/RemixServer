import S3Service from "../database/S3Service";
import MongoService from "../database/MongoService";
import { S3 } from "aws-sdk";

/**
 * Uploads a video to Remix.
 * @param video The binary video file
 * @param ownerAuthToken The auth token of the owner.
 * @param name The video's name
 * @param description The video's description
 */
async function uploadVideo(video: S3.Body, ownerAuthToken: string, name: string, description: string) {
  ownerAuthToken = ownerAuthToken.replace("Basic ", "");
  const upload = await S3Service.uploadVideo(video);
  MongoService.createVideoMetadata(ownerAuthToken, name, description, upload.Location, upload.Key);
}

export default { uploadVideo };
