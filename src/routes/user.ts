import { Router, json } from "express";
import { UNAUTHORIZED, OK, INTERNAL_SERVER_ERROR } from "http-status-codes";
import MongoService from "../database/MongoService";

const User = Router();

/**
 * Checks to see if a given auth token exists.
 */
User.get("/", (req, res) => {
  const auth = req.headers.authorization;
  if (!auth) {
    throw new Error("Auth not defined!");
  }
  MongoService.userExists(auth).then(exists => res.sendStatus(exists ? OK : UNAUTHORIZED));
});

/**
 * Creates a user.
 * body:
 *  handle, email, password
 */
User.post("/", json(), (req, res) => {
  console.log("creating user");
  MongoService.createUser(req.body.handle, req.body.email, req.body.password).then(result => {
    if (result.insertedCount > 0) {
      res.sendStatus(OK);
    } else {
      console.log(`Failed to create user ${req.body.handle}!`);
      res.sendStatus(INTERNAL_SERVER_ERROR);
    }
  });
});

export default User;
