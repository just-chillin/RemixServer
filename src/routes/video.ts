import { Router } from "express";
import { OK, INTERNAL_SERVER_ERROR, BAD_REQUEST, UNAUTHORIZED, UNSUPPORTED_MEDIA_TYPE } from "http-status-codes";
import MongoService from "../database/MongoService";
import { uploadVideo } from "../video/VideoService";
import multer = require("multer");
import { probe } from "../video/FFprobeService";
import fs = require('fs');

const VideoRoute = Router();

const storage = multer.diskStorage({});
const upload = multer({
  storage: storage,
});

/**
 * Gets a list of new videos.
 * body:
 *  Time, Page
 */
VideoRoute.get("/new", (req, res) => {
  console.debug(req.query);
  MongoService.getNewVideos(new Date(req.query.Time * 1000), Number(req.query.Page))
    .then(videos => res.send(JSON.stringify(videos)))
    .catch(reason => {
      res.status(INTERNAL_SERVER_ERROR);
      res.send(reason);
    });
});

/**
 * Uploads a video
 * headers:
 *  authorization
 * body:
 *  video (form-encoded)
 *  query-params:
 *    Name, Description
 */
VideoRoute.post("/", upload.single("Video"), async (req, res) => {
  if (!req.headers.authorization) {
    res.sendStatus(UNAUTHORIZED);
    return;
  } else if (req.file.mimetype !== 'video/mp4' || 'error' in (await probe(req.file.path))) {
    res.sendStatus(UNSUPPORTED_MEDIA_TYPE);
    return;
  }

  console.log(`Attempting to upload video with name: ${req.query.Name} and description: ${req.query.Description}.`);
  uploadVideo(fs.createReadStream(req.file.path), req.headers.authorization, req.query.Name, req.query.Description)
    .then(() => {
      res.sendStatus(OK);
    })
    .catch(err => {
      console.trace(err);
      res.sendStatus(INTERNAL_SERVER_ERROR);
    });
});

export default VideoRoute;
