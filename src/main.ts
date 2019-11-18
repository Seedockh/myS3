import express from 'express';
import body_parser from 'body-parser';
import fs from 'fs';

let app: express.Application = express();
let port: number = 1337;

// Get environment folder for any OS
let envFolder: string = process.env.APPDATA || (process.platform == 'darwin' ? process.env.HOME + '/Library/Preferences' : process.env.HOME + "/.local/share");
// Set app data folder
let dataDir: string = envFolder.concat("\\myS3DATA");

// Used for post requests
app.use(body_parser.json());

app.listen(port, () => {
  // Create data folder if not exists
  if (!fs.existsSync(dataDir)){
    fs.mkdirSync(dataDir);
  }
  console.log(`Server started on port ${port}`)
})

// Get request
app.get("/", (req: express.Request, res: express.Response) => {
  res.send("Get was called");
  console.log("Get was called");
});

// Post request
app.post("/", (req: express.Request, res: express.Response) => {
  res.send("Post was called");
  console.log("Post was called");
});

// Put request
app.put("/", (req: express.Request, res: express.Response) => {
  res.send("Put was called");
  console.log("Put was called");
});

// Delete request
app.delete("/", (req: express.Request, res: express.Response) => {
  res.send("Delete was called");
  console.log("Delete was called");
});