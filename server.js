const express = require("express");
const cors = require("cors");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

const app = express();
const PORT = process.env.PORT || 10000;

app.use(cors());
app.use(express.json());

// ===============================
// UPLOAD FOLDER
// ===============================
const uploadDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

// ===============================
// MULTER CONFIG
// ===============================
const storage = multer.diskStorage({
  destination: uploadDir,
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  }
});
const upload = multer({ storage });

// ===============================
// SERVE AUDIO FILES
// ===============================
app.use("/uploads", express.static(uploadDir));

// ===============================
// ROUTES
// ===============================
app.get("/", (req, res) => {
  res.json({
    status: "OK",
    message: "Oluwa-Timileyin Radio Backend Running"
  });
});

app.get("/music/list", (req, res) => {
  fs.readdir(uploadDir, (err, files) => {
    if (err) return res.json([]);
    const audioFiles = files.map(f => `/uploads/${f}`);
    res.json(audioFiles);
  });
});

app.post("/admin/upload", upload.single("audio"), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: "No file uploaded" });
  }
  res.json({
    success: true,
    file: `/uploads/${req.file.filename}`
  });
});

// ===============================
app.listen(PORT, () => {
  console.log("Server running on port " + PORT);
});
