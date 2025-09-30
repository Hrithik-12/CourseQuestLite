// tests/endpoints.test.js
const request = require('supertest');
const express = require('express');

// Create a test app
const app = express();
app.use(express.json());

// Mock the database configuration first
const mockPrisma = {
  course: {
    findMany: jest.fn(),
    count: jest.fn()
  },
  department: {
    findMany: jest.fn().mockResolvedValue([
      { id: 1, name: 'Computer Science' },
      { id: 2, name: 'Electrical Engineering' }
    ])
  }
};

jest.mock('../src/config/database', () => ({
  prisma: mockPrisma
}));

// Mock the queryParserService to avoid database dependency
const mockParseNaturalLanguageQuery = jest.fn().mockResolvedValue({
  filters: { level: 'UG' },
  detectedConditions: ['Level: Undergraduate (UG)'],
  originalQuestion: 'Find UG computer science courses'
});

const mockSearchCourses = jest.fn().mockResolvedValue([
  {
    course_id: 'CS101',
    course_name: 'Introduction to Programming',
    department: 'Computer Science',
    level: 'UG',
    rating: 4.5
  }
]);

jest.mock('../src/services/queryParserService', () => ({
  parseNaturalLanguageQuery: mockParseNaturalLanguageQuery,
  searchCourses: mockSearchCourses
}));

const courseRoutes = require('../src/routes/courseRoutes');

// Mount routes
app.use('/api', courseRoutes);

describe('Course API Endpoints', () => {

  beforeEach(() => {
    jest.clearAllMocks();
    // Reset mock implementations
    mockPrisma.course.count.mockResolvedValue(1);
    mockPrisma.course.findMany.mockResolvedValue([]);
    
    // Reset query parser mocks
    mockParseNaturalLanguageQuery.mockResolvedValue({
      filters: { level: 'UG' },
      detectedConditions: ['Level: Undergraduate (UG)'],
      originalQuestion: 'Find UG computer science courses'
    });
    
    mockSearchCourses.mockResolvedValue([
      {
        course_id: 'CS101',
        course_name: 'Introduction to Programming',
        department: 'Computer Science',
        level: 'UG',
        rating: 4.5
      }
    ]);
  });

  describe('GET /api/courses', () => {
    
    test('should return courses with default pagination', async () => {
      const mockCourses = [
        {
          id: 'CS101',
          name: 'Introduction to Programming',
          department: { name: 'Computer Science' },
          level: 'UG',
          deliveryMode: 'online',
          credits: 4,
          durationWeeks: 12,
          rating: '4.5',
          tuitionFee: '45000',
          yearOffered: 2024
        }
      ];

      mockPrisma.course.count.mockResolvedValue(1);
      mockPrisma.course.findMany.mockResolvedValue(mockCourses);

      const response = await request(app)
        .get('/api/courses')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toEqual(mockCourses);
      expect(response.body.pagination).toMatchObject({
        currentPage: 1,
        pageSize: 10,
        totalCourses: 1,
        totalPages: 1
      });
    });

    test('should handle filtering by department', async () => {
      const response = await request(app)
        .get('/api/courses?department=Computer%20Science')
        .expect(200);

      expect(mockPrisma.course.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            department: {
              name: {
                contains: 'Computer Science',
                mode: 'insensitive'
              }
            }
          })
        })
      );
    });

    test('should handle filtering by level', async () => {
      await request(app)
        .get('/api/courses?level=UG')
        .expect(200);

      expect(mockPrisma.course.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            level: 'UG'
          })
        })
      );
    });

    test('should handle filtering by maximum fee', async () => {
      await request(app)
        .get('/api/courses?maxFee=50000')
        .expect(200);

      expect(mockPrisma.course.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            tuitionFee: { lte: 50000 }
          })
        })
      );
    });

    test('should handle pagination parameters', async () => {
      await request(app)
        .get('/api/courses?page=2&limit=5')
        .expect(200);

      expect(mockPrisma.course.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          skip: 5,
          take: 5
        })
      );
    });

    test('should handle search parameter', async () => {
      await request(app)
        .get('/api/courses?search=programming')
        .expect(200);

      expect(mockPrisma.course.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            OR: [
              { name: { contains: 'programming', mode: 'insensitive' } },
              { id: { contains: 'programming', mode: 'insensitive' } }
            ]
          })
        })
      );
    });

  });

  describe('GET /api/compare', () => {

    test('should return error when no IDs provided', async () => {
      const response = await request(app)
        .get('/api/compare')
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('Course IDs are required');
    });

    test('should compare courses successfully', async () => {
      const mockCourses = [
        {
          id: 'CS101',
          name: 'Introduction to Programming',
          department: { name: 'Computer Science' },
          level: 'UG',
          rating: '4.5',
          tuitionFee: '45000'
        },
        {
          id: 'CS102',
          name: 'Data Structures',
          department: { name: 'Computer Science' },
          level: 'UG',
          rating: '4.7',
          tuitionFee: '50000'
        }
      ];

      mockPrisma.course.findMany.mockResolvedValue(mockCourses);

      const response = await request(app)
        .get('/api/compare?ids=CS101,CS102')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.courses).toEqual(mockCourses);
      expect(response.body.data.comparison).toMatchObject({
        requested: 2,
        found: 2,
        notFound: []
      });
      expect(response.body.data.summary).toHaveProperty('avgRating');
      expect(response.body.data.summary).toHaveProperty('avgFee');
    });

    test('should handle missing course IDs', async () => {
      const mockCourses = [
        {
          id: 'CS101',
          name: 'Introduction to Programming',
          department: { name: 'Computer Science' }
        }
      ];

      mockPrisma.course.findMany.mockResolvedValue(mockCourses);

      const response = await request(app)
        .get('/api/compare?ids=CS101,CS999')
        .expect(200);

      expect(response.body.data.comparison).toMatchObject({
        requested: 2,
        found: 1,
        notFound: ['CS999']
      });
    });

  });

  describe('POST /api/ask', () => {

    test('should return error when no question provided', async () => {
      const response = await request(app)
        .post('/api/ask')
        .send({})
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('Question is required');
    });

    test('should return error for empty question', async () => {
      const response = await request(app)
        .post('/api/ask')
        .send({ question: '' })
        .expect(400);

      expect(response.body.success).toBe(false);
    });

    test('should process natural language query successfully', async () => {
      const response = await request(app)
        .post('/api/ask')
        .send({ question: 'Find UG computer science courses' })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.query).toHaveProperty('original');
      expect(response.body.query).toHaveProperty('understood');
      expect(response.body.results).toHaveProperty('count');
      expect(response.body.results).toHaveProperty('courses');
    });

  });

});

describe('API Error Handling', () => {

  test('should handle database errors gracefully', async () => {
    mockPrisma.course.findMany.mockRejectedValue(new Error('Database connection failed'));

    const response = await request(app)
      .get('/api/courses')
      .expect(500);

    expect(response.body.success).toBe(false);
    expect(response.body.message).toContain('Error fetching courses');
  });

});