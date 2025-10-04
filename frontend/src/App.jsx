import React, { useState, useEffect } from 'react';
import CameraFeed from './components/CameraFeed';
import CameraFeedPython from './components/CameraFeedPython';
import FeedbackForm from './components/FeedbackForm';
import FeedbackTable from './components/FeedbackTable';
import Header from './components/Header';
import { getFeedbacks } from './services/api';

function App() {
  const [feedbacks, setFeedbacks] = useState([]);
  const [showNegativeForm, setShowNegativeForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [usePythonDetection, setUsePythonDetection] = useState(true); // Default to Python

  const fetchFeedbacks = async () => {
    setLoading(true);
    try {
      const data = await getFeedbacks();
      setFeedbacks(data);
    } catch (error) {
      console.error('Error fetching feedbacks:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFeedbacks();
  }, []);

  const handleGestureDetection = (type) => {
    if (type === 'negative') {
      setShowNegativeForm(true);
    }
    // Refresh feedback list after new feedback
    fetchFeedbacks();
  };

  const handleFormSubmit = () => {
    setShowNegativeForm(false);
    fetchFeedbacks();
  };

  const handleFormClose = () => {
    setShowNegativeForm(false);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        {/* Camera Section */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold text-gray-900">
              Gesture Recognition Camera
            </h2>
            <div className="flex items-center space-x-4">
              <label className="flex items-center">
                <input
                  type="radio"
                  name="detection"
                  checked={usePythonDetection}
                  onChange={() => setUsePythonDetection(true)}
                  className="mr-2"
                />
                Python MediaPipe
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  name="detection"
                  checked={!usePythonDetection}
                  onChange={() => setUsePythonDetection(false)}
                  className="mr-2"
                />
                JavaScript MediaPipe
              </label>
            </div>
          </div>
          <p className="text-gray-600 mb-6">
            Show thumbs up for positive feedback or thumbs down to open the feedback form.
          </p>
          {usePythonDetection ? (
            <CameraFeedPython onGestureDetected={handleGestureDetection} />
          ) : (
            <CameraFeed onGestureDetected={handleGestureDetection} />
          )}
        </div>

        {/* Feedback Table */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold text-gray-900">
              All Feedback Entries
            </h2>
            <button
              onClick={fetchFeedbacks}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              disabled={loading}
            >
              {loading ? 'Refreshing...' : 'Refresh'}
            </button>
          </div>
          <FeedbackTable feedbacks={feedbacks} loading={loading} />
        </div>
      </div>

      {/* Negative Feedback Modal */}
      {showNegativeForm && (
        <FeedbackForm
          onSubmit={handleFormSubmit}
          onClose={handleFormClose}
        />
      )}
    </div>
  );
}

export default App;

