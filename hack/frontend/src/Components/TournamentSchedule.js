import React, { useState, useEffect } from 'react';
import axios from 'axios';

const apiClient = axios.create({
  baseURL: 'http://127.0.0.1:8000'
});

function TournamentSchedule({ tournamentId }) {
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchMatches = async () => {
      // If no tournament is selected, don't fetch
      if (!tournamentId) {
        setMatches([]);
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        // Use the new, specific API endpoint
        const response = await apiClient.get(`/api/tournaments/${tournamentId}/matches/`);
        setMatches(response.data);
      } catch (err) {
        console.error('Failed to fetch matches:', err);
        setError('Failed to load schedule.');
      } finally {
        setLoading(false);
      }
    };

    fetchMatches();
  }, [tournamentId]); // Re-run this effect when tournamentId changes

  // Add a message if no tournament is selected
  if (!tournamentId) {
    return <p>Please select a tournament to view the schedule.</p>;
  }

  if (loading) {
    return <p>Loading schedule...</p>;
  }

  if (error) {
    return <p style={{ color: 'red' }}>{error}</p>;
  }

  // --- NEW HELPER FUNCTION for display ---
  const renderScore = (match) => {
    if (match.status === 'SCHEDULED') {
      return ' - '; // Show dash for scheduled games
    }
    // Show 0-0 for live games that just started, or the actual score
    return `${match.team_a_score ?? 0} - ${match.team_b_score ?? 0}`;
  };

  const renderStatus = (match) => {
    if (match.status === 'FINAL') {
      return <span style={{ color: 'grey' }}>Final</span>;
    }
    if (match.status === 'LIVE') {
      return <span style={{ color: 'red', fontWeight: 'bold' }}>Live</span>;
    }
    return <span style={{ color: 'blue' }}>Scheduled</span>;
  };

  return (
    <div>
      <h3>Tournament Schedule & Scores</h3>
      {matches.length === 0 ? (
        <p>No matches scheduled for this tournament yet.</p>
      ) : (
        <table style={{ width: '100%', borderCollapse: 'collapse', ...{ tableLayout: 'fixed' } }}>
          <thead>
            <tr style={{ borderBottom: '1px solid #ccc' }}>
              <th style={{ padding: '8px', textAlign: 'left', width: '30%' }}>Time</th>
              <th style={{ padding: '8px', textAlign: 'left' }}>Field</th>
              <th style={{ padding: '8px', textAlign: 'left' }}>Team A</th>
              <th style={{ padding: '8px', textAlign: 'left' }}>Team B</th>
              <th style={{ padding: '8px', textAlign: 'left' }}>Score</th>
              <th style={{ padding: '8px', textAlign: 'left' }}>Status</th>
            </tr>
          </thead>
          <tbody>
            {matches.map(match => (
              <tr key={match.id} style={{ borderBottom: '1px solid #eee' }}>
                <td style={{ padding: '8px' }}>{new Date(match.start_time).toLocaleString()}</td>
                <td style={{ padding: '8px' }}>{match.field_number}</td>
                <td style={{ padding: '8px' }}>{match.team_a}</td>
                <td style={{ padding: '8px' }}>{match.team_b}</td>
                <td style={{ padding: '8px' }}>
                  {renderScore(match)}
                </td>
                <td style={{ padding: '8px' }}>
                  {renderStatus(match)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default TournamentSchedule;