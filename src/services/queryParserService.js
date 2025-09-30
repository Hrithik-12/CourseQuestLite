// src/services/queryParserService.js
const { prisma } = require('../config/database');

/**
 * Parse natural language query into database filters
 * @param {string} question - User's natural language question
 * @returns {Promise<Object>} { filters, summary }
 */
async function parseNaturalLanguageQuery(question) {
  // WHY: Convert to lowercase for case-insensitive matching
  // "UG" === "ug" === "Ug" should all work
  const lower = question.toLowerCase();
  
  // WHY: Store filters separately, easier to debug and test
  const filters = {};
  const detectedConditions = []; // For user feedback
  
  
  // ========================================
  // 1. LEVEL DETECTION (UG/PG)
  // ========================================
  // WHY: Check UG first, then PG (order matters if both keywords exist)
  // WHY: Multiple keywords because users say it differently
  if (lower.includes('ug') || lower.includes('undergraduate') || lower.includes('under graduate')) {
    filters.level = 'UG';
    detectedConditions.push('Level: Undergraduate (UG)');
  } else if (lower.includes('pg') || lower.includes('postgraduate') || lower.includes('post graduate') || lower.includes('graduate')) {
    filters.level = 'PG';
    detectedConditions.push('Level: Postgraduate (PG)');
  }
  
  
  // ========================================
  // 2. DELIVERY MODE DETECTION
  // ========================================
  // WHY: Exact string matching for mode (online/offline/hybrid)
  // WHY: No else-if because user might not mention mode at all
  if (lower.includes('online')) {
    filters.deliveryMode = 'online';
    detectedConditions.push('Mode: Online');
  } else if (lower.includes('offline') || lower.includes('in-person') || lower.includes('campus')) {
    filters.deliveryMode = 'offline';
    detectedConditions.push('Mode: Offline');
  } else if (lower.includes('hybrid') || lower.includes('blended')) {
    filters.deliveryMode = 'hybrid';
    detectedConditions.push('Mode: Hybrid');
  }
  
  
  // ========================================
  // 3. FEE FILTERING (Numeric Comparison)
  // ========================================
  // WHY: Regex to extract numbers - finds digits even in "50,000" or "50000"
  // Pattern: Look for "under/below/less" + number
  const feeUnderMatch = lower.match(/(?:under|below|less than|max|maximum|upto|up to)\s*(\d+(?:,\d+)?)/);
  if (feeUnderMatch) {
    // WHY: Remove commas and parse as integer
    const feeLimit = parseInt(feeUnderMatch[1].replace(/,/g, ''));
    filters.tuitionFee = { lte: feeLimit }; // lte = Less Than or Equal
    detectedConditions.push(`Fee: ≤ ₹${feeLimit.toLocaleString()}`);
  }
  
  // Pattern: Look for "above/over/more" + number
  const feeAboveMatch = lower.match(/(?:above|over|more than|greater than|min|minimum)\s*(\d+(?:,\d+)?)/);
  if (feeAboveMatch) {
    const feeMin = parseInt(feeAboveMatch[1].replace(/,/g, ''));
    filters.tuitionFee = { gte: feeMin }; // gte = Greater Than or Equal
    detectedConditions.push(`Fee: ≥ ₹${feeMin.toLocaleString()}`);
  }
  
  
  // ========================================
  // 4. RATING FILTERING
  // ========================================
  // WHY: Similar to fee, but expects decimal (4.5 not 4500)
  // WHY: Regex allows "rating above 4" or "rating 4+" or "4 stars"
  const ratingMatch = lower.match(/rating\s*(?:above|over|greater than|more than)?\s*(\d+(?:\.\d+)?)/);
  if (ratingMatch) {
    const minRating = parseFloat(ratingMatch[1]);
    filters.rating = { gte: minRating };
    detectedConditions.push(`Rating: ≥ ${minRating}⭐`);
  }
  
  
  // ========================================
  // 5. CREDITS FILTERING
  // ========================================
  // WHY: Some users search by credit hours
  const creditsMatch = lower.match(/(?:(\d+)\s*credits?|credits?\s*(?:above|over|more than)?\s*(\d+))/);
  if (creditsMatch) {
    const credits = parseInt(creditsMatch[1] || creditsMatch[2]);
    filters.credits = { gte: credits };
    detectedConditions.push(`Credits: ≥ ${credits}`);
  }
  
  
  // ========================================
  // 6. YEAR OFFERED
  // ========================================
  // WHY: Match 4-digit years (2020-2029)
  const yearMatch = lower.match(/\b(202\d)\b/);
  if (yearMatch) {
    filters.yearOffered = parseInt(yearMatch[1]);
    detectedConditions.push(`Year: ${yearMatch[1]}`);
  }
  
  
  // ========================================
  // 7. DEPARTMENT DETECTION (Most Complex!)
  // ========================================
  // WHY: We need to check against actual department names in DB
  // WHY: This is async because we query database
  
  // First, get all department names from database
  const departments = await prisma.department.findMany({
    select: { id: true, name: true }
  });
  
  // WHY: Create a mapping for common abbreviations/variations
  const departmentAliases = {
    'cs': 'Computer Science',
    'cse': 'Computer Science',
    'computer science': 'Computer Science',
    'it': 'Information Technology',
    'information technology': 'Information Technology',
    'ee': 'Electrical Engineering',
    'electrical': 'Electrical Engineering',
    'me': 'Mechanical Engineering',
    'mechanical': 'Mechanical Engineering',
    'ece': 'Electronics',
    'electronics': 'Electronics',
    'civil': 'Civil Engineering',
    'chemical': 'Chemical Engineering',
    'ba': 'Business Administration',
    'business': 'Business Administration',
    'mba': 'Business Administration',
    'economics': 'Economics',
    'econ': 'Economics',
    'physics': 'Physics',
    'chemistry': 'Chemistry',
    'data science': 'Data Analytics',
    'data analytics': 'Data Analytics',
    'analytics': 'Data Analytics'
  };
  
  // Check if question mentions any department
  for (const dept of departments) {
    const deptNameLower = dept.name.toLowerCase();
    
    // WHY: Check both exact name and aliases
    if (lower.includes(deptNameLower)) {
      filters.departmentId = dept.id;
      detectedConditions.push(`Department: ${dept.name}`);
      break; // WHY: Stop after first match
    }
    
    // Check aliases
    for (const [alias, fullName] of Object.entries(departmentAliases)) {
      if (lower.includes(alias) && fullName === dept.name) {
        filters.departmentId = dept.id;
        detectedConditions.push(`Department: ${dept.name}`);
        break;
      }
    }
  }
  
  
  // ========================================
  // 8. RETURN STRUCTURED RESPONSE
  // ========================================
  return {
    filters,  // For Prisma query
    detectedConditions,  // For user feedback
    originalQuestion: question  // For logging/debugging
  };
}


/**
 * Search courses using parsed filters
 * @param {Object} filters - Prisma where clause
 * @returns {Promise<Array>} Matching courses with department info
 */
async function searchCourses(filters) {
  // WHY: Include department relation for complete course info
  // WHY: orderBy rating - show best courses first
  const courses = await prisma.course.findMany({
    where: filters,
    include: {
      department: {
        select: { name: true }  // WHY: Only get department name, not entire object
      }
    },
    orderBy: [
      { rating: 'desc' },  // Best rated first
      { tuitionFee: 'asc' }  // Then cheapest
    ]
  });
  
  // WHY: Transform data for cleaner API response
  return courses.map(course => ({
    course_id: course.id,
    course_name: course.name,
    department: course.department.name,
    level: course.level,
    delivery_mode: course.deliveryMode,
    credits: course.credits,
    duration_weeks: course.durationWeeks,
    rating: parseFloat(course.rating),
    tuition_fee_inr: parseFloat(course.tuitionFee),
    year_offered: course.yearOffered
  }));
}


module.exports = {
  parseNaturalLanguageQuery,
  searchCourses
};