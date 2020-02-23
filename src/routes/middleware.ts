import { NOT_FOUND } from "http-status-codes";
import { RequestHandler } from "express";

/**
 * Returns a 404 error
 */
const NotFoundHandler: RequestHandler = (req, res, next) => {
  res.status(NOT_FOUND).send("Couldn't find route!");
  console.error(`Request at endpoint ${req.url} failed with 404!`);
  next();
};

/**
 * Logs any request that comes after this middleware.
 */
const RequestLogger: RequestHandler = (req, _, next) => {
  console.log("\nIncoming request:", req.url);
  next();
};

export { NotFoundHandler, RequestLogger };
