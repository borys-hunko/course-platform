import express, { Request } from "express";
import { generateWords } from "./words-generator";
import { TestResopnse } from "./types";

const app = express();

const port = 8000;

app.get("/", (req: Request<unknown, TestResopnse>, res) => {
  res.send({
    message: `Hello ${generateWords()}`,
  });
});

app.use("/files", express.static("public"));

app.get("/file-get", (req, res) => {
  res.download("./public/index.html", "index.html", (err) => {
    if (err) {
      console.log("download error", err);
    }
  });
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
