/**
 * @author Corrina Sivak
 * @description A service built to abstract the use of FFMpeg
 */

import env from "env-var";
import child_process from "child_process";
import os from "os";
import uuid from "uuid";
import fs from "fs";
import path from "path";

const FFMPEG_PATH = "/Users/sivak/Documents/projects/RemixServer/.ignored/ffmpeg"; //env.get('FFMPEG_PATH').required().asString();

function convert_video(video_path: string) {
  const output_filename = uuid() + ".mp4";
  return new Promise((resolve, reject) => {
    child_process
      .spawn(FFMPEG_PATH, ["-loglevel fatal", `-i ${video_path}`, output_filename], {
        windowsHide: true,
      })
      .on("exit", () => {
        //resolve(fs.createReadStream(path.join(os.tmpdir(), output_filename)));
        resolve(path.join(os.tmpdir(), output_filename));
      })
      .on("error", err => {
        reject(err);
      });
  });
}

convert_video("~/Downloads/Snapchat-523608777(1).mp4")
  .then(console.log)
  .catch(console.trace);
