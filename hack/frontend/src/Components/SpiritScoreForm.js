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


const ScoreInput = ({ label, value, onChange }) => (
  <div style={{ marginBottom: '10px' }}>
    <label>{label}: </label>
    <select value={value} onChange={(e) => onChange(parseInt(e.target.value))}>
      <option value={0}>0 - Very Poor</option>
      <option value={1}>1 - Poor</option>
      <option value={2}>2 - Good (Default)</option>
      <option value={3}>3 - Very Good</option>
      <option value={4}>4 - Excellent</option>
    </select>
  </div>
);

function SpiritScoreForm({ myTeams }) {
  const [matches, setMatches] = useState([]);
  const [teams, setTeams] = useState([]); 
  const [selectedMatch, setSelectedMatch] = useState('');
  const [targetTeam, setTargetTeam] = useState('');
  
 
  const [rulesKnowledge, setRulesKnowledge] = useState(2);
  const [foulsContact, setFoulsContact] = useState(2);
  const [fairMindedness, setFairMindedness] = useState(2);
  const [positiveAttitude, setPositiveAttitude] = useState(2);
  const [communication, setCommunication] = useState(2);
  const [comments, setComments] = useState('');
  
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  
  useEffect(() => {
    const fetchData = async () => {
      try {
        const apiClient = getApiClient();
        const matchesRes = await apiClient.get('/api/tournaments/matches/');
        const teamsRes = await apiClient.get('/api/tournaments/teams/');
        setMatches(matchesRes.data);
        setTeams(teamsRes.data);
      } catch (err) {
        console.error('Failed to fetch data:', err);
      }
    };
    fetchData();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!selectedMatch || !targetTeam) {
      setError('Please select a match and the team you are scoring.');
      return;
    }

    const scoreData = {
      match: selectedMatch,
      target_team: targetTeam,
      rules_knowledge: rulesKnowledge,
      fouls_contact: foulsContact,
      fair_mindedness: fairMindedness,
      positive_attitude: positiveAttitude,
      communication: communication,
      comments: comments
    };

    try {
      const apiClient = getApiClient();
      await apiClient.post('/api/tournaments/spirit-scores/', scoreData);
      setSuccess('Spirit Score submitted successfully!');
      
      setSelectedMatch('');
      setTargetTeam('');
      setRulesKnowledge(2);
      setFoulsContact(2);
      setFairMindedness(2);
      setPositiveAttitude(2);
      setCommunication(2);
      setComments('');
    } catch (err) {
      console.error('Submit failed:', err.response.data);
      setError(`Submit failed: ${JSON.stringify(err.response.data)}`);
    }
  };

  return (
    <div>
      <h3>Submit Spirit Score</h3>
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '10px' }}>
          <label>Select Match:</label>
          <select value={selectedMatch} onChange={(e) => setSelectedMatch(e.target.value)} required>
            <option value="">-- Select a Match --</option>
            {matches.map(match => (
              <option key={match.id} value={match.id}>
                {match.team_a} vs {match.team_b} (Field {match.field_number})
              </option>
            ))}
          </select>
        </div>
        <div style={{ marginBottom: '10px' }}>
          <label>Team you are scoring:</label>
          <select value={targetTeam} onChange={(e) => setTargetTeam(e.target.value)} required>
            <option value="">-- Select Opponent --</option>
            {teams.map(team => (
              <option key={team.id} value={team.id}>{team.name}</option>
            ))}
          </select>
        </div>
        
        <ScoreInput label="Rules Knowledge & Use" value={rulesKnowledge} onChange={setRulesKnowledge} />
        <ScoreInput label="Fouls & Body Contact" value={foulsContact} onChange={setFoulsContact} />
        <ScoreInput label="Fair-Mindedness" value={fairMindedness} onChange={setFairMindedness} />
        <ScoreInput label="Positive Attitude & Self-Control" value={positiveAttitude} onChange={setPositiveAttitude} />
        <ScoreInput label="Communication" value={communication} onChange={setCommunication} />
        
        <div style={{ display: 'flex', flexDirection: 'column', marginTop: '10px' }}>
          <label>Comments:</label>
          <textarea
            value={comments}
            onChange={(e) => setComments(e.target.value)}
            placeholder="Add qualitative feedback here"
          />
        </div>
        
        <button type="submit" style={{marginTop: '10px'}}>Submit Score</button>
      </form>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {success && <p style={{ color: 'green' }}>{success}</p>}
    </div>
  );
}

export default SpiritScoreForm;