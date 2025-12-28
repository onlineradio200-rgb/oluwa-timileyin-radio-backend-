const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

const app = express();
const PORT = process.env.PORT || 10000;

/* ---------- FOLDERS ---------- */
const uploadDir = path.join(__dirname, "uploads");
const publicDir = path.join(__dirname, "public");

if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir);
if (!fs.existsSync(publicDir)) fs.mkdirSync(publicDir);

/* ---------- MIDDLEWARE ---------- */
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

/* Serve frontend */
app.use(express.static(publicDir));

/* Serve uploaded audio */
app.use("/uploads", express.static(uploadDir));

/* ---------- MULTER CONFIG ---------- */
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) =>
    cb(null, Date.now() + "-" + file.originalname),
});

const upload = multer({ storage });

/* ---------- ROUTES ---------- */

/* Root (safe check so browser does not confuse you) */
app.get("/", (req, res) => {
  res.json({ status: "Oluwa-Timileyin Radio backend running" });
});

/* API status (frontend uses this) */
app.get("/api/status", (req, res) => {
  res.json({ status: "OK" });
});

/* Upload audio */
app.post("/music/upload", upload.single("audio"), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: "No audio uploaded" });
  }

  res.json({
    success: true,
    file: `/uploads/${req.file.filename}`,
  });
});

/* List audio */
app.get("/music/list", (req, res) => {
  fs.readdir(uploadDir, (err, files) => {
    if (err) return res.json([]);

    const audioFiles = files.filter(f =>
      f.match(/\.(mp3|aac|wav|ogg)$/i)
    );

    res.json(audioFiles.map(f => `/uploads/${f}`));
  });
});

/* ---------- START SERVER ---------- */
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
