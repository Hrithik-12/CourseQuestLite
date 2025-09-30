# CourseQuestLite 🎓

A comprehensive course management system with advanced search capabilities, AI-powered query processing, and intuitive course comparison features.

## 🏗️ System Architecture

![System Architecture](./course-manag/public/diagram.png)

The system follows a modern full-stack architecture with:
- **Backend**: Node.js + Express.js REST API
- **Database**: PostgreSQL with Prisma ORM
- **Frontend**: React.js with Tailwind CSS
- **File Processing**: CSV import with validation
- **Search**: Rule-based natural language processing

## ✨ Features

### 🔍 **Smart Course Search**
- **Standard REST API**: Filter by department, level, delivery mode, fee range, rating
- **Natural Language Search**: Ask questions like "Find UG computer science courses under 50000"
- **Advanced Pagination**: Efficient handling of large datasets

### 📊 **Course Comparison**
- Side-by-side comparison of up to 5 courses
- Quick insights (highest rated, most affordable, shortest duration)
- Export and print functionality

### 📁 **CSV Data Management**
- **Protected Import**: `/api/ingest` with token authentication
- **Public Import**: `/api/import/csv` for development
- **Bulk Processing**: Efficient department and course creation
- **Data Validation**: Comprehensive validation with detailed error reporting

### 🤖 **AI-Powered Search**
- Rule-based parsing engine (no external AI dependencies)
- Pattern recognition for levels, departments, fees, ratings
- Smart alias mapping (CS → Computer Science, EE → Electrical Engineering)

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm
- PostgreSQL database
- Git

### 1. Clone Repository
```bash
git clone https://github.com/Hrithik-12/CourseQuestLite.git
cd CourseQuestLite
```

### 2. Install Dependencies
```bash
# Backend dependencies
npm install

# Frontend dependencies
cd course-manag
npm install
cd ..
```

### 3. Environment Setup
```bash
# Copy environment template
cp .env.example .env

# Edit .env with your database credentials
nano .env
```

### 4. Database Setup
```bash
# Generate Prisma client
npx prisma generate

# Run database migrations
npx prisma migrate deploy

# (Optional) Seed with sample data
npm run import
```

### 5. Start Development Servers
```bash
# Terminal 1: Start backend (Port 3000)
npm run dev

# Terminal 2: Start frontend (Port 5173)
cd course-manag
npm run dev
```

Visit: http://localhost:5173

## 📡 API Documentation

### 🔓 **Public Endpoints**

#### Get Courses with Filters
```bash
GET /api/courses?department=Computer%20Science&level=UG&maxFee=50000&page=1&limit=10
```

**Query Parameters:**
- `department` - Department name (partial match)
- `level` - Course level (`UG` or `PG`)
- `deliveryMode` - Delivery mode (`online`, `offline`, `hybrid`)
- `minRating` - Minimum rating (0-5)
- `maxFee` - Maximum tuition fee
- `search` - Search in course name/ID
- `page` - Page number (default: 1)
- `limit` - Items per page (default: 10, max: 100)

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "CS101",
      "name": "Introduction to Programming",
      "department": { "name": "Computer Science" },
      "level": "UG",
      "deliveryMode": "online",
      "credits": 4,
      "durationWeeks": 12,
      "rating": "4.50",
      "tuitionFee": "45000.00",
      "yearOffered": 2024
    }
  ],
  "pagination": {
    "currentPage": 1,
    "pageSize": 10,
    "totalCourses": 66,
    "totalPages": 7,
    "hasNextPage": true,
    "hasPrevPage": false
  }
}
```

#### Compare Courses
```bash
GET /api/compare?ids=CS101,CS102,CS103
```

**Response:**
```json
{
  "success": true,
  "data": {
    "courses": [...],
    "comparison": {
      "requested": 3,
      "found": 3,
      "notFound": []
    },
    "summary": {
      "departments": ["Computer Science"],
      "levels": ["UG"],
      "avgRating": "4.50",
      "avgFee": "47000.00"
    }
  }
}
```

#### Natural Language Search
```bash
POST /api/ask
Content-Type: application/json

{
  "question": "Find UG computer science courses under 50000"
}
```

**Response:**
```json
{
  "success": true,
  "query": {
    "original": "Find UG computer science courses under 50000",
    "understood": [
      "Level: Undergraduate (UG)",
      "Department: Computer Science",
      "Fee: ≤ ₹50,000"
    ],
    "filtersApplied": 3
  },
  "results": {
    "count": 5,
    "courses": [...]
  },
  "message": "Found 5 courses matching your query"
}
```

### 🔒 **Protected Endpoints**

#### CSV Import (Requires Authentication)
```bash
POST /api/ingest
Authorization: Bearer your-secret-token
Content-Type: multipart/form-data

