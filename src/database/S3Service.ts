import AWS, { S3 } from "aws-sdk";
import uuid from "uuid";

const s3 = new AWS.S3({
  accessKeyId: process.env.AWSAccessKeyId,
  secretAccessKey: process.env.AWSSecretKey,
});

const S3Service = {
  /**
   * Uploads a video to S3
   * @param video The raw binary video to upload
   */
  uploadVideo(video: S3.Body) {
    const uploadManger = s3.upload({
      Bucket: "remixvideo",
      Body: video,
      Key: uuid() + ".mp4",
      ACL: "public-read",
    });
    uploadManger.send();
    return uploadManger.promise();
  },
};

export { S3Service as default };
