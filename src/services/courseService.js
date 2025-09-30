// src/services/courseService.js
const { prisma } = require('../config/database');

/**
 * Get courses with filters and pagination
 */
async function getCourses(filters = {}) {
  const { 
    page = 1, 
    limit = 10, 
    department, 
    level, 
    deliveryMode, 
    minRating, 
    maxFee, 
    search 
  } = filters;

  // Build where clause based on filters
  const where = {};
  
  if (department) {
    where.department = { name: { contains: department, mode: 'insensitive' } };
  }
  
  if (level) {
    where.level = level.toUpperCase();
  }
  
  if (deliveryMode) {
    where.deliveryMode = deliveryMode.toLowerCase();
  }
  
  if (minRating) {
    where.rating = { gte: parseFloat(minRating) };
  }
  
  if (maxFee) {
    where.tuitionFee = { lte: parseFloat(maxFee) };
  }
  
  if (search) {
    where.OR = [
      { name: { contains: search, mode: 'insensitive' } },
      { id: { contains: search, mode: 'insensitive' } }
    ];
  }

  // Calculate pagination
  const pageNum = Math.max(1, parseInt(page));
  const pageSize = Math.max(1, Math.min(100, parseInt(limit))); // Max 100 per page
  const skip = (pageNum - 1) * pageSize;

  // Get total count for pagination info
  const totalCourses = await prisma.course.count({ where });
  const totalPages = Math.ceil(totalCourses / pageSize);

  // Fetch courses with filters and pagination
  const courses = await prisma.course.findMany({
    where,
    include: {
      department: {
        select: { name: true }
      }
    },
    orderBy: [
      { rating: 'desc' },
      { name: 'asc' }
    ],
    skip,
    take: pageSize
  });

  return {
    courses,
    pagination: {
      currentPage: pageNum,
      pageSize,
      totalCourses,
      totalPages,
      hasNextPage: pageNum < totalPages,
      hasPrevPage: pageNum > 1
    },
    filters: {
      department: department || null,
      level: level || null,
      deliveryMode: deliveryMode || null,
      minRating: minRating || null,
      maxFee: maxFee || null,
      search: search || null
    }
  };
}

/**
 * Compare courses by IDs
 */
async function compareCourses(courseIds) {
  if (!courseIds || courseIds.length === 0) {
    throw new Error('At least one course ID is required');
  }

  if (courseIds.length > 10) {
    throw new Error('Maximum 10 courses can be compared at once');
  }

  // Fetch courses
  const courses = await prisma.course.findMany({
    where: {
      id: { in: courseIds }
    },
    include: {
      department: {
        select: { name: true }
      }
    },
    orderBy: { name: 'asc' }
  });

  // Check if all requested courses were found
  const foundIds = courses.map(c => c.id);
  const notFoundIds = courseIds.filter(id => !foundIds.includes(id));

  return {
    courses,
    comparison: {
      requested: courseIds.length,
      found: courses.length,
      notFound: notFoundIds
    },
    summary: {
      departments: [...new Set(courses.map(c => c.department.name))],
      levels: [...new Set(courses.map(c => c.level))],
      deliveryModes: [...new Set(courses.map(c => c.deliveryMode))],
      avgRating: courses.length > 0 ? 
        (courses.reduce((sum, c) => sum + parseFloat(c.rating), 0) / courses.length).toFixed(2) : 0,
      avgFee: courses.length > 0 ? 
        (courses.reduce((sum, c) => sum + parseFloat(c.tuitionFee), 0) / courses.length).toFixed(2) : 0
    }
  };
}

module.exports = {
  getCourses,
  compareCourses
};