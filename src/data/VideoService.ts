import S3Service from "./S3Service";
import MongoService from "./MongoService";
import { S3 } from "aws-sdk";

const VideoService = {
  /**
   * TODO Get transactions working
   * @param video
   * @param ownerAuthToken
   * @param name
   * @param description
   */
  async uploadVideo(video: S3.Body, ownerAuthToken: string, name: string, description: string) {
    ownerAuthToken = ownerAuthToken.replace("Basic ", "");
    const { key, uploadManager, url } = S3Service.uploadVideo(video);
    MongoService.createVideoMetadata(ownerAuthToken, name, description, url, key).catch(console.trace);
  },
};

export { VideoService as default };
