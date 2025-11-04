import React, { useState, useEffect } from 'react';
import axios from 'axios';


const getCoachingApiClient = () => {
  const accessToken = localStorage.getItem('accessToken');
  return axios.create({
    baseURL: 'http://127.0.0.1:8000/api/coaching', 
    headers: { 'Authorization': `Bearer ${accessToken}` }
  });
};


const getUsersApiClient = () => {
  const accessToken = localStorage.getItem('accessToken');
  return axios.create({
    baseURL: 'http://127.0.0.1:8000/api/users',
    headers: { 'Authorization': `Bearer ${accessToken}` }
  });
};

function AssignSessionForm() {
  const [coaches, setCoaches] = useState([]);
  const [loading, setLoading] = useState(true);
  
 
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [location, setLocation] = useState('');
  const [selectedCoach, setSelectedCoach] = useState('');
  
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    const fetchCoaches = async () => {
      setLoading(true);
      try {
        const usersApi = getUsersApiClient();
        const usersRes = await usersApi.get('/admin/list-users/');
    
        setCoaches(usersRes.data.filter(user => user.role === 'COACH'));
      } catch (err) {
        setError('Failed to load coaches.');
      } finally {
        setLoading(false);
      }
    };
    fetchCoaches();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      const coachingApi = getCoachingApiClient();
      
      await coachingApi.post('/sessions/', {
        date: date,
        time: time,
        location: location,
        assigned_coach_id: selectedCoach || null
      });
      setSuccess('Session created and assigned successfully!');
      
      setDate('');
      setTime('');
      setLocation('');
      setSelectedCoach('');
    } catch (err) {
      setError(`Failed to create session: ${JSON.stringify(err.response.data)}`);
    }
  };

  if (loading) return <p>Loading...</p>;

  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold text-gray-800">Assign New Session</h2>
      
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-xl font-semibold text-gray-800 mb-4">Create & Assign Session</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Assign to Coach:</label>
            <select
              value={selectedCoach}
              onChange={(e) => setSelectedCoach(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md"
              required
            >
              <option value="">-- Select a Coach --</option>
              {coaches.map(coach => (
                <option key={coach.id} value={coach.id}>{coach.username}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Location:</label>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md"
              required
            />
          </div>

          <div className="flex gap-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700">Date:</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md"
                required
              />
            </div>
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700">Time:</label>
              <input
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md"
                required
              />
            </div>
          </div>
          
          <button type="submit" className="w-full rounded-lg bg-indigo-600 px-4 py-2 text-white font-semibold hover:bg-indigo-700">
            Create Session
          </button>
          {error && <p className="text-red-600 mt-2">{error}</p>}
          {success && <p className="text-green-600 mt-2">{success}</p>}
        </form>
      </div>
    </div>
  );
}

export default AssignSessionForm;