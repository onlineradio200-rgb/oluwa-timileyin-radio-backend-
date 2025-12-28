const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const http = require("http");
const { Server } = require("socket.io");
const cron = require("node-cron");

const app = express();
const PORT = process.env.PORT || 10000;
const server = http.createServer(app);
const io = new Server(server);

/* ---------- FOLDERS ---------- */
const uploadDir = path.join(__dirname, "uploads");
const publicDir = path.join(__dirname, "../frontend"); // connect frontend here

if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir);

/* ---------- MIDDLEWARE ---------- */
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(publicDir));
app.use("/uploads", express.static(uploadDir));

/* ---------- MULTER CONFIG ---------- */
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => cb(Date.now() + "-" + file.originalname),
});
const upload = multer({ storage });

/* ---------- ROUTES ---------- */
app.get("/api/status", (req, res) => res.json({ status: "Radio backend running" }));

app.post("/music/upload", upload.single("audio"), (req, res) => {
  if (!req.file) return res.status(400).json({ error: "No audio uploaded" });
  res.json({ success: true, file: `/uploads/${req.file.filename}` });
});

app.get("/music/list", (req, res) => {
  fs.readdir(uploadDir, (err, files) => {
    if (err) return res.status(500).json([]);
    const audioFiles = files.filter(f => f.match(/\.(mp3|aac|wav|ogg)$/i));
    res.json(audioFiles.map(f => `/uploads/${f}`));
  });
});

/* ---------- LIVE MIC (B) ---------- */
io.on("connection", socket => {
  console.log("Client connected");

  socket.on("mic-stream", data => socket.broadcast.emit("mic-stream", data));
  socket.on("disconnect", () => console.log("Client disconnected"));
});

/* ---------- AUTO-PLAY QUEUE (A) ---------- */
let queue = [];
let currentTrackIndex = 0;

function loadQueue() {
  fs.readdir(uploadDir, (err, files) => {
    if (err) return console.error(err);
    queue = files.filter(f => f.match(/\.(mp3|aac|wav|ogg)$/i));
  });
}

setInterval(() => {
  if (queue.length > 0) {
    const track = queue[currentTrackIndex];
    io.emit("play-track", `/uploads/${track}`);
    currentTrackIndex = (currentTrackIndex + 1) % queue.length;
  }
}, 30000); // 30s per track for demo

loadQueue();

/* ---------- SCHEDULED PLAY (C) ---------- */
cron.schedule("0 9 * * 0", () => { // Sunday 9AM
  const sundayTrack = queue.find(f => f.toLowerCase().includes("sunday"));
  if (sundayTrack) io.emit("play-track", `/uploads/${sundayTrack}`);
  console.log("Sunday schedule played:", sundayTrack);
});

/* ---------- START SERVER ---------- */
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
