
# Test Configuration for CourseQuestLite

This directory contains tests for the core functionality of the CourseQuestLite application.

## Test Structure

- `parsing.test.js` - Tests for natural language query parsing
- `endpoints.test.js` - Tests for API endpoints (courses, compare, ask)
- `csvValidation.test.js` - Tests for CSV data validation

## Running Tests

### Prerequisites
Install test dependencies:
```bash
npm install --save-dev jest supertest
```

### Run All Tests
```bash
npm test
```

### Run Specific Test File
```bash
npx jest tests/parsing.test.js
npx jest tests/endpoints.test.js
npx jest tests/csvValidation.test.js
```

### Run Tests in Watch Mode
```bash
npx jest --watch
```

### Generate Coverage Report
```bash
npx jest --coverage
```

## Test Coverage

The tests cover:

### 1. Natural Language Parsing (`parsing.test.js`)
- Level detection (UG/PG)
- Department parsing (full names and aliases)
- Fee range parsing (under/above)
- Delivery mode detection
- Rating requirements
- Complex multi-filter queries
- Case insensitive matching

### 2. API Endpoints (`endpoints.test.js`)
- Course listing with pagination
- Filtering by department, level, fee, rating
- Search functionality
- Course comparison
- Natural language search endpoint
- Error handling

### 3. CSV Validation (`csvValidation.test.js`)
- Required field validation
- Data type validation
- Enum value validation (level, delivery_mode)
- Range validation (rating, year, fee)
- Batch validation of multiple rows

## Mock Data

Tests use mocked database responses to avoid dependency on actual database connection. This ensures:
- Fast test execution
- Reliable test results
- No need for test database setup

## Expected Test Results

All tests should pass with proper functionality. Example output:
```
 PASS  tests/parsing.test.js
 PASS  tests/endpoints.test.js
 PASS  tests/csvValidation.test.js

Test Suites: 3 passed, 3 total
Tests:       XX passed, XX total
```

## Adding New Tests

When adding new functionality:
1. Add corresponding tests in appropriate file
2. Use descriptive test names
3. Test both success and failure cases
4. Mock external dependencies