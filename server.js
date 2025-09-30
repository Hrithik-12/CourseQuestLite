// server.js
require('dotenv').config();
const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { importCoursesFromCSV } = require('./src/services/courseImportService');
const cors=require('cors');

// Import routes
const courseRoutes = require('./src/routes/courseRoutes');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Configure CORS for production
const corsOptions = {
  origin: process.env.NODE_ENV === 'production' 
    ? [
        'https://course-quest-lite-3k2r.vercel.app', // Your actual Vercel frontend URL
        'https://coursequest-frontend.vercel.app' // Backup/alternative URL
      ]
    : ['http://localhost:5173', 'http://localhost:3000'], // Development
  credentials: true,
  optionsSuccessStatus: 200
};
app.use(cors(corsOptions));

// Configure multer for file uploads
const upload = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => {
      const uploadDir = './uploads';
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }
      cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
      // Generate unique filename with timestamp
      const uniqueName = `courses_${Date.now()}_${file.originalname}`;
      cb(null, uniqueName);
    }
  }),
  fileFilter: (req, file, cb) => {
    // Only allow CSV files
    if (file.mimetype === 'text/csv' || path.extname(file.originalname).toLowerCase() === '.csv') {
      cb(null, true);
    } else {
      cb(new Error('Only CSV files are allowed'), false);
    }
  },
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  }
});

// Routes

/**
 * Health check endpoint
 */
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Course Management API is running',
    timestamp: new Date().toISOString()
  });
});

// Mount course routes
app.use('/api', courseRoutes);

// Token authentication middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN
  
  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Access token required. Use Authorization: Bearer <token>',
      example: 'Authorization: Bearer your-secret-token'
    });
  }
  
  // Simple token validation (in production, use proper JWT validation)
  const validToken = process.env.API_TOKEN || 'your-secret-token';
  if (token !== validToken) {
    return res.status(403).json({
      success: false,
      message: 'Invalid or expired token'
    });
  }
  
  next();
};

/**
 * Protected ingest endpoint
 * POST /api/ingest (requires Authorization: Bearer <token>)
 */
app.post('/api/ingest', authenticateToken, upload.single('csvFile'), async (req, res) => {
  try {
    // Check if file was uploaded
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No CSV file provided. Please upload a file with key "csvFile"'
      });
    }

    console.log(`🔐 Protected CSV ingest: ${req.file.originalname} (${req.file.size} bytes)`);
    
    // Import the CSV file
    const result = await importCoursesFromCSV(req.file.path);
    
    // Clean up uploaded file after processing
    fs.unlinkSync(req.file.path);
    
    // Return result with appropriate status code
    const statusCode = result.success ? 200 : 400;
    res.status(statusCode).json({
      ...result,
      ingestType: 'protected',
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('❌ Protected ingest endpoint error:', error);
    
    // Clean up file if it exists
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    
    res.status(500).json({
      success: false,
      message: 'Internal server error during protected CSV ingest',
      error: error.message
    });
  }
});


// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Endpoint not found',
    availableEndpoints: ['/health', '/api/courses', '/api/compare', '/api/ask (🤖)', '/api/ingest (🔐)', '/api/import/csv', '/api/import/file', '/api/docs']
  });
});

// Error handling middleware
app.use((error, req, res, next) => {
  console.error('❌ Express error:', error);
  
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        message: 'File size too large. Maximum size is 5MB.'
      });
    }
  }
  
  res.status(500).json({
    success: false,
    message: 'Internal server error',
    error: error.message
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`Course Management API server running on port ${PORT}`);
  console.log(`API Documentation: http://localhost:${PORT}/api/docs`);
  console.log(` Health Check: http://localhost:${PORT}/health`);
});

module.exports = app;