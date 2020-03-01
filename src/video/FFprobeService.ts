/**
 * @author Corrina Sivak
 * @description A service built to abstract the use of FFProbe
 */

import env = require("env-var");
import child_process = require("child_process");

const FFPROBE_PATH = env
  .get("FFPROBE_PATH")
  .default("ffprobe")
  .asString();

type FFProbeError = {
  error: {
    code: number,
    string: string
  }
}

type FFProbeFormat = {
  format: {
    nb_streams: number,
    nb_programs: number,
    format_name: string,
    format_long_name: string,
    duration: string,
    size: string,
    bit_rate: string,
    probe_score: number,
    tags: {
      major_brand: string,
      minor_version: string,
      compatible_brands: string,
      encoder: string
    }
  }
}



/**
 * Returns the json-formatted probe result of ffprobing a video.
 * @param video_path The path of the video to probe.
 */
export async function probe(video_path: string) {
  let data = "";
  const ffprobe_process = child_process.spawn(FFPROBE_PATH || "ffprobe", [
    "-i",
    video_path,
    "-show_format",
    "-show_error",
    "-print_format",
    "json=c=0",
  ]);
  ffprobe_process.stdout.on("data", newdata => (data += newdata));
  return await new Promise<FFProbeError | FFProbeFormat>(resolve => ffprobe_process.on("close", () => resolve(JSON.parse(data))));
}
