import express from 'express';
import bodyParser from 'body-parser';
import "reflect-metadata";
import helmet from "helmet";
import cors from "cors";
import { createConnection } from "typeorm";
import routes from "./routes";

const port = 1337;

createConnection().then(() => {
  console.log("Successfully connected to database");

  // Create express application instance
  const app: express.Application = express();

  // Enable cross-origin Requests
  app.use(cors());
  // Secure app by setting various HTTP headers
  app.use(helmet());
  // Used for post requests
  app.use(bodyParser.urlencoded({ extended: false }));
  // Use all routes from routes folder
  app.use("/", routes);

  app.listen(port, () => {
    console.log(`Server started on port ${port}`);
  });
}).catch(error => {
  console.log(error);
});
