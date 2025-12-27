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

/* ===== Serve static folders ===== */
app.use("/uploads", express.static(uploadDir));
app.use(express.static(path.join(__dirname, "public"))); // 👈 THIS IS THE FIX

/* ===== Multer setup ===== */
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  }
});

const upload = multer({ storage });

/* ===== Upload route ===== */
app.post("/admin/upload", upload.single("audio"), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: "No file uploaded" });
  }

  res.json({
    success: true,
    url: `/uploads/${req.file.filename}`
  });
});

/* ===== List music ===== */
app.get("/music/list", (req, res) => {
  fs.readdir(uploadDir, (err, files) => {
    if (err) return res.json([]);

    const audio = files.filter(f =>
      f.endsWith(".mp3") || f.endsWith(".aac") || f.endsWith(".wav")
    );

    res.json(audio.map(f => `/uploads/${f}`));
  });
});

/* ===== Start server ===== */
app.listen(PORT, () => {
  console.log("Server running on port " + PORT);
});
