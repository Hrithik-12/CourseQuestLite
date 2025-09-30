// src/utils/csvParser.js
const fs = require('fs');
const { parse } = require('csv-parse/sync');

/**
 * Parse CSV file into array of objects
 * @param {string} filePath - Path to CSV file
 * @returns {Array<Object>} Parsed CSV rows
 * @throws {Error} If file not found or parsing fails
 */
function parseCSV(filePath) {
  try {
    // Read file content
    const fileContent = fs.readFileSync(filePath, 'utf-8');
    
    // Parse CSV with options
    const records = parse(fileContent, {
      columns: true,           // First row = column names
      skip_empty_lines: true,  // Ignore empty rows
      trim: true,              // Remove whitespace from values
      cast: false              // Keep all values as strings (we'll cast later)
    });
    
    return records;
  } catch (error) {
    throw new Error(`CSV parsing failed: ${error.message}`);
  }
}

module.exports = { parseCSV };