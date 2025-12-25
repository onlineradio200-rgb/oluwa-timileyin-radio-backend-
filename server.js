const express = require("express");
const multer = require("multer");
const fs = require("fs");
const path = require("path");
const app = express();
const PORT = process.env.PORT || 3000;

// Create uploads folder if it doesn't exist
const uploadFolder = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadFolder)) {
  fs.mkdirSync(uploadFolder);
}

// Multer configuration
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadFolder);
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + "-" + file.originalname);
  },
});
const upload = multer({ storage });

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Admin panel route
app.get("/admin", (req, res) => {
  res.sendFile(path.join(__dirname, "admin.html"));
});

// Admin upload route
app.post("/admin/upload", upload.single("music"), (req, res) => {
  const pin = req.body.pin;
  if (pin !== "1234") {
    return res.status(403).send("Wrong PIN");
  }

  if (!req.file) {
    return res.status(400).send("No file uploaded");
  }

  res.send("Upload successful!");
});

// Get list of uploaded music
app.get("/music/list", (req, res) => {
  fs.readdir(uploadFolder, (err, files) => {
    if (err) return res.status(500).json({ error: "Cannot read files" });

    const musicFiles = files.map((file) => `/uploads/${file}`);
    res.json(musicFiles);
  });
});

// Serve uploaded files
app.use("/uploads", express.static(uploadFolder));

// Start server
app.listen(PORT, () => {
  console.log(`Oluwa-Timileyin Radio Backend Running on port ${PORT}`);
});
