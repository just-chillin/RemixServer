import Express from "express";
import Db from "./db";
import { UNAUTHORIZED, OK } from "http-status-codes";
import getPort from "get-port";

const api = Express();
const port = 8080;

api.get("/", (_, res) => res.send("Hello World!"));

/**
 * /user. Confirms an authentication token.
 */
api.get("/user", (req, res) => {
  const auth = req.headers.authorization;
  if (auth === undefined || !Db.userExists(auth)) {
    res.status(UNAUTHORIZED).send();
  } else {
    res.status(OK).send();
  }
});

async function startServer(port?: number) {
  if (!port) {
    port = await getPort();
  }
  console.debug(`Starting server on port ${port}`);
  const server = api.listen(port);
  return {
    port: port,
    server: server
  };
}

// Starts the server if this module is ran standalone.
if (!module.parent) {
  startServer(port)
    .then(v => console.log(`App listening on port ${v.port}!`))
    .catch(console.error);
}

export { startServer as default };
