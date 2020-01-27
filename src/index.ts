import Express from "express";
import { UNAUTHORIZED, OK, INTERNAL_SERVER_ERROR, BAD_REQUEST } from "http-status-codes";
import getPort from "get-port";
import bodyParser from "body-parser";
import VideoService from "./data/VideoService";
import Db from "./data/MongoService";

const parser = bodyParser.json();
const api = Express();
const port = 8080;

api.use((req, _, next) => {
  console.log("\nIncoming request:", req.url);
  next();
});

api.get("/", (_, res) => res.send("Hello World!"));

/**
 * /user. Confirms an authentication token.
 */
api.get("/user", function(req, res) {
  const auth = req.headers.authorization;
  if (!auth) {
    throw new Error("Auth not defined!");
  }
  Db.userExists(auth).then(exists => res.sendStatus(exists ? OK : UNAUTHORIZED));
});

api.post("/user", parser, function(req, res) {
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

api.get("/video", function(req, res) {
  Db.getNewVideos().then(res.send);
});

api.post("/video", parser, function(req, res) {
  if (!req.headers.authorization) {
    res.sendStatus(BAD_REQUEST);
    return;
  }
  VideoService.uploadVideo(req.body, req.headers.authorization, req.body.name, req.body.description);
  res.sendStatus(OK);
});

api.use(function(req, res, next) {
  res.status(404).send("Couldn't find route!");
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
