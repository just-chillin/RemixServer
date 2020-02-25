import { startServer } from "./router";
import getPort from "get-port";

const port = await getPort({ port: Number(process.env.PORT) || 8081 });
startServer(port);
