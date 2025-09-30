import { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import SearchPage from './components/SearchPage';
import ComparePage from './components/ComparePage';
import AskAIPage from './components/AskAIPage';
import IngestPage from './components/IngestPage';

function App() {
  const [compareList, setCompareList] = useState([]);

  const addToCompare = (course) => {
    if (compareList.find(c => c.id === course.id)) {
      alert('Course already in compare list');
      return;
    }
    if (compareList.length >= 5) {
      alert('Maximum 5 courses can be compared');
      return;
    }
    setCompareList([...compareList, course]);
  };

  const removeFromCompare = (courseId) => {
    setCompareList(compareList.filter(c => c.id !== courseId));
  };

  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        {/* Navigation */}
        <nav className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-16">
              <div className="flex items-center">
                <h1 className="text-xl font-bold text-gray-900">Course Management</h1>
              </div>
              <div className="flex items-center space-x-8">
                <Link to="/" className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md">
                  Search Courses
                </Link>
                <Link to="/ask" className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md">
                  Ask AI
                </Link>
                <Link to="/ingest" className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md">
                  Ingest CSV
                </Link>
                <Link to="/compare" className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md relative">
                  Compare
                  {compareList.length > 0 && (
                    <span className="absolute -top-1 -right-1 bg-blue-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                      {compareList.length}
                    </span>
                  )}
                </Link>
              </div>
            </div>
          </div>
        </nav>

        {/* Routes */}
        <Routes>
          <Route 
            path="/" 
            element={
              <SearchPage 
                addToCompare={addToCompare} 
                compareList={compareList}
              />
            } 
          />
          <Route 
            path="/ask" 
            element={<AskAIPage />} 
          />
          <Route 
            path="/ingest" 
            element={<IngestPage />} 
          />
          <Route 
            path="/compare" 
            element={
              <ComparePage 
                compareList={compareList}
                removeFromCompare={removeFromCompare}
              />
            } 
          />
        </Routes>
      </div>
    </Router>
  );
}

export default App;