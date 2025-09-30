// tests/parsing.test.js

// Mock the database first, before importing the module
const mockDepartments = [
  { id: 1, name: 'Computer Science' },
  { id: 2, name: 'Electrical Engineering' },
  { id: 3, name: 'Mechanical Engineering' },
  { id: 4, name: 'Business Administration' },
  { id: 5, name: 'Data Analytics' }
];

const mockPrisma = {
  department: {
    findMany: jest.fn().mockResolvedValue(mockDepartments)
  }
};

jest.mock('../src/config/database', () => ({
  prisma: mockPrisma
}));

const { parseNaturalLanguageQuery } = require('../src/services/queryParserService');

describe('Natural Language Query Parsing', () => {
  
  beforeEach(() => {
    // Reset the mock before each test
    mockPrisma.department.findMany.mockResolvedValue(mockDepartments);
  });
  
  test('should parse UG level correctly', async () => {
    const result = await parseNaturalLanguageQuery('Find UG courses');
    
    expect(result.filters.level).toBe('UG');
    expect(result.detectedConditions).toContain('Level: Undergraduate (UG)');
  });

  test('should parse PG level correctly', async () => {
    const result = await parseNaturalLanguageQuery('Show postgraduate programs');
    
    expect(result.filters.level).toBe('PG');
    expect(result.detectedConditions).toContain('Level: Postgraduate (PG)');
  });

  test('should parse department by full name', async () => {
    const result = await parseNaturalLanguageQuery('Computer Science courses');
    
    expect(result.filters.departmentId).toBe(1);
    expect(result.detectedConditions).toContain('Department: Computer Science');
  });

  test('should parse department by alias', async () => {
    const result = await parseNaturalLanguageQuery('Find CS programs');
    
    expect(result.filters.departmentId).toBe(1);
    expect(result.detectedConditions).toContain('Department: Computer Science');
  });

  test('should parse fee limit (under)', async () => {
    const result = await parseNaturalLanguageQuery('courses under 50000');
    
    expect(result.filters.tuitionFee).toEqual({ lte: 50000 });
    expect(result.detectedConditions).toContain('Fee: ≤ ₹50,000');
  });

  test('should parse fee limit (above)', async () => {
    const result = await parseNaturalLanguageQuery('courses above 70000');
    
    expect(result.filters.tuitionFee).toEqual({ gte: 70000 });
    expect(result.detectedConditions).toContain('Fee: ≥ ₹70,000');
  });

  test('should parse delivery mode - online', async () => {
    const result = await parseNaturalLanguageQuery('online courses');
    
    expect(result.filters.deliveryMode).toBe('online');
    expect(result.detectedConditions).toContain('Mode: Online');
  });

  test('should parse delivery mode - offline', async () => {
    const result = await parseNaturalLanguageQuery('campus classes');
    
    expect(result.filters.deliveryMode).toBe('offline');
    expect(result.detectedConditions).toContain('Mode: Offline');
  });

  test('should parse rating requirement', async () => {
    const result = await parseNaturalLanguageQuery('rating above 4.5');
    
    expect(result.filters.rating).toEqual({ gte: 4.5 });
    expect(result.detectedConditions).toContain('Rating: ≥ 4.5⭐');
  });

  test('should handle complex query with multiple filters', async () => {
    const result = await parseNaturalLanguageQuery('Find UG Computer Science online courses under 50000 with rating above 4');
    
    expect(result.filters.level).toBe('UG');
    expect(result.filters.departmentId).toBe(1);
    expect(result.filters.deliveryMode).toBe('online');
    expect(result.filters.tuitionFee).toEqual({ lte: 50000 });
    expect(result.filters.rating).toEqual({ gte: 4 });
    
    expect(result.detectedConditions).toHaveLength(5);
  });

  test('should handle query with no specific filters', async () => {
    const result = await parseNaturalLanguageQuery('show all available programs');
    
    expect(Object.keys(result.filters)).toHaveLength(0);
    expect(result.detectedConditions).toHaveLength(0);
  });

  test('should parse fee with commas', async () => {
    const result = await parseNaturalLanguageQuery('courses under 50,000');
    
    expect(result.filters.tuitionFee).toEqual({ lte: 50000 });
  });

  test('should handle case insensitive matching', async () => {
    const result = await parseNaturalLanguageQuery('FIND ug COMPUTER SCIENCE COURSES');
    
    expect(result.filters.level).toBe('UG');
    expect(result.filters.departmentId).toBe(1);
  });

});

module.exports = {
  parseNaturalLanguageQuery
};