app.get("/music/list", (req, res) => {
  fs.readdir(uploadFolder, (err, files) => {
    if (err) {
      return res.status(500).json([]);
    }

    // Return full paths
    const musicFiles = files.map(file => `/uploads/${file}`);
    res.json(musicFiles);
  });
});
