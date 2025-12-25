const express = require("express");
const multer = require("multer");
const fs = require("fs");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;

/* =========================
   CREATE UPLOADS FOLDER
========================= */
const uploadsPath = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadsPath)) {
  fs.mkdirSync(uploadsPath);
}

/* =========================
   MIDDLEWARE
========================= */
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

/* =========================
   SERVE MP3 FILES PUBLICLY
========================= */
app.use("/uploads", express.static(uploadsPath));

/* =========================
   MULTER CONFIG
========================= */
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsPath);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  }
});
const upload = multer({ storage });

/* =========================
   HOME CHECK
========================= */
app.get("/", (req, res) => {
  res.send("Oluwa-Timileyin Radio Backend Running");
});

/* =========================
   ADMIN PAGE
========================= */
app.get("/admin", (req, res) => {
  res.send(`
    <h2>Radio Admin Upload</h2>
    <form method="POST" action="/admin/upload" enctype="multipart/form-data">
      <input type="password" name="pin" placeholder="Admin PIN" required /><br><br>
      <input type="file" name="music" accept="audio/*" required /><br><br>
      <button type="submit">Upload Music</button>
    </form>
  `);
});

/* =========================
   UPLOAD ROUTE
========================= */
app.post("/admin/upload", upload.single("music"), (req, res) => {
  if (req.body.pin !== "1234") {
    return res.status(403).send("Wrong Admin PIN");
  }
  res.send("Upload successful");
});

/* =========================
   LIST MUSIC FILES
========================= */
app.get("/music/list", (req, res) => {
  fs.readdir(uploadsPath, (err, files) => {
    if (err) return res.json([]);
    res.json(files.map(file => "/uploads/" + file));
  });
});

/* =========================
   START SERVER
========================= */
app.listen(PORT, () => {
  console.log("Oluwa-Timileyin Radio Backend Running");
});
