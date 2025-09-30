import React, { useState } from 'react';

function IngestPage() {
  const [token, setToken] = useState('');
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      // Validate file type
      if (!selectedFile.name.toLowerCase().endsWith('.csv')) {
        setError('Please select a CSV file');
        return;
      }
      setFile(selectedFile);
      setError(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!token.trim()) {
      setError('Access token is required');
      return;
    }
    
    if (!file) {
      setError('Please select a CSV file');
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const formData = new FormData();
      formData.append('csvFile', file);

      console.log('🔐 Uploading CSV with token...');
      
      const response = await fetch('http://localhost:3000/api/ingest', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token.trim()}`
          // Note: Don't set Content-Type for FormData, let browser set it with boundary
        },
        body: formData
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || `HTTP error! status: ${response.status}`);
      }
      
      setResult(data);
      
      // Clear form on success
      setFile(null);
      // Don't clear token - user might want to upload another file
      
      // Reset file input
      const fileInput = document.getElementById('csvFile');
      if (fileInput) fileInput.value = '';
      
    } catch (error) {
      console.error('❌ Ingest error:', error);
      
      // Handle different error scenarios
      if (error.message.includes('401') || error.message.includes('Access token required')) {
        setError('Invalid or missing access token. Please check your token.');
      } else if (error.message.includes('403') || error.message.includes('Access denied')) {
        setError('Access denied. Your token is not valid.');
      } else {
        setError(error.message || 'Error uploading CSV file');
      }
    } finally {
      setLoading(false);
    }
  };

  const clearResults = () => {
    setResult(null);
    setError(null);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          🔐 Protected CSV Ingest
        </h1>
        <p className="text-lg text-gray-600">
          Upload and import course data (requires access token)
        </p>
      </div>

      {/* Upload Form */}
      <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Token Input */}
          <div>
            <label htmlFor="token" className="block text-sm font-medium text-gray-700 mb-2">
              Access Token <span className="text-red-500">*</span>
            </label>
            <input
              type="password"
              id="token"
              value={token}
              onChange={(e) => setToken(e.target.value)}
              placeholder="Enter your access token"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              disabled={loading}
              required
            />
            <p className="text-xs text-gray-500 mt-1">
              Contact your administrator for the access token
            </p>
          </div>

          {/* File Input */}
          <div>
            <label htmlFor="csvFile" className="block text-sm font-medium text-gray-700 mb-2">
              CSV File <span className="text-red-500">*</span>
            </label>
            <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-lg hover:border-gray-400 transition-colors">
              <div className="space-y-1 text-center">
                <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                  <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <div className="flex text-sm text-gray-600">
                  <label htmlFor="csvFile" className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500">
                    <span>Upload a CSV file</span>
                    <input
                      id="csvFile"
                      type="file"
                      accept=".csv"
                      onChange={handleFileChange}
                      className="sr-only"
                      disabled={loading}
                      required
                    />
                  </label>
                  <p className="pl-1">or drag and drop</p>
                </div>
                <p className="text-xs text-gray-500">CSV files only, up to 5MB</p>
              </div>
            </div>
            
            {/* Selected File Display */}
            {file && (
              <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-center">
                  <svg className="h-5 w-5 text-blue-600 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <span className="text-sm text-blue-800 font-medium">{file.name}</span>
                  <span className="text-xs text-blue-600 ml-2">({(file.size / 1024).toFixed(1)} KB)</span>
                </div>
              </div>
            )}
          </div>

          {/* Submit Button */}
          <div className="flex justify-between items-center">
            <button
              type="button"
              onClick={clearResults}
              className="text-sm text-gray-600 hover:text-gray-800 underline"
              disabled={loading}
            >
              Clear results
            </button>
            
            <button
              type="submit"
              disabled={loading || !token.trim() || !file}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors font-medium"
            >
              {loading ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Uploading...
                </div>
              ) : (
                '🔐 Upload & Ingest'
              )}
            </button>
          </div>
        </form>
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
              <h3 className="text-sm font-medium text-red-800">Upload Failed</h3>
              <p className="text-sm text-red-700 mt-1">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Success Result */}
      {result && (
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex items-center mb-4">
            <div className="flex-shrink-0">
              <svg className="h-8 w-8 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-lg font-medium text-green-800">Upload Successful!</h3>
              <p className="text-sm text-green-700">{result.message}</p>
            </div>
          </div>

          {/* Import Statistics */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="text-sm font-medium text-gray-900 mb-3">Import Summary</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{result.stats.totalRows}</div>
                <div className="text-gray-600">Total Rows</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{result.stats.coursesImported}</div>
                <div className="text-gray-600">New Courses</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">{result.stats.departmentsCreated}</div>
                <div className="text-gray-600">New Departments</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">{result.stats.departmentsFound || 0}</div>
                <div className="text-gray-600">Existing Departments</div>
              </div>
            </div>
          </div>

          {/* Additional Info */}
          {result.ingestType && (
            <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-center text-sm text-blue-800">
                <svg className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                <span>Processed via protected endpoint</span>
                {result.timestamp && (
                  <span className="ml-2 text-blue-600">
                    at {new Date(result.timestamp).toLocaleString()}
                  </span>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Information Panel */}
      <div className="mt-8 bg-gray-50 rounded-lg p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-3">📋 CSV Format Requirements</h3>
        <div className="text-sm text-gray-600 space-y-2">
          <p><strong>Required columns:</strong> course_id, course_name, department, level, delivery_mode, credits, duration_weeks, rating, tuition_fee_inr, year_offered</p>
          <p><strong>Level values:</strong> UG (Undergraduate) or PG (Postgraduate)</p>
          <p><strong>Delivery modes:</strong> online, offline, or hybrid</p>
          <p><strong>File size limit:</strong> Maximum 5MB</p>
          <p><strong>Duplicate handling:</strong> Existing courses with same IDs will be skipped</p>
        </div>
      </div>
    </div>
  );
}

export default IngestPage;