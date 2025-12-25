const express = require('express');
const path = require('path');
const multer = require('multer');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 10000;

// --- Middleware ---
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve uploads folder
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Serve frontend static files
app.use('/', express.static(path.join(__dirname, '../frontend')));

// --- Ensure uploads folder exists ---
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

// --- Multer setup for uploads ---
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    const timestamp = Date.now();
    const ext = path.extname(file.originalname);
    cb(null, `${timestamp}-${file.originalname}`);
  }
});
const upload = multer({ storage });

// --- Routes ---

// Upload music (POST from admin.html)
app.post('/upload', upload.single('music'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
  res.json({ success: true, filename: req.file.filename, url: `/uploads/${req.file.filename}` });
});

// Get list of uploaded music
app.get('/music/list', (req, res) => {
  fs.readdir(uploadDir, (err, files) => {
    if (err) return res.status(500).json({ error: 'Failed to read uploads' });
    const audioFiles = files.filter(f => ['.mp3', '.aac', '.wav'].includes(path.extname(f)));
    res.json(audioFiles);
  });
});

// --- Start server ---
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
