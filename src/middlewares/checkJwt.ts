import { Request, Response, NextFunction } from "express";
import * as jwt from "jsonwebtoken";
require('dotenv').config();

const jwt_secret: string | undefined = process.env.JWT_SECRET

export const checkJwt = (req: Request, res: Response, next: NextFunction) => {
  if (jwt_secret === undefined) throw "jwt_secret is undefined";
  
  const header = req.headers['authorization'];
  let jwtPayload;

  if(typeof header !== 'undefined') {
    const bearer = header.split(' ');
    const token = bearer[1];

    jwt.verify(token, jwt_secret, (err, authorizedData) => {
      if(err){
          // If error
          console.log('ERROR: Could not connect to the protected route');
          res.sendStatus(403);
      } else {
          // If token is successfully verified
          jwtPayload = authorizedData;
          res.locals.jwtPayload = jwtPayload;
          console.log('SUCCESS: Connected to protected route');
      }
    })
  } else {
      // If header is undefined
      res.sendStatus(403)
  }

  if (jwtPayload != undefined) {
    // The token is valid for 1 hour
    // Send a new token on every request
    const { userId, username } = jwtPayload;
    const newToken = jwt.sign({ userId, username }, jwt_secret, {
      expiresIn: "1h"
    });
    res.setHeader("token", newToken);
    // Call the next middleware or controller
    next();
  }
};
