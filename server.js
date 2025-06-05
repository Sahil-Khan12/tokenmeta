import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs-extra';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3005;

// Serve static files
const staticDir = path.join(__dirname, 'static');
await fs.ensureDir(staticDir);
app.use('/static', express.static(staticDir));

// Multer config
const storage = multer.diskStorage({
  destination: async (req, file, cb) => {
    const imgPath = path.join(staticDir, 'images');
    await fs.ensureDir(imgPath);
    cb(null, imgPath);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now();
    const ext = path.extname(file.originalname);
    cb(null, `${file.fieldname}-${uniqueSuffix}${ext}`);
  }
});
const upload = multer({ storage });

// Helper: sanitize file name
const sanitizeFileName = (str) => {
  return str.replace(/[^a-zA-Z0-9-_]/g, '_');
};
app.get('/', (req,res)=> res.send("hello workd"))
app.post('/upload', upload.single('image'), async (req, res) => {
  try {
    const { name, symbol, description } = req.body;
    console.log(name,symbol,description)
    if (!name || !symbol || !req.file) {
      return res.status(400).json({ error: "Missing required fields (name, symbol, image)" });
    }

    const imageUrl = `/static/images/${req.file.filename}`;

    const jsonData = {
      name,
      symbol,
      description,
      image: imageUrl,
      uploadedAt: new Date().toISOString()
    };

    const jsonDir = path.join(staticDir, 'data');
    await fs.ensureDir(jsonDir);

    // Sanitize and generate filename
    const safeName = sanitizeFileName(name);
    const safeSymbol = sanitizeFileName(symbol);
    const jsonFilename = `${safeName}_${safeSymbol}.json`;
    const jsonFilePath = path.join(jsonDir, jsonFilename);

    await fs.writeJson(jsonFilePath, jsonData, { spaces: 2 });

    res.status(200).json({
      message: 'Upload successful',
      jsonFileUrl: `/static/data/${jsonFilename}`
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ error: 'Upload failed' });
  }
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
