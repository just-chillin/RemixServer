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
  uploadVideo(video: S3.Body, ownerAuthToken: string, name: string, description: string) {
    ownerAuthToken = ownerAuthToken.replace("Basic ", "");
    S3Service.uploadVideo(video)
      .then(upload => MongoService.createVideoMetadata(ownerAuthToken, name, description, upload.Location, upload.Key))
      .catch(console.error);
  },
};

export { VideoService as default };
