// src/routes/courseRoutes.js
const express = require('express');
const multer = require('multer');
const fs = require('fs');
const { getCourses, compareCourses } = require('../services/courseService');
const { parseNaturalLanguageQuery, searchCourses } = require('../services/queryParserService');

const router = express.Router();


/**
 * GET /api/courses - Get courses with filters and pagination
 */
router.get('/courses', async (req, res) => {
  try {
    const result = await getCourses(req.query);
    
    res.json({
      success: true,
      data: result.courses,
      pagination: result.pagination,
      filters: result.filters
    });

  } catch (error) {
    console.error('❌ Get courses error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching courses',
      error: error.message
    });
  }
});

/**
 * GET /api/compare?ids=CS101,CS102,CS103 - Compare courses
 */
router.get('/compare', async (req, res) => {
  try {
    const { ids } = req.query;
    
    if (!ids) {
      return res.status(400).json({
        success: false,
        message: 'Course IDs are required. Use ?ids=CS101,CS102,CS103'
      });
    }

    // Parse comma-separated IDs
    const courseIds = ids.split(',').map(id => id.trim()).filter(id => id.length > 0);
    
    const result = await compareCourses(courseIds);
    
    res.json({
      success: true,
      data: result
    });

  } catch (error) {
    console.error('❌ Compare courses error:', error);
    res.status(500).json({
      success: false,
      message: 'Error comparing courses',
      error: error.message
    });
  }
});

/**
 * POST /api/ask - Natural Language Course Search
 * Body: { "question": "Find UG computer science courses under 50000" }
 */
router.post('/ask', async (req, res) => {
  try {
    const { question } = req.body;
    
    if (!question || typeof question !== 'string' || question.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Question is required',
        example: { question: "Find UG computer science courses under 50000" }
      });
    }

    console.log(`🤖 AI Query: "${question}"`);
    
    // Parse natural language query into filters
    const { filters, detectedConditions, originalQuestion } = await parseNaturalLanguageQuery(question);
    
    // Search courses using parsed filters
    const courses = await searchCourses(filters);
    
    // Prepare response
    const response = {
      success: true,
      query: {
        original: originalQuestion,
        understood: detectedConditions.length > 0 ? detectedConditions : ['No specific filters detected - showing all courses'],
        filtersApplied: Object.keys(filters).length
      },
      results: {
        count: courses.length,
        courses: courses
      }
    };

    // Handle no results gracefully
    if (courses.length === 0) {
      response.message = 'No matching courses found';
      response.suggestions = [
        'Try removing some filters (e.g., fee limits)',
        'Check spelling of department names',
        'Try different keywords (e.g., "online" instead of "remote")',
        'Browse all courses with GET /api/courses'
      ];
    } else {
      response.message = `Found ${courses.length} course${courses.length === 1 ? '' : 's'} matching your query`;
    }

    res.json(response);

  } catch (error) {
    console.error('❌ Ask AI endpoint error:', error);
    res.status(500).json({
      success: false,
      message: 'Error processing natural language query',
      error: error.message
    });
  }
});

module.exports = router;