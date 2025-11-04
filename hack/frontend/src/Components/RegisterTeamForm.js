import React, { useState } from 'react';
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

function RegisterTeamForm({ onTeamCreated }) {
  const [teamName, setTeamName] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      const apiClient = getApiClient();
      
      const response = await apiClient.post('/api/tournaments/teams/', {
        name: teamName
      });
      
      alert('Team created successfully!');
      setTeamName(''); 
      
      
      if (onTeamCreated) {
        onTeamCreated();
      }

    } catch (err) {
      console.error('Failed to create team:', err.response.data);
      setError('Failed to create team. Does a team with this name already exist?');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxWidth: '400px' }}>
      <h3>Create a New Team</h3>
      <p>Create your team here. You can then register it for a tournament.</p>
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        <label>Team Name:</label>
        <input
          type="text"
          value={teamName}
          onChange={(e) => setTeamName(e.target.value)}
          required
        />
      </div>
      
      <button type="submit" disabled={submitting}>
        {submitting ? 'Creating...' : 'Create Team'}
      </button>
      
      {error && <p style={{ color: 'red' }}>{error}</p>}
    </form>
  );
}

export default RegisterTeamForm;