import Express, { json, raw } from "express";
import { UNAUTHORIZED, OK, INTERNAL_SERVER_ERROR, BAD_REQUEST, NOT_FOUND } from "http-status-codes";
import getPort from "get-port";
import bodyParser from "body-parser";
import VideoService from "./data/VideoService";
import Db from "./data/MongoService";
import multer from "multer";

const api = Express();
const port = 8080;

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

api.use((req, _, next) => {
  console.log("\nIncoming request:", req.url);
  next();
});

api.get("/", (_, res) => res.send("Hello World!"));

/**
 * /user. Confirms an authentication token.
 */
api.get("/user", (req, res) => {
  const auth = req.headers.authorization;
  if (!auth) {
    throw new Error("Auth not defined!");
  }
  Db.userExists(auth).then(exists => res.sendStatus(exists ? OK : UNAUTHORIZED));
});

api.post("/user", json(), (req, res) => {
  console.log("creating user");
  Db.createUser(req.body.handle, req.body.email, req.body.password).then(result => {
    if (result.insertedCount > 0) {
      res.sendStatus(OK);
    } else {
      console.log(`Failed to create user ${req.body.handle}!`);
      res.sendStatus(INTERNAL_SERVER_ERROR);
    }
  });
});

api.get("/video", (req, res) => {
  Db.getNewVideos().then(res.send);
});

api.post("/video", upload.single("video"), (req, res) => {
  if (!req.headers.authorization || !req.file) {
    res.sendStatus(BAD_REQUEST);
    return;
  }

  console.log(`Attempting to upload video with name: ${req.query.Name} and description: ${req.query.Description}.`);
  VideoService.uploadVideo(req.file.buffer, req.headers.authorization, req.query.Name, req.query.Description)
    .then(() => res.sendStatus(OK))
    .catch(err => {
      console.trace(err);
      res.sendStatus(INTERNAL_SERVER_ERROR);
    });
});

api.use((req, res, next) => {
  res.status(NOT_FOUND).send("Couldn't find route!");
  console.error(`Request at endpoint ${req.url} failed with 404!`);
  next();
});

async function startServer(port?: number) {
  if (!port) {
    port = await getPort();
  }
  if (module.parent) console.debug(`Starting server on port ${port}`);
  const server = api.listen(port);
  const uri = `localhost:${port}/`;
  return {
    port: port,
    server: server,
    uri: uri,
    endpoint: (name: string) => uri + name,
  };
}

// Starts the server if this module is ran standalone.
if (!module.parent) {
  startServer(port)
    .then(v => console.log(`App listening on port ${v.port}!`))
    .catch(console.error);
}

export { startServer as default };
