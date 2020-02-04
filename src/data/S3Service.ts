import AWS, { S3 } from "aws-sdk";
import uuid from "uuid";

const s3 = new AWS.S3({
  accessKeyId: process.env.AWSAccessKeyId,
  secretAccessKey: process.env.AWSSecretKey,
});

const videoBucket = "remixvideo";

const getVideoUrl = (bucketName: string, key: string) => new URL(`https://${bucketName}.s3.amazonaws.com/${key}`);

const S3Service = {
  uploadVideo(video: S3.Body) {
    if (!video) throw new Error("Video cannot be null");
    console.log(`accessKeyId: ${process.env.AWSAccessKeyId}\nsecretAccessKey: ${process.env.AWSSecretKey}`);
    const key = uuid() + ".mp4";
    const uploadManger = s3.upload({ Bucket: videoBucket, Body: video, Key: key });
    uploadManger.send();
    return {
      key: key,
      uploadManager: uploadManger,
      url: getVideoUrl(videoBucket, key),
    };
  },
};

export { S3Service as default };
