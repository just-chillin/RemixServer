import { RequestLogger, NotFoundHandler } from "./routes/middleware";
import IndexRoute from "./routes/index";
import UserRoute from "./routes/user";
import Video from "./routes/video";
import Express = require('express');

const App = Express()
  .use(RequestLogger)
  .use("/", IndexRoute)
  .use("/user", UserRoute)
  .use("/video", Video)
  .use(NotFoundHandler);

function startServer(port: number) {
  console.log(`Starting server on port ${port}`);
  App.listen(port);
}

export { startServer };
