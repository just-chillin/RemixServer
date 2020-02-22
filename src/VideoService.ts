import S3Service from "./data/S3Service";
import MongoService from "./data/MongoService";
import { S3 } from "aws-sdk";
import ffmpeg from "fluent-ffmpeg";
import stream from "stream";

const VideoService = {
  isValid(video: stream.Readable) {
    return new Promise(resolve => {
      ffmpeg(video)
        .on("end", () => resolve(true))
        .on("error", () => resolve(false))
        .run();
    });
  },

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
