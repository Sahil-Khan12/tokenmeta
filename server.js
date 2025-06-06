import express from 'express';
import path from 'path';
import fs from 'fs-extra';
import { fileURLToPath } from 'url';
import cors from 'cors'
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3005;

// Serve static files
const staticDir = path.join(__dirname, 'static');
await fs.ensureDir(staticDir);
app.use('/static', express.static(staticDir));
app.use(cors());
app.use(express.json())

// Helper: sanitize file name
const sanitizeFileName = (str) => {
  return str.replace(/[^a-zA-Z0-9-_]/g, '_');
};
app.get('/', (req,res)=> res.send("hello workd"))
app.post('/upload', async (req, res) => {
  try {
    const jsonData = {
      ...req.body,
      uploadedAt: new Date().toISOString()
    };

    const jsonDir = path.join(staticDir, 'data');
    await fs.ensureDir(jsonDir);
    const name = req.body.name;
    // Sanitize and generate filename
    const safeName = sanitizeFileName(name);
    const jsonFilename = `${safeName}_${Date.now()}.json`;
    const jsonFilePath = path.join(jsonDir, jsonFilename);

    await fs.writeJson(jsonFilePath, jsonData, { spaces: 2 });

    res.status(200).json({
      message: 'Upload successful',
      jsonFileUrl: `https://tokenmeta.onrender.com/static/data/${jsonFilename}`
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ error: 'Upload failed' });
  }
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
