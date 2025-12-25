// ====== IMPORTS ======
const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

const app = express();
const PORT = process.env.PORT || 3000;

// ====== STORAGE ======
const upload = multer({
  dest: "uploads/"
});

// ====== SERVE FRONTEND FILES ======
app.use(express.static("public"));

// ====== ADMIN PAGE ======
app.get("/admin", (req, res) => {
  res.sendFile(path.join(__dirname, "admin.html"));
});

// ====== ADMIN UPLOAD HANDLER ======
app.post("/admin/upload", upload.single("music"), (req, res) => {
  const pin = req.body.pin;
  if (pin !== "1234") { // Change PIN as you want
    return res.status(403).send("Wrong PIN");
  }
  res.send("Upload successful");
});

// ====== LIST ALL UPLOADED MUSIC ======
app.get("/music/list", (req, res) => {
  fs.readdir(path.join(__dirname, "uploads"), (err, files) => {
    if (err) return res.status(500).send("Error reading files");
    // Return full URLs for frontend
    const baseUrl = `${req.protocol}://${req.get("host")}/uploads/`;
    const urls = files.map(f => baseUrl + f);
    res.json(urls);
  });
});

// ====== SERVE UPLOADED FILES ======
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// ====== START SERVER ======
app.listen(PORT, () => {
  console.log(`Oluwa-Timileyin Radio Backend Running on port ${PORT}`);
});
