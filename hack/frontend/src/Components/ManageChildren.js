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

function ManageChildren() {
  const [children, setChildren] = useState([]);
  const [users, setUsers] = useState([]); 
  const [coaches, setCoaches] = useState([]); 
  const [loading, setLoading] = useState(true);
  
 
  const [selectedUser, setSelectedUser] = useState('');
  const [dob, setDob] = useState('');
  const [gender, setGender] = useState('Other');
  const [selectedCoach, setSelectedCoach] = useState(''); 
  
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  
  const fetchData = async () => {
    setLoading(true);
    try {
      const coachingApi = getCoachingApiClient();
      const usersApi = getUsersApiClient();

      const childrenRes = await coachingApi.get('/children/');
      setChildren(childrenRes.data);
      
      const usersRes = await usersApi.get('/admin/list-users/');
      setUsers(usersRes.data);

      setCoaches(usersRes.data.filter(user => user.role === 'COACH'));
      
    } catch (err) {
      console.error(err);
      setError('Failed to load data. Are you logged in as an Admin?');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!selectedUser) {
      setError('You must select a user account to link.');
      return;
    }

    try {
      const coachingApi = getCoachingApiClient();
      await coachingApi.post('/children/', {
        user_id: selectedUser,
        date_of_birth: dob || null, 
        gender: gender,
        assigned_coach_id: selectedCoach || null 
      });
      setSuccess('Child profile created successfully!');
      fetchData(); 
      setSelectedUser('');
      setDob('');
      setGender('Other');
      setSelectedCoach('');

    } catch (err) {
      setError(`Failed to create profile: ${JSON.stringify(err.response.data)}`);
    }
  };

  if (loading) return <p>Loading...</p>;

  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold text-gray-800">Manage Child Profiles</h2>
      
      
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-xl font-semibold text-gray-800 mb-4">Create New Child Profile</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Link to User Account:</label>
            <select
              value={selectedUser}
              onChange={(e) => setSelectedUser(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md"
              required
            >
              <option value="">-- Select a User --</option>
              
              {users
                .filter(u => 
               
                  (u.role === 'SPECTATOR' || u.role === 'PLAYER') && 
                  
                  !children.some(c => c.user && c.user.id === u.id)
                )
                .map(user => (
                 
                  <option key={user.id} value={user.id}>{user.username}</option>
                ))}
             
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700">Assign Primary Coach (Optional):</label>
            <select
              value={selectedCoach}
              onChange={(e) => setSelectedCoach(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md"
            >
              <option value="">-- No Primary Coach --</option>
              {coaches.map(coach => (
                <option key={coach.id} value={coach.id}>{coach.username}</option>
              ))}
            </select>
          </div>

          <div className="flex gap-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700">Date of Birth:</label>
              <input
                type="date"
                value={dob}
                onChange={(e) => setDob(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md"
              />
            </div>
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700">Gender:</label>
              <select
                value={gender}
                onChange={(e) => setGender(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md"
              >
                <option value="Other">Other</option>
                <option value="M">Male</option>
                <option value="F">Female</option>
              </select>
            </div>
          </div>
          
          <button type="submit" className="w-full rounded-lg bg-indigo-600 px-4 py-2 text-white font-semibold hover:bg-indigo-700">
            Create Profile
          </button>
          {error && <p className="text-red-600 mt-2">{error}</p>}
          {success && <p className="text-green-600 mt-2">{success}</p>}
        </form>
      </div>
      
     
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-xl font-semibold text-gray-800 mb-4">Existing Child Profiles</h3>
        <ul className="list-disc pl-5 space-y-2">
          {children.map(child => (
            <li key={child.id}>
              {child.user ? child.user.username : 'Unknown User'}
              {child.assigned_coach && ` (Coach: ${child.assigned_coach.username})`}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default ManageChildren;