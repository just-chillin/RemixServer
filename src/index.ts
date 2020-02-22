import Express, { json, raw, urlencoded } from "express";
import { UNAUTHORIZED, OK, INTERNAL_SERVER_ERROR, BAD_REQUEST, NOT_FOUND } from "http-status-codes";
import getPort from "get-port";
import bodyParser from "body-parser";
import VideoService from "./VideoService";
import Db from "./data/MongoService";
import multer from "multer";
import { validate as validate_email, validate } from "email-validator";
import utils from "./utils";

const api = Express();
const port = process.env.PORT || 8081;

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

api.use((req, _, next) => {
  console.log("\nIncoming request:", req.url);
  next();
});

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

api.get("/video/new", (req, res) => {
  console.debug(req.query);
  Db.getNewVideos(new Date(req.query.Time * 1000), Number(req.query.Page))
    .then(videos => res.send(JSON.stringify(videos)))
    .catch(reason => {
      res.status(INTERNAL_SERVER_ERROR);
      res.send(reason);
    });
});

api.post("/video", upload.single("Video"), (req, res) => {
  if (!req.headers.authorization || !req.file) {
    res.sendStatus(BAD_REQUEST);
    return;
  }

  console.log(`Attempting to upload video with name: ${req.query.Name} and description: ${req.query.Description}.`);
  try {
    VideoService.uploadVideo(req.file.buffer, req.headers.authorization, req.query.Name, req.query.Description);
    res.sendStatus(OK);
  } catch {
    res.sendStatus(INTERNAL_SERVER_ERROR);
  }
});

api.post("/registerbeta", urlencoded({ extended: true }), (req, res) => {
  const email: string | undefined = req.body.email;
  if (!email || !validate_email(email)) {
    res.sendStatus(BAD_REQUEST);
    return;
  }
  Db.betaRegister(email)
    .then(() => {
      console.log(`Sucessfully registered ${email} for the beta!`);
      res.sendStatus(OK);
    })
    .catch(() => res.sendStatus(INTERNAL_SERVER_ERROR));
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
  startServer(Number(port))
    .then(v => console.log(`App listening on port ${v.port}!`))
    .catch(console.error);
}
export { startServer as default };
