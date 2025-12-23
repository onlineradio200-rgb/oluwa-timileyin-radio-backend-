const express = require("express");
const cors = require("cors");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use("/uploads", express.static("uploads"));

if (!fs.existsSync("uploads")) {
  fs.mkdirSync("uploads");
}

const storage = multer.diskStorage({
  destination: "uploads/",
  filename: (req, file, cb) =>
    cb(null, Date.now() + "-" + file.originalname),
});
const upload = multer({ storage });

app.get("/", (req, res) => {
  res.send("Oluwa-Timileyin Radio Backend Running");
});

app.get("/music/list", (req, res) => {
  res.json(fs.readdirSync("uploads"));
});

app.post("/admin/upload", upload.single("music"), (req, res) => {
  res.json({ success: true, file: req.file.filename });
});

app.listen(PORT, () => {
  console.log("Backend running on port", PORT);
});
