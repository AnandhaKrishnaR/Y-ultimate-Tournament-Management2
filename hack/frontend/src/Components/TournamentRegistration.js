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


function TournamentRegistration() {
  const [tournaments, setTournaments] = useState([]);
  const [myTeams, setMyTeams] = useState([]); 
  const [selectedTeam, setSelectedTeam] = useState('');
  const [selectedTournament, setSelectedTournament] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  
  useEffect(() => {
    const fetchData = async () => {
      try {
        const apiClient = getApiClient();
        const [tournamentsRes, teamsRes] = await Promise.all([
          apiClient.get('/api/tournaments/'),
          apiClient.get('/api/tournaments/teams/')
        ]);
        
        setTournaments(tournamentsRes.data);
        
        setMyTeams(teamsRes.data); 
      } catch (err) {
        console.error('Failed to fetch data:', err);
      }
    };
    fetchData();
  }, []);

  
  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!selectedTeam || !selectedTournament) {
      setError('Please select your team and a tournament.');
      return;
    }

    try {
      const apiClient = getApiClient();
      await apiClient.post('/api/tournaments/registrations/', {
        team: selectedTeam,
        tournament: selectedTournament
      });
      setSuccess(`Team successfully registered for the tournament!`);
    } catch (err) {
      console.error('Registration failed:', err.response.data);
      setError(`Registration failed: ${JSON.stringify(err.response.data)}`);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-xl font-semibold text-gray-800 mb-4">Register Team for Tournament</h3>
      <form onSubmit={handleRegister} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Select Your Team:</label>
          <select 
            value={selectedTeam} 
            onChange={(e) => setSelectedTeam(e.target.value)} 
            className="w-full p-2 border border-gray-300 rounded-md"
            required
          >
            <option value="">-- Select a Team --</option>
            {myTeams.map(team => (
              <option key={team.id} value={team.id}>{team.name}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Select Tournament:</label>
          <select 
            value={selectedTournament} 
            onChange={(e) => setSelectedTournament(e.target.value)} 
            className="w-full p-2 border border-gray-300 rounded-md"
            required
          >
            <option value="">-- Select a Tournament --</option>
            {tournaments.map(tournament => (
              <option key={tournament.id} value={tournament.id}>{tournament.title}</option>
            ))}
          </select>
        </div>
        <button 
          type="submit"
          className="w-full rounded-lg bg-indigo-600 px-4 py-2 text-white font-semibold hover:bg-indigo-700"
        >
          Register Team
        </button>
      </form>
      {error && <p className="text-red-600 mt-2">{error}</p>}
      {success && <p className="text-green-600 mt-2">{success}</p>}
    </div>
  );
}

export default TournamentRegistration;