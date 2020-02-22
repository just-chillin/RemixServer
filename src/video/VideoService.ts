import S3Service from "../database/S3Service";
import MongoService from "../database/MongoService";
import ffmpeg from "fluent-ffmpeg";
import stream from "stream";
import { S3 } from "aws-sdk";

/**
 * TODO Get transactions working
 * @param video
 * @param ownerAuthToken
 * @param name
 * @param description
 */
async function uploadVideo(video: S3.Body, ownerAuthToken: string, name: string, description: string) {
  ownerAuthToken = ownerAuthToken.replace("Basic ", "");
  const upload = await S3Service.uploadVideo(video);
  MongoService.createVideoMetadata(ownerAuthToken, name, description, upload.Location, upload.Key);
}

export default { uploadVideo };
