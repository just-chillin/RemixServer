import S3Service from "./S3Service";
import MongoService from "./MongoService";

export default {
  /**
   * TODO Get transactions working
   * @param video 
   * @param ownerAuthToken 
   * @param name 
   * @param description 
   */
  async uploadVideo(video: BinaryType, ownerAuthToken: string, name: string, description: string) {
    MongoService.createVideoMetadata(ownerAuthToken, name, description);
    const {key, uploadManager} = S3Service.uploadVideo(video);
    return key;
  }
}