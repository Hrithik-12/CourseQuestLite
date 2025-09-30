// src/config/database.js
require('dotenv').config();
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient({
  log: ['query', 'error', 'warn'], // Logs SQL queries (helpful for debugging)
});

// Test connection function
async function testConnection() {
  try {
    await prisma.$connect();
    console.log('✅ Database connected successfully!');
    
    // Check if tables exist
    const departmentCount = await prisma.department.count();
    const courseCount = await prisma.course.count();
    
    console.log(`📊 Current data - Departments: ${departmentCount}, Courses: ${courseCount}`);
    
    return true;
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    return false;
  } finally {
    await prisma.$disconnect();
  }
}

// Export for use in other files
module.exports = { prisma, testConnection };

// Run test if this file is executed directly
if (require.main === module) {
  testConnection();
}