import React, { useState, useEffect } from "react";
import { API_ENDPOINTS } from "../config/api";

function SearchPage({ addToCompare, compareList }) {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({});
  const [filters, setFilters] = useState({
    page: 1,
    limit: 10,
    department: "",
    level: "",
    deliveryMode: "",
    minRating: "",
    maxFee: "",
    search: "",
  });

  // Fetch courses from API
  const fetchCourses = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value) params.append(key, value);
      });

      const response = await fetch(
        `${API_ENDPOINTS.COURSES}?${params}`
      );
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      setCourses(data.data);
      setPagination(data.pagination);
    } catch (error) {
      console.error("Error fetching courses:", error);
      alert("Error fetching courses. Make sure the API server is running.");
    } finally {
      setLoading(false);
    }
  };

  // Fetch courses on component mount and when filters change
  useEffect(() => {
    fetchCourses();
  }, [filters]);

  // Handle filter changes
  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
      page: 1, // Reset to first page when filters change
    }));
  };

  // Handle pagination
  const handlePageChange = (newPage) => {
    setFilters((prev) => ({ ...prev, page: newPage }));
  };

  // Check if course is already in compare list
  const isInCompareList = (courseId) => {
    return compareList.some((c) => c.id === courseId);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Filters Sidebar */}
        <div className="lg:w-1/4">
          <div className="bg-white rounded-lg shadow p-6 sticky top-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Filters
            </h2>

            {/* Search */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Search
              </label>
              <input
                type="text"
                value={filters.search}
                onChange={(e) => handleFilterChange("search", e.target.value)}
                placeholder="Course name or ID..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Department */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Department
              </label>
              <select
                value={filters.department}
                onChange={(e) =>
                  handleFilterChange("department", e.target.value)
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Departments</option>
                <option value="Computer Science">Computer Science</option>
                <option value="Electrical Engineering">
                  Electrical Engineering
                </option>
                <option value="Mechanical Engineering">
                  Mechanical Engineering
                </option>
                <option value="Business Administration">
                  Business Administration
                </option>
                <option value="Economics">Economics</option>
                <option value="Physics">Physics</option>
                <option value="Chemistry">Chemistry</option>
                <option value="Data Analytics">Data Analytics</option>
              </select>
            </div>

            {/* Level */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Level
              </label>
              <select
                value={filters.level}
                onChange={(e) => handleFilterChange("level", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Levels</option>
                <option value="UG">Undergraduate</option>
                <option value="PG">Postgraduate</option>
              </select>
            </div>

            {/* Delivery Mode */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Delivery Mode
              </label>
              <select
                value={filters.deliveryMode}
                onChange={(e) =>
                  handleFilterChange("deliveryMode", e.target.value)
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Modes</option>
                <option value="online">Online</option>
                <option value="offline">Offline</option>
                <option value="hybrid">Hybrid</option>
              </select>
            </div>

            {/* Min Rating */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Min Rating
              </label>
              <input
                type="number"
                min="0"
                max="5"
                step="0.1"
                value={filters.minRating}
                onChange={(e) =>
                  handleFilterChange("minRating", e.target.value)
                }
                placeholder="0.0"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Max Fee */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Max Fee (₹)
              </label>
              <input
                type="number"
                min="0"
                value={filters.maxFee}
                onChange={(e) => handleFilterChange("maxFee", e.target.value)}
                placeholder="100000"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Results per page */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Results per page
              </label>
              <select
                value={filters.limit}
                onChange={(e) => handleFilterChange("limit", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="5">5</option>
                <option value="10">10</option>
                <option value="20">20</option>
                <option value="50">50</option>
              </select>
            </div>

            {/* Clear Filters */}
            <button
              onClick={() =>
                setFilters({
                  page: 1,
                  limit: 10,
                  department: "",
                  level: "",
                  deliveryMode: "",
                  minRating: "",
                  maxFee: "",
                  search: "",
                })
              }
              className="w-full bg-gray-100 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-200 transition-colors"
            >
              Clear All Filters
            </button>
          </div>
        </div>

        {/* Results */}
        <div className="lg:w-3/4">
          {/* Results Header */}
          <div className="bg-white rounded-lg shadow mb-6">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">
                Course Results
                {pagination.totalCourses && (
                  <span className="text-sm font-normal text-gray-500 ml-2">
                    ({pagination.totalCourses} courses found)
                  </span>
                )}
              </h2>
            </div>
          </div>

          {/* Loading */}
          {loading && (
            <div className="bg-white rounded-lg shadow p-8 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-2 text-gray-600">Loading courses...</p>
            </div>
          )}

          {/* Course Cards */}
          {!loading && (
            <div className="space-y-6">
              {courses.map((course) => (
                <div
                  key={course.id}
                  className="bg-white rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-all duration-200"
                >
                  {/* Accent bar */}
                  <div className="h-1 w-full bg-gradient-to-r from-blue-500 to-blue-600 rounded-t-2xl"></div>

                  <div className="p-6">
                    <div className="flex justify-between items-start">
                      {/* Course Info */}
                      <div className="flex-1">
                        <div className="flex items-center mb-3 flex-wrap gap-2">
                          <h3 className="text-xl font-semibold text-gray-900">
                            {course.name}
                          </h3>
                          <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs rounded-full">
                            {course.id}
                          </span>
                          <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs rounded-full">
                            {course.level}
                          </span>
                          <span className="px-2 py-0.5 bg-purple-100 text-purple-700 text-xs rounded-full capitalize">
                            {course.deliveryMode}
                          </span>
                        </div>

                        {/* Course details grid */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                          <div>
                            <p className="text-gray-500">Department</p>
                            <p className="font-medium">
                              {course.department.name}
                            </p>
                          </div>
                          <div>
                            <p className="text-gray-500">Credits</p>
                            <p className="font-medium">{course.credits}</p>
                          </div>
                          <div>
                            <p className="text-gray-500">Duration</p>
                            <p className="font-medium">
                              {course.durationWeeks} weeks
                            </p>
                          </div>
                          <div>
                            <p className="text-gray-500">Year</p>
                            <p className="font-medium">{course.yearOffered}</p>
                          </div>
                          <div>
                            <p className="text-gray-500">Rating</p>
                            <p className="font-medium">⭐ {course.rating}/5</p>
                          </div>
                          <div>
                            <p className="text-gray-500">Fee</p>
                            <p className="font-medium">
                              ₹{course.tuitionFee?.toLocaleString()}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Compare button */}
                      <div className="ml-6 shrink-0">
                        <button
                          onClick={() => addToCompare(course)}
                          disabled={isInCompareList(course.id)}
                          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                            isInCompareList(course.id)
                              ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                              : "bg-blue-600 text-white hover:bg-blue-700"
                          }`}
                        >
                          {isInCompareList(course.id)
                            ? "Added"
                            : "Add to Compare"}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}

              {courses.length === 0 && !loading && (
                <div className="bg-white rounded-lg shadow p-8 text-center border border-gray-100">
                  <p className="text-gray-500">
                    No courses found with the selected filters.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="bg-white rounded-lg shadow mt-6 p-4">
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-700">
                  Showing page {pagination.currentPage} of{" "}
                  {pagination.totalPages}({pagination.totalCourses} total
                  courses)
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => handlePageChange(pagination.currentPage - 1)}
                    disabled={!pagination.hasPrevPage}
                    className="px-3 py-2 border border-gray-300 rounded-md bg-white text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                  >
                    Previous
                  </button>

                  {/* Page numbers */}
                  {Array.from(
                    { length: Math.min(5, pagination.totalPages) },
                    (_, i) => {
                      const pageNum =
                        Math.max(1, pagination.currentPage - 2) + i;
                      if (pageNum <= pagination.totalPages) {
                        return (
                          <button
                            key={pageNum}
                            onClick={() => handlePageChange(pageNum)}
                            className={`px-3 py-2 border rounded-md text-sm ${
                              pageNum === pagination.currentPage
                                ? "bg-blue-600 text-white border-blue-600"
                                : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                            }`}
                          >
                            {pageNum}
                          </button>
                        );
                      }
                      return null;
                    }
                  )}

                  <button
                    onClick={() => handlePageChange(pagination.currentPage + 1)}
                    disabled={!pagination.hasNextPage}
                    className="px-3 py-2 border border-gray-300 rounded-md bg-white text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                  >
                    Next
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default SearchPage;
