import express from 'express';
import path from 'path';
import fs from 'fs/promises';
import { createServer as createViteServer } from 'vite';
import multer from 'multer';

const UPLOADS_DIR = path.join(process.cwd(), 'uploads');

// Ensure uploads directory exists
fs.mkdir(UPLOADS_DIR, { recursive: true }).catch(console.error);

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, UPLOADS_DIR)
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname))
  }
});

const upload = multer({ storage: storage });

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: '500mb' }));
  app.use(express.urlencoded({ limit: '500mb', extended: true }));
  app.use('/uploads', express.static(UPLOADS_DIR));

  let mediaConfig = {
    heroImage: null as string | null,
    photos: [null, null, null, null] as (string | null)[],
    videos: [null] as (string | null)[]
  };

  try {
    const data = await fs.readFile(path.join(process.cwd(), 'mediaConfig.json'), 'utf-8');
    const parsed = JSON.parse(data);
    mediaConfig.heroImage = parsed.heroImage || null;
    mediaConfig.photos = parsed.photos && parsed.photos.length > 0 ? parsed.photos : [null, null, null, null];
    mediaConfig.videos = parsed.videos && parsed.videos.length > 0 ? parsed.videos : [null];
  } catch (err) {
    // Initial run or file missing
  }

  const saveConfig = async () => {
    await fs.writeFile(path.join(process.cwd(), 'mediaConfig.json'), JSON.stringify(mediaConfig, null, 2));
  };

  app.get('/api/media', (req, res) => {
    res.json(mediaConfig);
  });

  app.post('/api/media/hero', upload.single('file'), async (req, res) => {
    if (!req.file) return res.status(400).send('No file uploaded.');
    mediaConfig.heroImage = '/uploads/' + req.file.filename;
    await saveConfig();
    res.json({ url: mediaConfig.heroImage });
  });

  app.post('/api/media/photo', upload.single('file'), async (req, res) => {
    if (!req.file) return res.status(400).send('No file uploaded.');
    const index = parseInt(req.body.index);
    const url = '/uploads/' + req.file.filename;
    
    if (req.body.action === 'add') {
      mediaConfig.photos.push(url);
    } else if (!isNaN(index)) {
      mediaConfig.photos[index] = url;
    }
    
    await saveConfig();
    res.json({ url, photos: mediaConfig.photos });
  });

  app.post('/api/media/video', upload.single('file'), async (req, res) => {
    if (!req.file) return res.status(400).send('No file uploaded.');
    const index = parseInt(req.body.index);
    const url = '/uploads/' + req.file.filename;

    if (req.body.action === 'add') {
      mediaConfig.videos.push(url);
    } else if (!isNaN(index)) {
      mediaConfig.videos[index] = url;
    }
    
    await saveConfig();
    res.json({ url, videos: mediaConfig.videos });
  });

  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
