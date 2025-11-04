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

function LiveScoring() {
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Function to fetch all matches
  const fetchMatches = async () => {
    try {
      const apiClient = getApiClient();
      const response = await apiClient.get('/api/tournaments/matches/');
      const matchesWithScores = response.data.map(match => ({
        ...match,
        // Use the score from the API, or 0 if it's null
        scoreA: match.team_a_score ?? 0,
        scoreB: match.team_b_score ?? 0,
      }));
      setMatches(matchesWithScores);
    } catch (err) {
      setError('Failed to load matches.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMatches();
  }, []);

  // Handle score input changes
  const handleScoreChange = (matchId, team, value) => {
    setMatches(prevMatches =>
      prevMatches.map(match => {
        if (match.id === matchId) {
          if (team === 'A') return { ...match, scoreA: value };
          if (team === 'B') return { ...match, scoreB: value };
        }
        return match;
      })
    );
  };

  // --- NEW FUNCTION: To start a game ---
  const handleStartGame = async (matchId) => {
    try {
      const apiClient = getApiClient();
      // Set status to LIVE and initialize scores to 0
      await apiClient.patch(`/api/tournaments/matches/${matchId}/`, {
        status: 'LIVE',
        team_a_score: 0,
        team_b_score: 0
      });
      alert('Match started!');
      fetchMatches(); // Refresh the list
    } catch (err) {
      setError('Failed to start match.');
    }
  };

  // Handle the "Update" button click
  const handleUpdateScore = async (matchId) => {
    const match = matches.find(m => m.id === matchId);
    if (!match) return;

    try {
      const apiClient = getApiClient();
      await apiClient.patch(`/api/tournaments/matches/${matchId}/`, {
        team_a_score: match.scoreA,
        team_b_score: match.scoreB
      });
      alert('Score updated successfully!');
      fetchMatches(); // Refresh
    } catch (err) {
      setError('Failed to update score. Are you a Volunteer?');
    }
  };

  // Handle the "Mark as Final" button click
  const handleMarkAsFinal = async (matchId) => {
    if (!window.confirm('Are you sure you want to mark this match as final?')) {
      return;
    }

    try {
      const apiClient = getApiClient();
      // Set status to FINAL and set is_final to true
      await apiClient.patch(`/api/tournaments/matches/${matchId}/`, {
        status: 'FINAL',
        is_final: true
      });
      alert('Match marked as final!');
      fetchMatches(); // Refresh
    } catch (err) {
      setError('Failed to finalize match. Are you a Volunteer?');
    }
  };

  if (loading) return <p>Loading matches...</p>;
  if (error) return <p style={{ color: 'red' }}>{error}</p>;

  return (
    <div>
      <h3>Live Scoring Interface</h3>
      {matches.map(match => (
        <div key={match.id} style={{ border: '1px solid #ccc', padding: '10px', marginBottom: '10px', backgroundColor: match.is_final ? '#f0f0f0' : '#fff' }}>
          <p><strong>{match.team_a} vs {match.team_b}</strong> (Field {match.field_number})</p>
          
          {/* --- UPDATED LOGIC --- */}
          {match.status === 'SCHEDULED' && (
            <button onClick={() => handleStartGame(match.id)} style={{backgroundColor: '#007bff', color: 'white'}}>
              Start Game
            </button>
          )}

          {match.status === 'LIVE' && (
            <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
              <label>{match.team_a}:</label>
              <input
                type="number"
                min="0"
                value={match.scoreA}
                onChange={(e) => handleScoreChange(match.id, 'A', parseInt(e.target.value))}
                style={{ width: '60px' }}
              />
              <span>-</span>
              <input
                type="number"
                min="0"
                value={match.scoreB}
                onChange={(e) => handleScoreChange(match.id, 'B', parseInt(e.target.value))}
                style={{ width: '60px' }}
              />
              <label>:{match.team_b}</label>
              <button onClick={() => handleUpdateScore(match.id)}>Update Score</button>
              <button onClick={() => handleMarkAsFinal(match.id)} style={{backgroundColor: '#28a745', color: 'white'}}>Mark as Final</button>
            </div>
          )}

          {match.status === 'FINAL' && (
            <strong>FINAL (Score: {match.team_a_score} - {match.team_b_score})</strong>
          )}
        </div>
      ))}
    </div>
  );
}

export default LiveScoring;