const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

const app = express();
const PORT = process.env.PORT || 10000;

/* ---------- FOLDERS ---------- */
const uploadDir = path.join(__dirname, "uploads");
const publicDir = path.join(__dirname, "public");

/* Create folders if missing */
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

/* Home test */
app.get("/api/status", (req, res) => {
  res.json({ status: "Radio backend running" });
});

/* Upload audio (ADMIN / POSTMAN / CURL) */
app.post("/music/upload", upload.single("audio"), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: "No audio uploaded" });
  }

  res.json({
    success: true,
    file: `/uploads/${req.file.filename}`,
  });
});

/* List uploaded music */
app.get("/music/list", (req, res) => {
  fs.readdir(uploadDir, (err, files) => {
    if (err) return res.status(500).json([]);

    const audioFiles = files.filter(f =>
      f.match(/\.(mp3|aac|wav|ogg)$/i)
    );

    const result = audioFiles.map(f => `/uploads/${f}`);
    res.json(result);
  });
});

/* ---------- START SERVER ---------- */
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
