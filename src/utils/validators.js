// src/utils/validators.js

/**
 * Validate a single course row
 * @param {Object} row - CSV row object
 * @param {number} rowIndex - Row number (for error reporting)
 * @returns {Object} { valid: boolean, errors: Array<string> }
 */
function validateCourseRow(row, rowIndex) {
  const errors = [];
  
  // course_id validation
  if (!row.course_id || row.course_id.trim() === '') {
    errors.push(`Row ${rowIndex}: course_id is required`);
  } else if (row.course_id.length > 20) {
    errors.push(`Row ${rowIndex}: course_id must be max 20 characters`);
  }
  
  // course_name validation
  if (!row.course_name || row.course_name.trim() === '') {
    errors.push(`Row ${rowIndex}: course_name is required`);
  }
  
  // department validation
  if (!row.department || row.department.trim() === '') {
    errors.push(`Row ${rowIndex}: department is required`);
  }
  
  // level validation (must be UG or PG)
  if (!['UG', 'PG'].includes(row.level)) {
    errors.push(`Row ${rowIndex}: level must be 'UG' or 'PG', got '${row.level}'`);
  }
  
  // delivery_mode validation
  if (!['online', 'offline', 'hybrid'].includes(row.delivery_mode)) {
    errors.push(`Row ${rowIndex}: delivery_mode must be 'online', 'offline', or 'hybrid'`);
  }
  
  // credits validation (positive integer)
  const credits = parseInt(row.credits);
  if (isNaN(credits) || credits <= 0) {
    errors.push(`Row ${rowIndex}: credits must be a positive integer`);
  }
  
  // duration_weeks validation
  const duration = parseInt(row.duration_weeks);
  if (isNaN(duration) || duration <= 0) {
    errors.push(`Row ${rowIndex}: duration_weeks must be a positive integer`);
  }
  
  // rating validation (0-5, max 1 decimal)
  const rating = parseFloat(row.rating);
  if (isNaN(rating) || rating < 0 || rating > 5) {
    errors.push(`Row ${rowIndex}: rating must be between 0 and 5`);
  }
  
  // tuition_fee_inr validation
  const fee = parseFloat(row.tuition_fee_inr);
  if (isNaN(fee) || fee < 0) {
    errors.push(`Row ${rowIndex}: tuition_fee_inr must be a positive number`);
  }
  
  // year_offered validation (realistic range)
  const year = parseInt(row.year_offered);
  if (isNaN(year) || year < 2000 || year > 2030) {
    errors.push(`Row ${rowIndex}: year_offered must be between 2000 and 2030`);
  }
  
  return {
    valid: errors.length === 0,
    errors
  };
}

/**
 * Validate all CSV rows
 * @param {Array<Object>} rows - Array of CSV row objects
 * @returns {Object} { validRows: Array, errors: Array }
 */
function validateAllRows(rows) {
  const validRows = [];
  const allErrors = [];
  
  rows.forEach((row, index) => {
    const { valid, errors } = validateCourseRow(row, index + 2); // +2 because CSV row 1 is headers
    
    if (valid) {
      validRows.push(row);
    } else {
      allErrors.push(...errors);
    }
  });
  
  return {
    validRows,
    errors: allErrors,
    totalRows: rows.length,
    validCount: validRows.length,
    errorCount: rows.length - validRows.length
  };
}

module.exports = { validateCourseRow, validateAllRows };