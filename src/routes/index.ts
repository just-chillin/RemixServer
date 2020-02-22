import { Router, urlencoded } from "express";
import { BAD_REQUEST, INTERNAL_SERVER_ERROR, OK } from "http-status-codes";
import EmailValidator from "email-validator";
import MongoService from "../database/MongoService";

const IndexRoute = Router();

IndexRoute.post("/registerbeta", urlencoded({ extended: true }), (req, res) => {
  const email: string | undefined = req.body.email;
  if (!email || !EmailValidator.validate(email)) {
    res.sendStatus(BAD_REQUEST);
    return;
  }
  MongoService.betaRegister(email)
    .then(() => {
      console.log(`Sucessfully registered ${email} for the beta!`);
      res.sendStatus(OK);
    })
    .catch(() => res.sendStatus(INTERNAL_SERVER_ERROR));
});

export default IndexRoute;
