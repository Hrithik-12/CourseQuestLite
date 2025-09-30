import React from 'react';

function ComparePage({ compareList, removeFromCompare }) {
  if (compareList.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow p-8 text-center">
          <div className="mb-4">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">No Courses to Compare</h2>
          <p className="text-gray-600 mb-4">Add courses from the search page to start comparing.</p>
          <a 
            href="/" 
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            <svg className="mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>Search Courses</a>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="bg-white rounded-lg shadow">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold text-gray-900">
              Compare Courses ({compareList.length})
            </h2>
            <div className="text-sm text-gray-500">
              You can compare up to 5 courses
            </div>
          </div>
        </div>

        {/* Comparison Table */}
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Attribute
                </th>
                {compareList.map((course) => (
                  <th key={course.id} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[200px]">
                    <div className="flex items-center justify-between">
                      <span className="truncate">{course.name}</span>
                      <button
                        onClick={() => removeFromCompare(course.id)}
                        className="ml-2 text-red-600 hover:text-red-800 transition-colors"
                        title="Remove from comparison"
                      >
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                    <div className="text-xs text-gray-400 font-normal mt-1">{course.id}</div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {/* Course Name Row */}
              <tr>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  Course Name
                </td>
                {compareList.map((course) => (
                  <td key={course.id} className="px-6 py-4 text-sm text-gray-900">
                    <div className="font-medium">{course.name}</div>
                  </td>
                ))}
              </tr>

              {/* Department */}
              <tr className="bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  Department
                </td>
                {compareList.map((course) => (
                  <td key={course.id} className="px-6 py-4 text-sm text-gray-900">
                    {course.department.name}
                  </td>
                ))}
              </tr>

              {/* Level */}
              <tr>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  Level
                </td>
                {compareList.map((course) => (
                  <td key={course.id} className="px-6 py-4 text-sm text-gray-900">
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      course.level === 'UG' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-purple-100 text-purple-800'
                    }`}>
                      {course.level === 'UG' ? 'Undergraduate' : 'Postgraduate'}
                    </span>
                  </td>
                ))}
              </tr>

              {/* Delivery Mode */}
              <tr className="bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  Delivery Mode
                </td>
                {compareList.map((course) => (
                  <td key={course.id} className="px-6 py-4 text-sm text-gray-900">
                    <span className={`px-2 py-1 text-xs rounded-full capitalize ${
                      course.deliveryMode === 'online' 
                        ? 'bg-blue-100 text-blue-800' 
                        : course.deliveryMode === 'offline'
                        ? 'bg-gray-100 text-gray-800'
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {course.deliveryMode}
                    </span>
                  </td>
                ))}
              </tr>

              {/* Credits */}
              <tr>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  Credits
                </td>
                {compareList.map((course) => (
                  <td key={course.id} className="px-6 py-4 text-sm text-gray-900 font-medium">
                    {course.credits}
                  </td>
                ))}
              </tr>

              {/* Duration */}
              <tr className="bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  Duration
                </td>
                {compareList.map((course) => (
                  <td key={course.id} className="px-6 py-4 text-sm text-gray-900">
                    {course.durationWeeks} weeks
                  </td>
                ))}
              </tr>

              {/* Rating */}
              <tr>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  Rating
                </td>
                {compareList.map((course) => (
                  <td key={course.id} className="px-6 py-4 text-sm text-gray-900">
                    <div className="flex items-center">
                      <span className="text-yellow-400 mr-1">⭐</span>
                      <span className="font-medium">{course.rating}/5</span>
                    </div>
                  </td>
                ))}
              </tr>

              {/* Tuition Fee */}
              <tr className="bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  Tuition Fee
                </td>
                {compareList.map((course) => (
                  <td key={course.id} className="px-6 py-4 text-sm text-gray-900 font-medium">
                    ₹{course.tuitionFee?.toLocaleString()}
                  </td>
                ))}
              </tr>

              {/* Year Offered */}
              <tr>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  Year Offered
                </td>
                {compareList.map((course) => (
                  <td key={course.id} className="px-6 py-4 text-sm text-gray-900">
                    {course.yearOffered}
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>

        {/* Summary Section */}
        <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Quick Comparison</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Highest Rated */}
            <div className="bg-white p-4 rounded-lg shadow-sm">
              <h4 className="text-sm font-medium text-gray-700 mb-2">Highest Rated</h4>
              {(() => {
                const highest = compareList.reduce((max, course) => 
                  parseFloat(course.rating) > parseFloat(max.rating) ? course : max
                );
                return (
                  <div>
                    <p className="font-medium text-gray-900">{highest.name}</p>
                    <p className="text-sm text-gray-600">⭐ {highest.rating}/5</p>
                  </div>
                );
              })()}
            </div>

            {/* Most Affordable */}
            <div className="bg-white p-4 rounded-lg shadow-sm">
              <h4 className="text-sm font-medium text-gray-700 mb-2">Most Affordable</h4>
              {(() => {
                const cheapest = compareList.reduce((min, course) => 
                  parseFloat(course.tuitionFee) < parseFloat(min.tuitionFee) ? course : min
                );
                return (
                  <div>
                    <p className="font-medium text-gray-900">{cheapest.name}</p>
                    <p className="text-sm text-gray-600">₹{cheapest.tuitionFee?.toLocaleString()}</p>
                  </div>
                );
              })()}
            </div>

            {/* Shortest Duration */}
            <div className="bg-white p-4 rounded-lg shadow-sm">
              <h4 className="text-sm font-medium text-gray-700 mb-2">Shortest Duration</h4>
              {(() => {
                const shortest = compareList.reduce((min, course) => 
                  course.durationWeeks < min.durationWeeks ? course : min
                );
                return (
                  <div>
                    <p className="font-medium text-gray-900">{shortest.name}</p>
                    <p className="text-sm text-gray-600">{shortest.durationWeeks} weeks</p>
                  </div>
                );
              })()}
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="px-6 py-4 border-t border-gray-200">
          <div className="flex justify-between items-center">
            <button
              onClick={() => {
                // Create a copy of course IDs to avoid mutation during iteration
                const courseIds = compareList.map(course => course.id);
                courseIds.forEach(courseId => removeFromCompare(courseId));
              }}
              className="px-4 py-2 text-sm text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
            >
              Clear All
            </button>
            <div className="flex space-x-3">
              <button
                onClick={() => window.print()}
                className="px-4 py-2 text-sm text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
              >
                Print Comparison
              </button>
              <a
                href="/"
                className="px-4 py-2 text-sm text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors"
              >
                Add More Courses
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ComparePage;