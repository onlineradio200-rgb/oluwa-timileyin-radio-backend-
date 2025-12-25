const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

const app = express();
const PORT = process.env.PORT || 10000;

// Storage setup for uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/");
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

const upload = multer({ storage });

// Make uploads folder accessible publicly
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Upload endpoint (admin)
app.post("/upload", upload.single("audio"), (req, res) => {
  res.json({ success: true, file: req.file.filename });
});

// Get list of uploaded music
app.get("/music/list", (req, res) => {
  fs.readdir("uploads/", (err, files) => {
    if (err) return res.status(500).json({ error: "Cannot read files" });
    // Only send full URL for frontend
    const list = files.map((f) => ({
      title: f.replace(/\d+-/, ""), // remove timestamp prefix
      url: `${req.protocol}://${req.get("host")}/uploads/${f}`,
    }));
    res.json(list);
  });
});

// Live stream placeholder
app.get("/live", (req, res) => {
  res.json({
    title: "Live Radio",
    url: "https://YOUR_LIVE_STREAM_URL_HERE", // Replace with live mic stream later
  });
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
