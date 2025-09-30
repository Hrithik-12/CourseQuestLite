// src/services/courseImportService.js
const { prisma } = require('../config/database');
const { parseCSV } = require('../utils/csvparser');
const { validateAllRows } = require('../utils/validators');

/**
 * Import courses from CSV file
 * @param {string} filePath - Path to CSV file
 * @returns {Promise<Object>} Import result with stats and errors
 */
async function importCoursesFromCSV(filePath) {
  try {
    // Step 1: Parse CSV
    console.log('📄 Parsing CSV file...');
    const rows = parseCSV(filePath);
    console.log(`✓ Parsed ${rows.length} rows`);
    
    // Step 2: Validate all rows
    console.log('🔍 Validating data...');
    const { validRows, errors, validCount, errorCount } = validateAllRows(rows);
    
    if (errors.length > 0) {
      console.log(`⚠️  Found ${errorCount} invalid rows`);
      return {
        success: false,
        message: 'Validation failed',
        errors,
        stats: {
          totalRows: rows.length,
          validRows: validCount,
          invalidRows: errorCount
        }
      };
    }
    
    console.log(`✓ All ${validCount} rows are valid`);
    
    // Step 3: Extract unique departments
    const departmentNames = new Set(validRows.map(row => row.department));
    console.log(`📚 Found ${departmentNames.size} unique departments`);
    
    // Step 4: Import data in transaction
    console.log('💾 Starting database import...');
    const result = await prisma.$transaction(async (tx) => {
      // 4a. Get existing departments
      console.log('  → Checking existing departments...');
      const existingDepartments = await tx.department.findMany({
        where: { name: { in: Array.from(departmentNames) } }
      });
      
      const existingDeptNames = new Set(existingDepartments.map(d => d.name));
      const newDepartmentNames = Array.from(departmentNames).filter(name => !existingDeptNames.has(name));
      
      // 4b. Bulk create new departments
      let newDepartments = [];
      if (newDepartmentNames.length > 0) {
        console.log(`  → Creating ${newDepartmentNames.length} new departments...`);
        await tx.department.createMany({
          data: newDepartmentNames.map(name => ({ name })),
          skipDuplicates: true
        });
        
        // Fetch the newly created departments
        newDepartments = await tx.department.findMany({
          where: { name: { in: newDepartmentNames } }
        });
      }
      
      // 4c. Create department mapping
      const departmentMap = {};
      [...existingDepartments, ...newDepartments].forEach(dept => {
        departmentMap[dept.name] = dept.id;
      });
      
      // 4d. Transform CSV rows to Course objects
      console.log('  → Transforming course data...');
      const coursesToInsert = validRows.map(row => ({
        id: row.course_id,
        name: row.course_name,
        departmentId: departmentMap[row.department],
        level: row.level,
        deliveryMode: row.delivery_mode,
        credits: parseInt(row.credits),
        durationWeeks: parseInt(row.duration_weeks),
        rating: parseFloat(row.rating),
        tuitionFee: parseFloat(row.tuition_fee_inr),
        yearOffered: parseInt(row.year_offered)
      }));
      
      // 4e. Bulk insert courses
      console.log('  → Inserting courses...');
      const insertResult = await tx.course.createMany({
        data: coursesToInsert,
        skipDuplicates: true  // Skip if course_id already exists
      });
      
      return {
        coursesImported: insertResult.count,
        departmentsCreated: newDepartmentNames.length,
        departmentsFound: existingDepartments.length
      };
    }, {
      timeout: 30000, // 30 second timeout
    });
    
    console.log('✅ Import completed successfully!');
    
    return {
      success: true,
      message: 'CSV imported successfully',
      stats: {
        totalRows: rows.length,
        coursesImported: result.coursesImported,
        departmentsCreated: result.departmentsCreated,
        departmentsFound: result.departmentsFound
      }
    };
    
  } catch (error) {
    console.error('❌ Import failed:', error.message);
    return {
      success: false,
      message: 'Import failed',
      error: error.message
    };
  }
}

module.exports = { importCoursesFromCSV };