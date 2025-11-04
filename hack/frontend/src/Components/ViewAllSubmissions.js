import React, { useState, useEffect } from 'react';
import axios from 'axios';

const apiClient = axios.create({
  baseURL: 'http://127.0.0.1:8000/api/coaching',
  headers: { 'Authorization': `Bearer ${localStorage.getItem('accessToken')}` }
});

function ViewAllSubmissions() {
  const [homeVisits, setHomeVisits] = useState([]);
  const [lsas, setLsas] = useState([]);
  const [sessions, setSessions] = useState([]); // 1. Add state for sessions
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // 2. Fetch all three sets of data
        const [visitsRes, lsasRes, sessionsRes] = await Promise.all([
          apiClient.get('/home-visits/'), // Admin will get all
          apiClient.get('/lsas-assessments/'), // Admin will get all
          apiClient.get('/sessions/') // Admin will get all
        ]);
        setHomeVisits(visitsRes.data);
        setLsas(lsasRes.data);
        setSessions(sessionsRes.data); // 3. Set sessions
      } catch (err) {
        console.error("Failed to load submissions", err);
      }
      setLoading(false);
    };
    fetchData();
  }, []);

  if (loading) return <p>Loading all submissions...</p>;

  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold text-gray-800">All Submissions & Sessions</h2>

      {/* 4. All Sessions (Request 2.6, 2.8) */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-xl font-semibold text-gray-800 mb-4">All Sessions</h3>
        <div className="max-h-96 overflow-y-auto space-y-2">
          {sessions.length > 0 ? sessions.map(session => (
            <div key={session.id} className="p-3 bg-gray-50 rounded">
              <p><b>Location:</b> {session.location} | <b>Coach:</b> {session.assigned_coach?.username || 'Unassigned'}</p>
              <p><b>Date:</b> {session.date} | <b>Time:</b> {session.time}</p>
              <p><b>Status:</b> 
                <span className={`ml-2 px-2 py-0.5 rounded-full text-xs font-medium ${
                  session.status === 'SCHEDULED' ? 'bg-blue-100 text-blue-800' :
                  session.status === 'LIVE' ? 'bg-red-100 text-red-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {session.status}
                </span>
              </p>
            </div>
          )) : <p>No sessions found.</p>}
        </div>
      </div>

      {/* Home Visits */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-xl font-semibold text-gray-800 mb-4">All Home Visits</h3>
        <div className="max-h-96 overflow-y-auto space-y-2">
          {homeVisits.length > 0 ? homeVisits.map(visit => (
            <div key={visit.id} className="p-3 bg-gray-50 rounded">
              <p><b>Child:</b> {visit.child.user.username} | <b>Coach:</b> {visit.coach.username}</p>
              <p><b>Date:</b> {visit.date}</p>
              <p><b>Notes:</b> {visit.notes || 'N/A'}</p>
            </div>
          )) : <p>No home visits found.</p>}
        </div>
      </div>

      {/* LSAS Assessments */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-xl font-semibold text-gray-800 mb-4">All LSAS Assessments</h3>
        <div className="max-h-96 overflow-y-auto space-y-2">
          {lsas.length > 0 ? lsas.map(item => (
            <div key={item.id} className="p-3 bg-gray-50 rounded">
              <p><b>Child:</b> {item.child.user.username}</p>
              <p><b>Date:</b> {item.date} | <b>Score:</b> {item.score}</p>
              <p><b>Remarks:</b> {item.remarks || 'N/A'}</p>
            </div>
          )) : <p>No assessments found.</p>}
        </div>
      </div>
    </div>
  );
}

export default ViewAllSubmissions;