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

function SessionAttendance() {
  const [sessions, setSessions] = useState([]);
  const [selectedSession, setSelectedSession] = useState(null);
  const [children, setChildren] = useState([]);
  const [attendance, setAttendance] = useState({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchSessions();
  }, []);

  const fetchSessions = async () => {
    try {
      setLoading(true);
      
      const response = await apiClient.get('/sessions/'); 
      setSessions(response.data);
    } catch (error) {
      console.error('Error fetching sessions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectSession = async (session) => {
    setSelectedSession(session);
    try {
      
      const childrenResponse = await apiClient.get('/children/');
      setChildren(childrenResponse.data);

      
      const attendanceResponse = await apiClient.get(`/attendance/?session_id=${session.id}`);
      const attendanceMap = {};
      attendanceResponse.data.forEach(att => {
        
        attendanceMap[att.child.id] = att.status; 
      });
      setAttendance(attendanceMap);
    } catch (error) {
      console.error('Error fetching children/attendance:', error);
    }
  };

  const handleAttendanceChange = (childId, status) => {
    setAttendance(prev => ({
      ...prev,
      [childId]: status
    }));
  };

  
  const updateSessionStatus = async (sessionId, newStatus) => {
    try {
      await apiClient.patch(`/sessions/${sessionId}/`, {
        status: newStatus
      });
      
      setSelectedSession(prev => ({ ...prev, status: newStatus }));
      fetchSessions(); 
      alert(`Session marked as ${newStatus}!`);
    } catch (error) {
      console.error(`Error updating status:`, error);
      alert('Failed to update status.');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedSession) return;

    try {
      setSubmitting(true);
      const attendanceData = children.map(child => ({
        
        child_id: child.id,
        status: attendance[child.id] || 'Absent'
      }));

      await apiClient.post('/attendance/mark_for_session/', {
        session_id: selectedSession.id,
        attendance: attendanceData
      });

      alert('Attendance marked successfully!');
    } catch (error) {
      console.error('Error submitting attendance:', error);
      alert('Error marking attendance. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <p>Loading sessions...</p>;
  }

  
  if (!selectedSession) {
    return (
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">Session Attendance</h1>
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Select a Session</h2>
          <div className="space-y-2">
            {sessions.length > 0 ? (
              sessions.map((session) => (
                <button
                  key={session.id}
                  onClick={() => handleSelectSession(session)}
                  className="w-full text-left p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition"
                >
                  <p className="font-semibold text-gray-800">
                    {session.location} - {new Date(session.date).toLocaleDateString()}
                   
                    <span className={`ml-2 px-2 py-0.5 rounded-full text-xs font-medium ${
                      session.status === 'SCHEDULED' ? 'bg-blue-100 text-blue-800' :
                      session.status === 'LIVE' ? 'bg-red-100 text-red-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {session.status}
                    </span>
                  </p>
                </button>
              ))
            ) : (
              <p className="text-gray-500">No sessions assigned to you.</p>
            )}
          </div>
        </div>
      </div>
    );
  }

  
  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-4">
        <button
          onClick={() => setSelectedSession(null)}
          className="text-indigo-600 hover:text-indigo-800"
        >
          ← Back to Sessions
        </button>
      </div>

      <h1 className="text-3xl font-bold text-gray-800 mb-6">Mark Attendance</h1>
      <div className="bg-white rounded-lg shadow p-6 mb-4">
        <h2 className="text-lg font-semibold text-gray-800 mb-2">
          {selectedSession.location} - {new Date(selectedSession.date).toLocaleDateString()}
        </h2>
        <p className="text-gray-600">Status: {selectedSession.status}</p>
      </div>

      
      {selectedSession.status === 'SCHEDULED' && (
        <button
          onClick={() => updateSessionStatus(selectedSession.id, 'LIVE')}
          className="w-full bg-green-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-700 transition"
        >
          Start Session
        </button>
      )}

      
      {(selectedSession.status === 'LIVE' || selectedSession.status === 'COMPLETED') && (
        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow overflow-hidden">
          <div className="divide-y divide-gray-200">
            {children.map((child) => (
              <div key={child.id} className="p-4 flex items-center justify-between hover:bg-gray-50">
                <p className="font-semibold text-gray-800">
                  {child.user.username}
                </p>
                <div className="flex space-x-2">
                  <button
                    type="button"
                    onClick={() => handleAttendanceChange(child.id, 'Present')}
                   
                    disabled={selectedSession.status === 'COMPLETED'}
                    className={`px-4 py-2 rounded-lg font-medium transition ${
                      attendance[child.id] === 'Present'
                        ? 'bg-green-500 text-white'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    } ${selectedSession.status === 'COMPLETED' ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    Present
                  </button>
                  <button
                    type="button"
                    onClick={() => handleAttendanceChange(child.id, 'Absent')}
                    
                    disabled={selectedSession.status === 'COMPLETED'}
                    className={`px-4 py-2 rounded-lg font-medium transition ${
                      attendance[child.id] === 'Absent'
                        ? 'bg-red-500 text-white'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    } ${selectedSession.status === 'COMPLETED' ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    Absent
                  </button>
                </div>
              </div>
            ))}
          </div>

          
          {selectedSession.status === 'LIVE' && (
            <div className="p-6 border-t border-gray-200 space-y-4">
              <button
                type="submit"
                disabled={submitting}
                className="w-full bg-indigo-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-indigo-700 transition disabled:opacity-50"
              >
                {submitting ? 'Submitting...' : 'Submit Attendance'}
              </button>
              <button
                type="button"
                onClick={() => updateSessionStatus(selectedSession.id, 'COMPLETED')}
                className="w-full bg-red-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-red-700 transition"
              >
                End Session & Mark as Complete
              </button>
            </div>
          )}
        </form>
      )}
    </div>
  );
}

export default SessionAttendance;