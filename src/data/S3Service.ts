import AWS from "aws-sdk";
import uuid from "uuid";

const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
});

export default {
  uploadVideo(video: BinaryType) {
    const key = uuid();
    const uploadManger = s3.upload({Bucket: 'remix', Body: video, Key: key});
    uploadManger.send();
    return {
      key: key,
      uploadManager: uploadManger
    }
  }
}