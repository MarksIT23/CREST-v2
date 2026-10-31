import express from 'express';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

import uploadRoutes from './routes/upload.js';
import papersRoutes from './routes/papers.js';
import categoriesRoutes from './routes/categories.js';
import facultyRoutes from './routes/faculty.js';
import studentsRoutes from './routes/students.js';
import authRoutes from './routes/auth.js';
import analyticsRoutes from './routes/analytics.js';
import draftsRoutes from './routes/drafts.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3002;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Ensure uploads directories exist
const uploadsDir = path.join(__dirname, 'uploads', 'papers');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Serve uploaded files statically at /uploads
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Mount API routes
app.use('/api/upload', uploadRoutes);
app.use('/api/papers', papersRoutes);
app.use('/api/categories', categoriesRoutes);
app.use('/api/faculty', facultyRoutes);
app.use('/api/students', studentsRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/drafts', draftsRoutes);

// Health check endpoint
app.get('/api/health', (_req, res) => {
  res.json({
    status: 'ok',
    institution: 'Wesleyan University Philippines',
    department: 'CECT (College of Engineering and Computer Technology)',
    programs: ['BSIT', 'BSCpE', 'BSECE'],
    time: new Date().toISOString(),
  });
});

// Error handling middleware
app.use((err, _req, res, _next) => {
  console.error('Server error:', err);
  res.status(err.status || 500).json({
    error: err.message || 'Internal Server Error',
  });
});

app.listen(PORT, () => {
  console.log(`[CREST CECT API Server] listening on http://localhost:${PORT}`);
  console.log(`[Uploads Directory] serving static files from ${path.join(__dirname, 'uploads')}`);
});
