const express = require("express");
const path = require("path");

const app = express();
const PORT = 3000;

app.use("/videos", express.static(path.join(__dirname, "videos")));

app.listen(PORT, () => {
    console.log(`Video server running at http://127.0.0.1:${PORT}`);
});