import S3Service from "../database/S3Service";
import MongoService from "../database/MongoService";
import { S3, FSx } from "aws-sdk";
import ffmpeg from "fluent-ffmpeg";
import stream from "stream";
import child_process from "child_process";
import fs from "fs";

const DESIRED_VIDEO_SIZE_IN_KBIT = 80000; // 2mb
const MAX_VIDEO_LENGTH_IN_SECONDS = 30;

function xformer(readable: stream.Readable) {
  let count = 0;

  return new stream.Transform({
    objectMode: true,
    transform: (data, _, done) => {
      done(null, { ...data, index: count++ });
    },
  });
}

/**
 * Validates and transforms a video stream into an mp4.
 * @param video A transform stream representing a video
 * @returns If the conversion was sucessful.
 */
function convertVideo(video: stream.Readable) {
  const transformed = xformer(video);
  ffmpeg(video)
    .withVideoCodec("libx265")
    .withVideoBitrate(DESIRED_VIDEO_SIZE_IN_KBIT / video.readableLength)
    .on("error", err => {
      throw err;
    })
    .stream(transformed);
  return transformed;
}

/**
 * TODO Get transactions working
 * @param video
 * @param ownerAuthToken
 * @param name
 * @param description
 */
async function uploadVideo(video: stream.Readable, ownerAuthToken: string, name: string, description: string) {
  ownerAuthToken = ownerAuthToken.replace("Basic ", "");
  const videoOutStream = convertVideo(video);
  const upload = await S3Service.uploadVideo(videoOutStream);
  MongoService.createVideoMetadata(ownerAuthToken, name, description, upload.Location, upload.Key);
}

export { uploadVideo, convertVideo };
