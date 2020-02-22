import Express from "express";
import { RequestLogger, NotFoundHandler } from "./middleware";

function startServer(port: number) {
  console.log(`Starting server on port ${port}`);
  Express()
    .use(RequestLogger, NotFoundHandler)
    .listen(port);
}

export { startServer };
