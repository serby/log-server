const http = require("http");
const { join } = require("path");
const hostname = "0.0.0.0";
const port = 9200;

const { createWriteStream, createReadStream } = require("fs");

const logPath = process.env.LOG_PATH || "/var/log/board";

const initStream = () => {
  let writeStream;
  let filename;
  const getWriteStream = () => {
    const checkFilename = `logs-${new Date().toISOString().slice(0, 10)}`;
    if (filename !== checkFilename) {
      if (writeStream) {
        writeStream.end();
      }
      filename = checkFilename;
      writeStream = createWriteStream(join(logPath, filename), { flags: "a" });
    }
    return writeStream;
  };
  const getReadStream = () => {
    const checkFilename = `logs-${new Date().toISOString().slice(0, 10)}`;
    return createReadStream(join(logPath, checkFilename));
  };
  return {
    getReadStream,
    getWriteStream,
  };
};

const { getReadStream, getWriteStream } = initStream();

const log = (message) => {
  if (message)
    getWriteStream().write(
      JSON.stringify({ date: new Date(), message }) + "\n"
    );
};

const server = http.createServer((req, res) => {
  res.statusCode = 200;
  res.setHeader("Content-Type", "text/plain");
  if (req.method === "GET") {
    getReadStream()
      .on("error", (error) => {
        if (error.code === "ENOENT") {
          return res.end();
        }
        throw e;
      })
      .pipe(res);
  } else {
    const message = [];
    req.on("data", (data) => message.push(data.toString()));
    req.on("end", (data) => {
      if (data) message.push(data.toString());
      message.join("").split("\n").forEach(log);
      res.end("OK");
    });
  }
});

server.listen(port, hostname, () => {
  console.log(`Server running at http://${hostname}:${port}/`);
  log("Starting logger");
});
