import React, { useState, useEffect } from 'react';
import axios from 'axios';

const apiClient = axios.create({
  baseURL: 'http://127.0.0.1:8000/api/coaching'
});


apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

function CentralizedChildProfileView() {
  const [children, setChildren] = useState([]);
  const [selectedChild, setSelectedChild] = useState(null);
  const [unifiedHistory, setUnifiedHistory] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [loadingHistory, setLoadingHistory] = useState(false);

  useEffect(() => {
    fetchChildren();
  }, []);

  const fetchChildren = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get('/api/children/');
      setChildren(response.data);
    } catch (error) {
      console.error('Error fetching children:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleChildSelect = async (child) => {
    setSelectedChild(child);
    setLoadingHistory(true);
    
    try {
      const response = await apiClient.get(`/api/children/${child.id}/unified_history/`);
      setUnifiedHistory(response.data);
    } catch (error) {
      console.error('Error fetching unified history:', error);
      alert('Error loading child history. Please try again.');
    } finally {
      setLoadingHistory(false);
    }
  };

  const filteredChildren = children.filter(child => {
    const query = searchQuery.toLowerCase();
    return child.username?.toLowerCase().includes(query) || 
           child.id?.toString().includes(query);
  });

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto text-center py-12">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-600"></div>
        <p className="mt-4 text-gray-600">Loading children...</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Centralized Child Profile View</h1>
      
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <input
          type="text"
          placeholder="Search children by name or ID..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-800">Children</h2>
          </div>
          <div className="divide-y divide-gray-200 max-h-96 overflow-y-auto">
            {filteredChildren.length > 0 ? (
              filteredChildren.map((child) => (
                <button
                  key={child.id}
                  onClick={() => handleChildSelect(child)}
                  className={`w-full text-left p-4 hover:bg-gray-50 transition ${
                    selectedChild?.id === child.id ? 'bg-indigo-50 border-r-4 border-indigo-600' : ''
                  }`}
                >
                  <p className="font-semibold text-gray-800">
                    {child.username || `Child #${child.id}`}
                  </p>
                  <p className="text-sm text-gray-600 mt-1">
                    DOB: {child.date_of_birth ? new Date(child.date_of_birth).toLocaleDateString() : 'N/A'}
                    {child.gender && ` • Gender: ${child.gender}`}
                  </p>
                </button>
              ))
            ) : (
              <div className="p-8 text-center text-gray-500">
                <p>No children found.</p>
              </div>
            )}
          </div>
        </div>

        
        <div className="space-y-6">
          {loadingHistory ? (
            <div className="bg-white rounded-lg shadow p-8 text-center">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-600"></div>
              <p className="mt-4 text-gray-600">Loading history...</p>
            </div>
          ) : selectedChild && unifiedHistory ? (
            <>
              
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Session History</h3>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {unifiedHistory.sessions && unifiedHistory.sessions.length > 0 ? (
                    unifiedHistory.sessions.map((session) => (
                      <div key={session.id} className="p-3 bg-gray-50 rounded">
                        <p className="text-sm font-medium">
                          {session.location} - {new Date(session.date).toLocaleDateString()}
                        </p>
                        <p className="text-xs text-gray-600">{session.time}</p>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-gray-500">No session history available.</p>
                  )}
                </div>
              </div>

              
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Home Visit History</h3>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {unifiedHistory.home_visits && unifiedHistory.home_visits.length > 0 ? (
                    unifiedHistory.home_visits.map((visit) => (
                      <div key={visit.id} className="p-3 bg-gray-50 rounded">
                        <p className="text-sm font-medium">
                          {new Date(visit.date).toLocaleDateString()}
                        </p>
                        <p className="text-xs text-gray-600">{visit.notes || 'No notes'}</p>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-gray-500">No home visit history available.</p>
                  )}
                </div>
              </div>

             
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">LSAS Assessment History</h3>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {unifiedHistory.assessments && unifiedHistory.assessments.length > 0 ? (
                    unifiedHistory.assessments.map((assessment) => (
                      <div key={assessment.id} className="p-3 bg-gray-50 rounded">
                        <p className="text-sm font-medium">
                          Score: {assessment.score} | {new Date(assessment.date).toLocaleDateString()}
                        </p>
                        <p className="text-xs text-gray-600">{assessment.remarks || 'No remarks'}</p>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-gray-500">No assessment history available.</p>
                  )}
                </div>
              </div>
            </>
          ) : (
            <div className="bg-white rounded-lg shadow p-8 text-center text-gray-500">
              <p>Select a child to view their history.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default CentralizedChildProfileView;

