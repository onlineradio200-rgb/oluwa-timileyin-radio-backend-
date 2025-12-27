const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

const app = express();
const PORT = process.env.PORT || 10000;

/* ===== Ensure uploads folder exists ===== */
const uploadDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

/* ===== Middleware ===== */
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

/* ===== Serve static files ===== */
app.use("/uploads", express.static(uploadDir));
app.use("/", express.static(path.join(__dirname, "public")));

/* ===== Multer setup ===== */
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueName = Date.now() + "-" + file.originalname;
    cb(null, uniqueName);
  }
});

const upload = multer({ storage });

/* ===== Routes ===== */

/* Test route */
app.get("/health", (req, res) => {
  res.json({ status: "Backend running OK" });
});

/* Upload music */
app.post("/admin/upload", upload.single("audio"), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: "No file uploaded" });
  }

  res.json({
    success: true,
    file: `/uploads/${req.file.filename}`
  });
});

/* List music */
app.get("/music/list", (req, res) => {
  fs.readdir(uploadDir, (err, files) => {
    if (err) return res.status(500).json([]);

    const audioFiles = files.filter(f =>
      f.endsWith(".mp3") || f.endsWith(".aac") || f.endsWith(".wav")
    );

    const urls = audioFiles.map(f => `/uploads/${f}`);
    res.json(urls);
  });
});

/* Fallback */
app.use((req, res) => {
  res.status(404).send("Route not found");
});

/* ===== Start server ===== */
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
