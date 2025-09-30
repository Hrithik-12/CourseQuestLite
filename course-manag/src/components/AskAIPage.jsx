import React, { useState } from 'react';
import { API_ENDPOINTS } from '../config/api';

function AskAIPage() {
  const [question, setQuestion] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  // Example questions for quick testing
  const exampleQuestions = [
    "Find UG computer science courses under 50000",
    "Show me online courses with rating above 4.5",
    "Postgraduate engineering courses",
    "Courses under 40000 in business administration",
    "High rated data science courses",
    "Offline mechanical engineering courses",
    "4 credit computer science courses"
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!question.trim()) return;

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      console.log('🤖 Asking AI:', question);
      const response = await fetch(API_ENDPOINTS.ASK, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          question: question.trim()
        })
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      setResult(data);
    } catch (error) {
      console.error('❌ Ask AI error:', error);
      setError(error.message || 'Error processing your question');
    } finally {
      setLoading(false);
    }
  };

  const handleExampleClick = (exampleQuestion) => {
    setQuestion(exampleQuestion);
    setResult(null);
    setError(null);
  };

  const clearResults = () => {
    setQuestion('');
    setResult(null);
    setError(null);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          🤖 Ask AI Course Search
        </h1>
        <p className="text-lg text-gray-600">
          Ask questions in natural language to find courses
        </p>
      </div>

      {/* Search Form */}
      <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="question" className="block text-sm font-medium text-gray-700 mb-2">
              What kind of courses are you looking for?
            </label>
            <div className="flex gap-3">
              <input
                type="text"
                id="question"
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                placeholder="e.g., Find UG computer science courses under 50000"
                className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg"
                disabled={loading}
              />
              <button
                type="submit"
                disabled={loading || !question.trim()}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors font-medium"
              >
                {loading ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Asking...
                  </div>
                ) : (
                  'Ask AI'
                )}
              </button>
            </div>
          </div>

          {/* Clear button */}
          {(result || error) && (
            <button
              type="button"
              onClick={clearResults}
              className="text-sm text-gray-600 hover:text-gray-800 underline"
            >
              Clear results
            </button>
          )}
        </form>

        {/* Example Questions */}
        <div className="mt-6">
          <h3 className="text-sm font-medium text-gray-700 mb-3">Try these examples:</h3>
          <div className="flex flex-wrap gap-2">
            {exampleQuestions.map((example, index) => (
              <button
                key={index}
                onClick={() => handleExampleClick(example)}
                className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded-full hover:bg-gray-200 transition-colors"
                disabled={loading}
              >
                {example}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Error</h3>
              <p className="text-sm text-red-700 mt-1">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Results */}
      {result && (
        <div className="space-y-6">
          {/* Query Understanding */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
            <h2 className="text-lg font-semibold text-blue-900 mb-4">
              🧠 What I Understood From Your Question
            </h2>
            <div className="space-y-3">
              <div>
                <span className="text-sm font-medium text-blue-700">Original Question:</span>
                <p className="text-blue-900 italic">"{result.query.original}"</p>
              </div>
              <div>
                <span className="text-sm font-medium text-blue-700">Filters Applied:</span>
                <div className="flex flex-wrap gap-2 mt-2">
                  {result.query.understood.map((condition, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full border border-blue-200"
                    >
                      {condition}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Results Summary */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-900">
                Search Results
              </h2>
              <span className="px-3 py-1 bg-green-100 text-green-800 text-sm rounded-full">
                {result.results.count} course{result.results.count !== 1 ? 's' : ''} found
              </span>
            </div>
            
            <p className="text-gray-600 mb-6">{result.message}</p>

            {/* No Results */}
            {result.results.count === 0 && result.suggestions && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <h3 className="text-sm font-medium text-yellow-800 mb-2">Suggestions to improve your search:</h3>
                <ul className="text-sm text-yellow-700 space-y-1">
                  {result.suggestions.map((suggestion, index) => (
                    <li key={index} className="flex items-start">
                      <span className="mr-2">•</span>
                      {suggestion}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Course Results */}
            {result.results.count > 0 && (
              <div className="space-y-4">
                {result.results.courses.map((course, index) => (
                  <div key={course.course_id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">{course.course_name}</h3>
                        <div className="flex items-center space-x-3 text-sm text-gray-600">
                          <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded">
                            {course.course_id}
                          </span>
                          <span>{course.department}</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold text-green-600">
                          ₹{course.tuition_fee_inr.toLocaleString()}
                        </div>
                        <div className="text-sm text-gray-500">
                          ⭐ {course.rating}/5
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <span className="text-gray-500">Level:</span>
                        <span className={`ml-1 px-2 py-1 rounded text-xs ${
                          course.level === 'UG' ? 'bg-green-100 text-green-800' : 'bg-purple-100 text-purple-800'
                        }`}>
                          {course.level === 'UG' ? 'Undergraduate' : 'Postgraduate'}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-500">Mode:</span>
                        <span className={`ml-1 px-2 py-1 rounded text-xs capitalize ${
                          course.delivery_mode === 'online' ? 'bg-blue-100 text-blue-800' :
                          course.delivery_mode === 'offline' ? 'bg-gray-100 text-gray-800' :
                          'bg-yellow-100 text-yellow-800'
                        }`}>
                          {course.delivery_mode}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-500">Credits:</span>
                        <span className="ml-1 font-medium">{course.credits}</span>
                      </div>
                      <div>
                        <span className="text-gray-500">Duration:</span>
                        <span className="ml-1 font-medium">{course.duration_weeks} weeks</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tips */}
      <div className="mt-8 bg-gray-50 rounded-lg p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-3">💡 Tips for better searches:</h3>
        <div className="grid md:grid-cols-2 gap-4 text-sm text-gray-600">
          <div>
            <h4 className="font-medium text-gray-800 mb-2">Keywords I understand:</h4>
            <ul className="space-y-1">
              <li><strong>Levels:</strong> UG, undergraduate, PG, postgraduate</li>
              <li><strong>Modes:</strong> online, offline, hybrid, campus</li>
              <li><strong>Fees:</strong> under 50000, below 40000, max 60000</li>
              <li><strong>Ratings:</strong> rating above 4, high rated</li>
            </ul>
          </div>
          <div>
            <h4 className="font-medium text-gray-800 mb-2">Department shortcuts:</h4>
            <ul className="space-y-1">
              <li><strong>CS:</strong> Computer Science</li>
              <li><strong>EE:</strong> Electrical Engineering</li>
              <li><strong>ME:</strong> Mechanical Engineering</li>
              <li><strong>BA:</strong> Business Administration</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AskAIPage;