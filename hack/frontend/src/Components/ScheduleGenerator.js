import React, { useState, useEffect } from 'react';
import axios from 'axios';
import TournamentSchedule from './TournamentSchedule'; 

const getApiClient = () => {
  const accessToken = localStorage.getItem('accessToken');
  return axios.create({
    baseURL: 'http://127.0.0.1:8000',
    headers: {
      'Authorization': `Bearer ${accessToken}`
    }
  });
};

function ScheduleGenerator() {
  const [tournaments, setTournaments] = useState([]);
  const [selectedTournament, setSelectedTournament] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [submitting, setSubmitting] = useState(false);
  
  
  const [generatedTournamentId, setGeneratedTournamentId] = useState(null);

 
  useEffect(() => {
    const fetchTournaments = async () => {
      try {
        const apiClient = getApiClient();
        const response = await apiClient.get('/api/tournaments/');
        setTournaments(response.data);
      } catch (err) { }
    };
    fetchTournaments();
  }, []);

  const handleGenerate = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setGeneratedTournamentId(null); 

    if (!selectedTournament) {
      setError('Please select a tournament.');
      return;
    }

    if (!window.confirm('This will delete all existing matches for this tournament and create a new schedule. Are you sure?')) {
      return;
    }

    setSubmitting(true);
    try {
      const apiClient = getApiClient();
      const response = await apiClient.post(`/api/tournaments/${selectedTournament}/generate_schedule/`);
      setSuccess(response.data.message);
      
      
      setGeneratedTournamentId(selectedTournament); 

    } catch (err) {
      setError(`Failed: ${JSON.stringify(err.response.data)}`);
    } finally {
      setSubmitting(false);
    }
  };

  
  const handleSelectChange = (e) => {
    setSelectedTournament(e.target.value);
    setSuccess('');
    setError('');
    setGeneratedTournamentId(null);
  };

  return (
    
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-xl font-semibold text-gray-800 mb-4">Generate Tournament Schedule</h3>
        <p className="text-gray-600 mb-4">This will create a "Round Robin" schedule (all-play-all).</p>
        <form onSubmit={handleGenerate} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Select Tournament:</label>
            <select 
              value={selectedTournament} 
              onChange={handleSelectChange} 
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
            disabled={submitting}
            className="w-full rounded-lg bg-indigo-600 px-4 py-2 text-white font-semibold hover:bg-indigo-700 disabled:opacity-50"
          >
            {submitting ? 'Generating...' : 'Generate Schedule'}
          </button>
        </form>
        {error && <p className="text-red-600 mt-2">{error}</p>}
        {success && <p className="text-green-600 mt-2">{success}</p>}
      </div>

      
      {generatedTournamentId && (
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-xl font-semibold text-gray-800 mb-4">Newly Generated Schedule</h3>
          <TournamentSchedule tournamentId={generatedTournamentId} />
        </div>
      )}
    </div>
  );
}

export default ScheduleGenerator;