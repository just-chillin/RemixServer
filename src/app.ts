import { startServer } from "./router";
import getPort = require("get-port");

const port = getPort({ port: Number(process.env.PORT) || 8081 })
  .then(startServer)
  .catch(console.error);
