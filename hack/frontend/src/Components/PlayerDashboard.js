import React, { useState, useEffect } from 'react';
import axios from 'axios';


const getApiClient = () => {
  const accessToken = localStorage.getItem('accessToken');
  return axios.create({
    baseURL: 'http://127.0.0.1:8000',
    headers: { 'Authorization': `Bearer ${accessToken}` }
  });
};

function PlayerDashboard({ user }) {
  
  const [registrations, setRegistrations] = useState([]);
  const [loadingTeams, setLoadingTeams] = useState(true);

  useEffect(() => {
    
    const fetchRegistrations = async () => {
      try {
        const apiClient = getApiClient();
        const response = await apiClient.get('/api/users/my-registrations/');
        setRegistrations(response.data);
      } catch (err) { }
      setLoadingTeams(false);
    };

    if (user) {
      fetchRegistrations();
    }
  }, [user]);

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-xl font-semibold text-gray-800 mb-4">My Team Registrations</h3>
      {loadingTeams ? <p>Loading registrations...</p> : (
        registrations.length > 0 ? (
          <ul className="list-disc pl-5 space-y-2">
            {registrations.map(reg => (
              <li key={reg.id} className="text-gray-700">
                You are on <span className="font-semibold">{reg.team.name}</span> 
                for the <span className="font-semibold">{reg.tournament.title}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-gray-500">You are not yet registered for any teams.</p>
        )
      )}
    </div>
  );
}

export default PlayerDashboard;