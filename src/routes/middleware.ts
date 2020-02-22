import { NOT_FOUND } from "http-status-codes";
import { RequestHandler } from "express";

const NotFoundHandler: RequestHandler = (req, res, next) => {
  res.status(NOT_FOUND).send("Couldn't find route!");
  console.error(`Request at endpoint ${req.url} failed with 404!`);
  next();
};

const RequestLogger: RequestHandler = (req, _, next) => {
  console.log("\nIncoming request:", req.url);
  next();
};

export { NotFoundHandler, RequestLogger };
