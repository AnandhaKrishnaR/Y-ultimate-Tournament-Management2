import React, { useState, useEffect } from 'react';
import axios from 'axios';
import TournamentList from './TournamentList';
import TournamentSchedule from './TournamentSchedule';


function TournamentTeamList({ tournamentId }) {
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!tournamentId) {
      setTeams([]);
      return;
    }
    const fetchTeams = async () => {
      setLoading(true);
      try {
        const apiClient = getApiClient(); 
        const response = await apiClient.get(`/api/tournaments/${tournamentId}/teams/`);
        setTeams(response.data);
      } catch (err) { }
      setLoading(false);
    };
    fetchTeams();
  }, [tournamentId]);

  if (!tournamentId) return <p>Select a tournament to see registered teams.</p>;
  if (loading) return <p>Loading teams...</p>;
  
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-xl font-semibold text-gray-800 mb-4">Registered Teams</h3>
      {teams.length === 0 ? <p>No teams registered yet.</p> : (
        <ul className="list-disc pl-5 space-y-2">
          {teams.map(team => (
            <li key={team.id} className="text-gray-700">
              <span className="font-semibold">{team.name}</span> (Captain: {team.captain.username})
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}


const getApiClient = () => {
  const accessToken = localStorage.getItem('accessToken');
  return axios.create({
    baseURL: 'http://127.0.0.1:8000',
    headers: { 'Authorization': `Bearer ${accessToken}` }
  });
};

function AdminDashboard() {
  const [tournaments, setTournaments] = useState([]);
  const [selectedTournament, setSelectedTournament] = useState('');


  useEffect(() => {
    const fetchTournaments = async () => {
      try {
        const apiClient = getApiClient();
        const response = await apiClient.get('/api/tournaments/');
        setTournaments(response.data);
        if (response.data.length > 0) {
          setSelectedTournament(response.data[0].id);
        }
      } catch (err) { }
    };
    fetchTournaments();
  }, []);

  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold text-gray-800">Admin Dashboard</h2>
      
    
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-xl font-semibold text-gray-800 mb-4">View Tournament Details</h3>
        <select 
          value={selectedTournament} 
          onChange={(e) => setSelectedTournament(e.target.value)}
          className="w-full p-2 border border-gray-300 rounded-md"
        >
          <option value="">-- Select a Tournament --</option>
          {tournaments.map(t => (
            <option key={t.id} value={t.id}>{t.title}</option>
          ))}
        </select>
        
     
        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-6">
          <TournamentSchedule tournamentId={selectedTournament} />
          <TournamentTeamList tournamentId={selectedTournament} />
        </div>
      </div>

     
      <div className="bg-white rounded-lg shadow p-6">
        <TournamentList />
      </div>
    </div>
  );
}

export default AdminDashboard;