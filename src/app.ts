import { startServer } from "./routes/router";
import getPort from "get-port";

getPort({ port: Number(process.env.PORT) || 8081 })
  .then(startServer)
  .catch(console.trace);
