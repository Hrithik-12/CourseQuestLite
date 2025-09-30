// test-import.js
   const { importCoursesFromCSV } = require('./src/services/courseImportService');
   
   importCoursesFromCSV('./data/courses.csv')
     .then(result => console.log(result));