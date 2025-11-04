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

function CoachDashboard() {
  const [upcomingSessions, setUpcomingSessions] = useState([]);
  const [pastSessions, setPastSessions] = useState([]); 
  const [sessionsThisMonth, setSessionsThisMonth] = useState(0);
  const [assignedChildren, setAssignedChildren] = useState([]); 
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      const [dashboardRes, childrenRes] = await Promise.all([
        apiClient.get('/dashboard/'), 
        apiClient.get('/children/')   
      ]);
      
      setUpcomingSessions(dashboardRes.data.upcoming_sessions || []);
      setPastSessions(dashboardRes.data.past_sessions || []); 
      setSessionsThisMonth(dashboardRes.data.sessions_this_month || 0);
      setAssignedChildren(childrenRes.data || []); 

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto text-center py-12">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-600"></div>
        <p className="mt-4 text-gray-600">Loading dashboard...</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Coach Dashboard</h1>
      
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-sm font-semibold text-gray-500 uppercase mb-2">Upcoming Sessions</h3>
          <p className="text-3xl font-bold text-indigo-600">{upcomingSessions.length}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-sm font-semibold text-gray-500 uppercase mb-2">This Month</h3>
          <p className="text-3xl font-bold text-green-600">{sessionsThisMonth}</p>
        </div>
      </div>

      
      <div className="bg-white rounded-lg shadow overflow-hidden mb-8">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-800">My Assigned Children</h2>
        </div>
        <div className="divide-y divide-gray-200">
          {assignedChildren.length > 0 ? (
            assignedChildren.map((child) => (
              <div key={child.id} className="p-4 hover:bg-gray-50">
                <p className="font-semibold text-gray-800">{child.user.username}</p>
                <p className="text-sm text-gray-600">
                  Gender: {child.gender || 'N/A'}
                </p>
              </div>
            ))
          ) : (
            <div className="p-8 text-center text-gray-500">
              <p>No children are assigned to you yet.</p>
            </div>
          )}
        </div>
      </div>

      
      <div className="bg-white rounded-lg shadow overflow-hidden mb-8">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-800">Upcoming Sessions</h2>
        </div>
        <div className="divide-y divide-gray-200">
          {upcomingSessions.length > 0 ? (
            upcomingSessions.map((session) => (
              <div key={session.id} className="p-4 hover:bg-gray-50">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-semibold text-gray-800">
                      Session at {session.location}
                    </p>
                    <p className="text-sm text-gray-600 mt-1">
                      Date: {new Date(session.date).toLocaleDateString()} 
                      {session.time && ` • Time: ${session.time}`}
                    </p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    session.status === 'SCHEDULED' ? 'bg-blue-100 text-blue-800' :
                    session.status === 'LIVE' ? 'bg-red-100 text-red-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {session.status}
                  </span>
                </div>
              </div>
            ))
          ) : (
            <div className="p-8 text-center text-gray-500">
              <p>No upcoming sessions scheduled.</p>
            </div>
          )}
        </div>
      </div>

     
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-800">Past Sessions</h2>
        </div>
        <div className="divide-y divide-gray-200 max-h-96 overflow-y-auto">
          {pastSessions.length > 0 ? (
            pastSessions.map((session) => (
              <div key={session.id} className="p-4 hover:bg-gray-50 opacity-70">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-semibold text-gray-800">
                      {session.location}
                    </p>
                    <p className="text-sm text-gray-600 mt-1">
                      Date: {new Date(session.date).toLocaleDateString()}
                    </p>
                  </div>
                  <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-medium">
                    {session.status}
                  </span>
                </div>
              </div>
            ))
          ) : (
            <div className="p-8 text-center text-gray-500">
              <p>No past sessions found.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default CoachDashboard;