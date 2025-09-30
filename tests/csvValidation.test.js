// tests/csvValidation.test.js
const { validateCourseRow, validateAllRows } = require('../src/utils/validators');

describe('CSV Validation', () => {

  describe('validateCourseRow', () => {

    test('should validate correct course row', () => {
      const validRow = {
        course_id: 'CS101',
        course_name: 'Introduction to Programming',
        department: 'Computer Science',
        level: 'UG',
        delivery_mode: 'online',
        credits: '4',
        duration_weeks: '12',
        rating: '4.5',
        tuition_fee_inr: '45000',
        year_offered: '2024'
      };

      const result = validateCourseRow(validRow, 1);
      
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    test('should detect missing course_id', () => {
      const invalidRow = {
        course_id: '',
        course_name: 'Test Course',
        department: 'Computer Science',
        level: 'UG',
        delivery_mode: 'online',
        credits: '4',
        duration_weeks: '12',
        rating: '4.5',
        tuition_fee_inr: '45000',
        year_offered: '2024'
      };

      const result = validateCourseRow(invalidRow, 2);
      
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Row 2: course_id is required');
    });

    test('should detect invalid level', () => {
      const invalidRow = {
        course_id: 'CS101',
        course_name: 'Test Course',
        department: 'Computer Science',
        level: 'INVALID',
        delivery_mode: 'online',
        credits: '4',
        duration_weeks: '12',
        rating: '4.5',
        tuition_fee_inr: '45000',
        year_offered: '2024'
      };

      const result = validateCourseRow(invalidRow, 3);
      
      expect(result.valid).toBe(false);
      expect(result.errors).toContain("Row 3: level must be 'UG' or 'PG', got 'INVALID'");
    });

    test('should detect invalid delivery_mode', () => {
      const invalidRow = {
        course_id: 'CS101',
        course_name: 'Test Course',
        department: 'Computer Science',
        level: 'UG',
        delivery_mode: 'invalid_mode',
        credits: '4',
        duration_weeks: '12',
        rating: '4.5',
        tuition_fee_inr: '45000',
        year_offered: '2024'
      };

      const result = validateCourseRow(invalidRow, 4);
      
      expect(result.valid).toBe(false);
      expect(result.errors).toContain("Row 4: delivery_mode must be 'online', 'offline', or 'hybrid'");
    });

    test('should detect invalid credits', () => {
      const invalidRow = {
        course_id: 'CS101',
        course_name: 'Test Course',
        department: 'Computer Science',
        level: 'UG',
        delivery_mode: 'online',
        credits: 'invalid',
        duration_weeks: '12',
        rating: '4.5',
        tuition_fee_inr: '45000',
        year_offered: '2024'
      };

      const result = validateCourseRow(invalidRow, 5);
      
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Row 5: credits must be a positive integer');
    });

    test('should detect invalid rating range', () => {
      const invalidRow = {
        course_id: 'CS101',
        course_name: 'Test Course',
        department: 'Computer Science',
        level: 'UG',
        delivery_mode: 'online',
        credits: '4',
        duration_weeks: '12',
        rating: '6.0',
        tuition_fee_inr: '45000',
        year_offered: '2024'
      };

      const result = validateCourseRow(invalidRow, 6);
      
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Row 6: rating must be between 0 and 5');
    });

    test('should detect invalid year range', () => {
      const invalidRow = {
        course_id: 'CS101',
        course_name: 'Test Course',
        department: 'Computer Science',
        level: 'UG',
        delivery_mode: 'online',
        credits: '4',
        duration_weeks: '12',
        rating: '4.5',
        tuition_fee_inr: '45000',
        year_offered: '1999'
      };

      const result = validateCourseRow(invalidRow, 7);
      
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Row 7: year_offered must be between 2000 and 2030');
    });

    test('should detect negative tuition fee', () => {
      const invalidRow = {
        course_id: 'CS101',
        course_name: 'Test Course',
        department: 'Computer Science',
        level: 'UG',
        delivery_mode: 'online',
        credits: '4',
        duration_weeks: '12',
        rating: '4.5',
        tuition_fee_inr: '-1000',
        year_offered: '2024'
      };

      const result = validateCourseRow(invalidRow, 8);
      
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Row 8: tuition_fee_inr must be a positive number');
    });

  });

  describe('validateAllRows', () => {

    test('should validate array of rows', () => {
      const rows = [
        {
          course_id: 'CS101',
          course_name: 'Programming',
          department: 'Computer Science',
          level: 'UG',
          delivery_mode: 'online',
          credits: '4',
          duration_weeks: '12',
          rating: '4.5',
          tuition_fee_inr: '45000',
          year_offered: '2024'
        },
        {
          course_id: 'CS102',
          course_name: 'Data Structures',
          department: 'Computer Science',
          level: 'UG',
          delivery_mode: 'offline',
          credits: '4',
          duration_weeks: '14',
          rating: '4.7',
          tuition_fee_inr: '50000',
          year_offered: '2024'
        }
      ];

      const result = validateAllRows(rows);
      
      expect(result.validRows).toHaveLength(2);
      expect(result.errors).toHaveLength(0);
      expect(result.validCount).toBe(2);
      expect(result.errorCount).toBe(0);
    });

    test('should separate valid and invalid rows', () => {
      const rows = [
        {
          course_id: 'CS101',
          course_name: 'Programming',
          department: 'Computer Science',
          level: 'UG',
          delivery_mode: 'online',
          credits: '4',
          duration_weeks: '12',
          rating: '4.5',
          tuition_fee_inr: '45000',
          year_offered: '2024'
        },
        {
          course_id: '', // Invalid - missing course_id
          course_name: 'Invalid Course',
          department: 'Computer Science',
          level: 'INVALID', // Invalid level
          delivery_mode: 'online',
          credits: '4',
          duration_weeks: '12',
          rating: '4.5',
          tuition_fee_inr: '45000',
          year_offered: '2024'
        }
      ];

      const result = validateAllRows(rows);
      
      expect(result.validRows).toHaveLength(1);
      expect(result.errors.length).toBeGreaterThan(0);
      expect(result.validCount).toBe(1);
      expect(result.errorCount).toBe(1);
    });

  });

});