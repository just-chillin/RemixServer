import { Router } from "express";
import { OK, INTERNAL_SERVER_ERROR, BAD_REQUEST } from "http-status-codes";
import MongoService from "../database/MongoService";
import VideoService from "../video/VideoService";
import multer from "multer";
import fs from "fs";

const Video = Router();

const storage = multer.diskStorage({});
const upload = multer({
  storage: storage,
});

Video.get("/video/new", (req, res) => {
  console.debug(req.query);
  MongoService.getNewVideos(new Date(req.query.Time * 1000), Number(req.query.Page))
    .then(videos => res.send(JSON.stringify(videos)))
    .catch(reason => {
      res.status(INTERNAL_SERVER_ERROR);
      res.send(reason);
    });
});

Video.post("/video", upload.single("Video"), (req, res) => {
  if (!req.headers.authorization || !req.file) {
    res.sendStatus(BAD_REQUEST);
    return;
  }

  console.log(`Attempting to upload video with name: ${req.query.Name} and description: ${req.query.Description}.`);
  VideoService.uploadVideo(
    fs.createReadStream(req.file.path),
    req.headers.authorization,
    req.query.Name,
    req.query.Description
  )
    .then(() => {
      res.sendStatus(OK);
    })
    .catch(err => {
      console.trace(err);
      res.sendStatus(INTERNAL_SERVER_ERROR);
    });
});

export default Video;
