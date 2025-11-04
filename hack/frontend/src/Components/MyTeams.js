import React, { useState, useEffect } from 'react';
import axios from 'axios';

const getApiClient = () => {
  const accessToken = localStorage.getItem('accessToken');
  return axios.create({
    baseURL: 'http://127.0.0.1:8000',
    headers: {
      'Authorization': `Bearer ${accessToken}`
    }
  });
};


function TeamRoster({ teamId }) {
  const [roster, setRoster] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const viewRoster = async () => {
    if (!teamId) return;
    setLoading(true);
    setError('');
    try {
      const apiClient = getApiClient();
      const response = await apiClient.get(`/api/tournaments/teams/${teamId}/roster/`);
      setRoster(response.data);
    } catch (err) {
      setError('Failed to load roster. Are you the captain?');
    }
    setLoading(false);
  };

  return (
    <div style={{marginTop: '10px', paddingLeft: '20px'}}>
      <button onClick={viewRoster} className="text-sm text-blue-500">
        {loading ? 'Loading...' : 'View Roster'}
      </button>
      {error && <p className="text-sm text-red-500">{error}</p>}
      {roster.length > 0 && (
        <ul className="list-disc pl-5 mt-2">
          {roster.map(reg => (
            <li key={reg.id} className="text-sm text-gray-600">
              {reg.player.username} (Registered for: {reg.tournament.title})
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}


function MyTeams({ user }) { 
  const [myTeams, setMyTeams] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchMyTeams = async () => {
    setLoading(true);
    try {
      const apiClient = getApiClient();
      const response = await apiClient.get('/api/tournaments/teams/');
      const filteredTeams = response.data.filter(team => team.captain.id === user.id);
      setMyTeams(filteredTeams); 
    } catch (err) {
      console.error('Failed to fetch teams:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchMyTeams();
    }
  }, [user]);

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-xl font-semibold text-gray-800 mb-4">Your Teams</h3>
      {loading ? (
        <p>Loading teams...</p>
      ) : (
        <ul className="list-disc pl-5 space-y-2">
          {myTeams.length > 0 ? (
            myTeams.map(team => (
              <li key={team.id} className="text-gray-700">
                <span className="font-semibold">{team.name}</span> (Captain: {team.captain.username})
                
                <TeamRoster teamId={team.id} />
              </li>
            ))
          ) : (
            <p className="text-gray-500">You have not created any teams yet.</p>
          )}
        </ul>
      )}
    </div>
  );
}

export default MyTeams;