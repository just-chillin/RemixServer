import { startServer } from "./router";
import getPort = require("get-port");

async function main() {
  const port = await getPort({ port: Number(process.env.PORT) || 8081 });
  startServer(port);
}

main().catch(console.error);