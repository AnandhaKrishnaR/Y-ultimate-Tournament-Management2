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

function CreateUserForm() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('SPECTATOR'); 
  
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setSubmitting(true);

    const userData = {
      username: username,
      email: email,
      password: password,
      role: role
    };

    try {
      const apiClient = getApiClient();
    
      const response = await apiClient.post('/api/users/admin/create-user/', userData);
      
      setSuccess(`Successfully created user: ${response.data.username}`);
      
      setUsername('');
      setEmail('');
      setPassword('');
      setRole('SPECTATOR');

    } catch (err) {
      console.error('Failed to create user:', err.response.data);
      setError(`Failed to create user: ${JSON.stringify(err.response.data)}`);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxWidth: '400px' }}>
      <h3>Create New User (Admin)</h3>
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        <label>Username:</label>
        <input
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
        />
      </div>
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        <label>Email:</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
      </div>
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        <label>Password:</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
      </div>
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        <label>Role:</label>
        <select value={role} onChange={(e) => setRole(e.target.value)} required>
          <option value="SPECTATOR">Spectator / Fan</option>
          <option value="PLAYER">Player / Child Profile</option>
          <option value="VOLUNTEER">Volunteer / Field Official</option>
          <option value="COACH">Coach / Facilitator</option>
          <option value="MANAGER">Team Manager / Captain</option>
          <option value="ADMIN">Admin / Director</option>
        </select>
      </div>
      
      <button type="submit" disabled={submitting}>
        {submitting ? 'Creating...' : 'Create User'}
      </button>
      
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {success && <p style={{ color: 'green' }}>{success}</p>}
    </form>
  );
}

export default CreateUserForm;