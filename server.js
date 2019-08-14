const express = require("express");
const path = require("path");
const api = require("./server/api.js");

const app = express();
app.use(express.static(path.resolve(__dirname, "build")));

app.get("/api/generatePlaylist", (request, response) => {
  api(request.query.start, request.query.end).then((songData) => {
    response.send(JSON.stringify(songData));
  });
});

const port = process.env.PORT || 5000;
app.listen(port, () => {
  // eslint-disable-next-line
  console.log(`Server up and listening on port ${port}`);
});
