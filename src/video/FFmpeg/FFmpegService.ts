/**
 * @author Corrina Sivak
 * @description A service built to abstract the use of FFmpeg
 */

import env = require("env-var");
import child_process = require("child_process");
import os = require("os");
import uuid = require("uuid");
import fs = require("fs");
import stream = require("stream");
import path = require("path");

const FFMPEG_PATH = env
  .get("FFMPEG_PATH")
  .required()
  .asString();

/**
 * Converts a video using ffmpeg to a universally readable format, and compresses the bitrate.
 * @param video_path The path to the uploaded video to be converted.
 * @returns A promise of the video's read stream.
 * This read stream automatically deletes both the original and the converted file once it's done being read.
 */
function convert_video(video_path: string) {
  const output_path = path.join(os.tmpdir(), uuid() + ".mp4");
  if (process.env.NODE_ENV === "development") {
    console.log(`outputting ${video_path} to ${output_path}`);
  }
  return new Promise<stream.Readable>((resolve, reject) => {
    const cp = child_process
      .spawn(FFMPEG_PATH, ["-i", video_path, output_path], {
        windowsHide: true,
      })
      .on("close", status => {
        if (status === 0) {
          const read_stream = fs.createReadStream(output_path).on("close", () => {
            fs.unlinkSync(output_path);
            if (process.env.NODE_ENV === "production") {
              // In dev we want to save the original file so that we can retest.
              fs.unlinkSync(video_path);
            }
          });
          resolve(read_stream);
        } else {
          reject(new Error(`FFmpeg process failed with exit code ${status}. The input video probably doesn't exist.`));
        }
      })
      .on("error", err => {
        reject(new Error(err.message));
      });
    if (process.env.NODE_ENV === "development") {
      cp.stderr.pipe(process.stderr);
    }
  });
}
