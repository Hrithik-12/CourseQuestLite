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
app.use(cors());

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

/**
 * Upload and import CSV endpoint
 * POST /api/import/csv
 */
app.post('/api/import/csv', upload.single('csvFile'), async (req, res) => {
  try {
    // Check if file was uploaded
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No CSV file provided. Please upload a file with key "csvFile"'
      });
    }

    console.log(`📁 Received CSV file: ${req.file.originalname} (${req.file.size} bytes)`);
    
    // Import the CSV file
    const result = await importCoursesFromCSV(req.file.path);
    
    // Clean up uploaded file after processing
    fs.unlinkSync(req.file.path);
    
    // Return result with appropriate status code
    const statusCode = result.success ? 200 : 400;
    res.status(statusCode).json(result);
    
  } catch (error) {
    console.error('❌ CSV import endpoint error:', error);
    
    // Clean up file if it exists
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    
    res.status(500).json({
      success: false,
      message: 'Internal server error during CSV import',
      error: error.message
    });
  }
});

/**
 * Import from existing file endpoint
 * POST /api/import/file
 */
app.post('/api/import/file', async (req, res) => {
  try {
    const { filePath } = req.body;
    
    if (!filePath) {
      return res.status(400).json({
        success: false,
        message: 'File path is required'
      });
    }
    
    // Check if file exists
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({
        success: false,
        message: `File not found: ${filePath}`
      });
    }
    
    console.log(`📁 Importing from existing file: ${filePath}`);
    
    // Import the CSV file
    const result = await importCoursesFromCSV(filePath);
    
    // Return result with appropriate status code
    const statusCode = result.success ? 200 : 400;
    res.status(statusCode).json(result);
    
  } catch (error) {
    console.error('❌ File import endpoint error:', error);
    
    res.status(500).json({
      success: false,
      message: 'Internal server error during file import',
      error: error.message
    });
  }
});



/**
 * API documentation endpoint
 */
app.get('/api/docs', (req, res) => {
  res.json({
    title: 'Course Management API',
    version: '1.0.0',
    endpoints: {
      'GET /health': 'Health check',
      'GET /api/courses': 'Get courses with filters & pagination',
      'GET /api/compare': 'Compare courses by IDs (?ids=CS101,CS102,CS103)',
      'POST /api/ask': '🤖 Ask AI - Natural language course search',
      'POST /api/ingest': '🔐 Protected CSV ingest (requires Authorization: Bearer <token>)',
      'POST /api/import/csv': 'Upload and import CSV file (public)',
      'POST /api/import/file': 'Import from existing file path (public)',
      'GET /api/docs': 'This documentation'
    },
    authentication: {
      protectedEndpoints: ['/api/ingest'],
      headerFormat: 'Authorization: Bearer <token>',
      tokenEnvVar: 'API_TOKEN',
      defaultToken: 'your-secret-token (for development)',
      example: 'Authorization: Bearer your-secret-token'
    },
    examples: {
      getCourses: '/api/courses?page=1&limit=10&department=Computer Science&level=UG&minRating=4.0',
      compareCourses: '/api/compare?ids=CS101,CS102,CS103',
      askAI: 'POST /api/ask with {"question": "Find UG computer science courses under 50000"}',
      protectedIngest: 'POST /api/ingest with Authorization header and csvFile upload',
      publicImport: 'POST /api/import/csv with csvFile upload (no auth required)'
    },
    aiExamples: {
      basic: 'Find computer science courses',
      level: 'Show me UG courses',
      fee: 'Courses under 50000',
      rating: 'High rated courses above 4.5',
      mode: 'Online courses only',
      complex: 'Find UG computer science online courses under 50000 with rating above 4'
    },
    filters: {
      page: 'Page number (default: 1)',
      limit: 'Items per page (default: 10, max: 100)',
      department: 'Filter by department name',
      level: 'Filter by level (UG/PG)',
      deliveryMode: 'Filter by delivery mode (online/offline/hybrid)',
      minRating: 'Minimum rating filter',
      maxFee: 'Maximum fee filter',
      search: 'Search in course name or ID'
    }
  });
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
  console.log(`🚀 Course Management API server running on port ${PORT}`);
  console.log(`📚 API Documentation: http://localhost:${PORT}/api/docs`);
  console.log(`❤️  Health Check: http://localhost:${PORT}/health`);
});

module.exports = app;