# Form data:
csvFile: [CSV file]
```

**Response:**
```json
{
  "success": true,
  "message": "CSV imported successfully",
  "stats": {
    "totalRows": 66,
    "coursesImported": 66,
    "departmentsCreated": 8,
    "departmentsFound": 0
  },
  "ingestType": "protected",
  "timestamp": "2025-09-30T10:45:23.567Z"
}
```

#### Public CSV Import (Development)
```bash
POST /api/import/csv
Content-Type: multipart/form-data

# Form data:
csvFile: [CSV file]
```

## 🧪 Testing

### Manual API Testing

#### 1. Test Course Search
```bash
# Basic search
curl "http://localhost:3000/api/courses"

# Filtered search
curl "http://localhost:3000/api/courses?level=UG&maxFee=50000"

# Search with pagination
curl "http://localhost:3000/api/courses?department=Computer&page=2&limit=5"
```

#### 2. Test Course Comparison
```bash
curl "http://localhost:3000/api/compare?ids=CS101,CS102,CS103"
```

#### 3. Test Natural Language Search
```bash
curl -X POST http://localhost:3000/api/ask \
  -H "Content-Type: application/json" \
  -d '{"question": "Find UG computer science courses under 50000"}'
```

#### 4. Test CSV Import
```bash
# Protected import (requires token)
curl -X POST http://localhost:3000/api/ingest \
  -H "Authorization: Bearer hello" \
  -F "csvFile=@./data/courses.csv"

# Public import (no token)
curl -X POST http://localhost:3000/api/import/csv \
  -F "csvFile=@./data/courses.csv"
```

### Sample CSV Format
```csv
course_id,course_name,department,level,delivery_mode,credits,duration_weeks,rating,tuition_fee_inr,year_offered
CS101,Introduction to Programming,Computer Science,UG,online,4,12,4.5,45000,2024
CS102,Data Structures and Algorithms,Computer Science,UG,offline,4,14,4.7,50000,2024
```

## 🗃️ Database Schema

### Tables
- **departments**: Master department data
- **courses**: Main course information with foreign key to departments

### Key Relationships
- One department can have many courses
- Courses reference departments by ID

### Indexes for Performance
- Department ID, Level, Tuition Fee, Rating, Delivery Mode

## 🛠️ Development

### Project Structure
```
CourseQuestLite/
├── server.js                 # Main Express server
├── prisma/
│   ├── schema.prisma         # Database schema
│   └── migrations/           # Database migrations
├── src/
│   ├── config/
│   │   └── database.js       # Database connection
│   ├── services/
│   │   ├── courseService.js  # Course business logic
│   │   ├── courseImportService.js  # CSV import logic
│   │   └── queryParserService.js   # Natural language parsing
│   ├── routes/
│   │   └── courseRoutes.js   # API routes
│   └── utils/
│       ├── csvparser.js      # CSV file parsing
│       └── validators.js     # Data validation
├── course-manag/             # React frontend
│   ├── src/
│   │   ├── components/       # React components
│   │   └── App.jsx          # Main app component
│   └── public/
│       └── diagram.png      # System architecture diagram
├── data/
│   └── courses.csv          # Sample data
└── uploads/                 # Temporary file uploads
```

### Available Scripts
```bash
npm start          # Start production server
npm run dev        # Start development server with nodemon
npm run import     # Import sample CSV data
npx prisma studio  # Open Prisma database browser
npx prisma migrate dev  # Create new migration
```

## 🔒 Security

- **Authentication**: Token-based authentication for protected endpoints
- **File Validation**: CSV file type and size validation
- **Input Sanitization**: Comprehensive input validation
- **CORS**: Cross-origin resource sharing enabled
- **Rate Limiting**: Consider implementing for production

## 🚀 Production Deployment

### Environment Variables
```bash
DATABASE_URL=postgresql://user:password@host:port/database
PORT=3000
NODE_ENV=production
API_TOKEN=your-secure-token-here
```

### Build Steps
```bash
# Install production dependencies
npm ci --only=production

# Generate Prisma client
npx prisma generate

# Run database migrations
npx prisma migrate deploy

# Build frontend
cd course-manag && npm run build

# Start server
npm start
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the ISC License - see the [LICENSE](LICENSE) file for details.

## 👥 Author

**Hrithik** - [GitHub](https://github.com/Hrithik-12)

---

## 📝 API Quick Reference

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/courses` | No | List/search courses with filters |
| GET | `/api/compare` | No | Compare multiple courses |
| POST | `/api/ask` | No | Natural language course search |
| POST | `/api/ingest` | Yes | Protected CSV import |
| POST | `/api/import/csv` | No | Public CSV import |
| GET | `/health` | No | Health check |

**Base URL**: `http://localhost:3000`

**Authentication**: Include `Authorization: Bearer <token>` header for protected endpoints.