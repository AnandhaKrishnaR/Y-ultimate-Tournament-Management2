import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import axios from 'axios';

// Import All Your Components
import Login from './Components/Login';       
import Register from './Components/Register'; 
import MainLayout from './Components/MainLayout'; // The new layout
import ResourceRepository from './Components/ResourceRepository';
import DiscussionHub from './Components/DiscussionHub';
import ThreadDetail from './Components/ThreadDetail';
import MyCoachingProfile from './Components/MyCoachingProfile'; 

// Import All Your Page Components
import AdminDashboard from './Components/AdminDashboard';
import CaptainDashboard from './Components/CaptainDashboard';
import VolunteerDashboard from './Components/VolunteerDashboard';
import TournamentSchedule from './Components/TournamentSchedule';
import CreateTournamentForm from './Components/CreateTournamentForm';
import ScheduleGenerator from './Components/ScheduleGenerator';
import CreateUserForm from './Components/CreateUserForm';
import SpiritScoreForm from './Components/SpiritScoreForm';
import AddPlayerForm from './Components/AddPlayerForm';
import RegisterTeamForm from './Components/RegisterTeamForm';
import TournamentRegistration from './Components/TournamentRegistration';
import MyTeams from './Components/MyTeams';
import PlayerDashboard from './Components/PlayerDashboard'; // This is just the "My Teams" list
import ManageChildren from './Components/ManageChildren';

// Import Phase 3 Components
import CoachDashboard from './Components/CoachDashboard'; 
import SessionAttendance from './Components/SessionAttendance';
import LogHomeVisit from './Components/LogHomeVisit';
import LogLSASAssessment from './Components/LogLSASAssessment';


// --- ADD THESE 2 MISSING IMPORTS ---
import AssignSessionForm from './Components/AssignSessionForm';
import ViewAllSubmissions from './Components/ViewAllSubmissions';
// ---------------------------------

import './App.css'; // Your Tailwind CSS file

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check for existing token on app load
  useEffect(() => {
    const checkUser = async () => {
      const token = localStorage.getItem('accessToken');
      if (token) {
        try {
          const apiClient = axios.create({
            baseURL: 'http://127.0.0.1:8000',
            headers: { 'Authorization': `Bearer ${token}` }
          });
          const response = await apiClient.get('/api/users/me/');
          setUser(response.data); // Auto-login user
        } catch (err) {
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
        }
      }
      setLoading(false);
    };
    checkUser();
  }, []);

  const handleLoginSuccess = (userData) => {
    setUser(userData);
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
  };

  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <BrowserRouter>
      <div className="App">
        <Routes>
          <Route 
            path="/*"
            element={
              user ? (
                <MainAppRoutes user={user} onLogout={handleLogout} />
              ) : (
                <PublicRoutes onLoginSuccess={handleLoginSuccess} />
              )
            } 
          />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

// --- Routes for public (logged-out) users ---
function PublicRoutes({ onLoginSuccess }) {
  const [view, setView] = useState('login');

  if (view === 'register') {
    return <Register onGoToLogin={() => setView('login')} />;
  }
  return <Login onLoginSuccess={onLoginSuccess} onGoToRegister={() => setView('register')} />;
}


// --- Routes for main (logged-in) app ---
function MainAppRoutes({ user, onLogout }) {
  const [tournaments, setTournaments] = useState([]);
  const [selectedTournament, setSelectedTournament] = useState('');

  useEffect(() => {
    const fetchTournaments = async () => {
      try {
        const apiClient = axios.create({ baseURL: 'http://127.0.0.1:8000' });
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
    <Routes>
      <Route path="/" element={<MainLayout user={user} onLogout={onLogout} />}>
        
        <Route 
          index 
          element={
            <RoleBasedDashboard 
              user={user} 
              tournaments={tournaments}
              selectedTournament={selectedTournament}
              onTournamentSelect={setSelectedTournament}
            />
          } 
        />
        
        {/* Community Routes */}
        <Route path="community/hub" element={<DiscussionHub />} />
        <Route path="community/threads/:id" element={<ThreadDetail />} />
        <Route path="community/resources" element={<ResourceRepository user={user} />} />

        {/* Profile Route */}
        <Route path="my-coaching-profile" element={<MyCoachingProfile user={user} />} />

        {/* Admin Routes */}
        <Route path="admin/create-tournament" element={<CreateTournamentForm />} />
        <Route path="admin/generate-schedule" element={<ScheduleGenerator />} />
        <Route path="admin/create-user" element={<CreateUserForm />} />
        <Route path="admin/manage-children" element={<ManageChildren />} />
        <Route path="admin/assign-session" element={<AssignSessionForm />} />
        <Route path="admin/view-submissions" element={<ViewAllSubmissions />} />
        
        {/* Captain Routes */}
        <Route path="captain/create-team" element={<RegisterTeamForm />} />
        <Route path="captain/register-team" element={<TournamentRegistration />} />
        <Route path="captain/add-player" element={<AddPlayerForm />} />
        <Route path="captain/my-teams" element={<MyTeams user={user} />} />
        <Route path="captain/spirit-score" element={<SpiritScoreForm />} />

        {/* Coach Routes */}
        <Route path="coach/attendance" element={<SessionAttendance />} />
        <Route path="coach/home-visit" element={<LogHomeVisit />} />
        <Route path="coach/lsas" element={<LogLSASAssessment />} />

        <Route path="*" element={<Navigate to="/" />} />
      </Route>
    </Routes>
  );
}

// --- Helper component to show the correct *default* dashboard page (at '/') ---
const RoleBasedDashboard = ({ user, tournaments, selectedTournament, onTournamentSelect }) => {
  switch (user.role) {
    case 'ADMIN':
      return <AdminDashboard />;
    case 'MANAGER':
      return <CaptainDashboard user={user} />;
    case 'COACH':
      return <CoachDashboard />;
    case 'VOLUNTEER':
      return <VolunteerDashboard />;
    
    // PLAYER and SPECTATOR are the same
    case 'PLAYER':
    case 'SPECTATOR':
    default:
      return (
        <div className="space-y-6">
          <h2 className="text-3xl font-bold text-gray-800">Welcome, {user.username}!</h2>
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">View Schedule & Scores</h3>
            <select 
              value={selectedTournament} 
              onChange={(e) => onTournamentSelect(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md"
            >
              <option value="">-- Select a Tournament --</option>
              {tournaments.map(t => (
                <option key={t.id} value={t.id}>{t.title}</option>
              ))}
            </select>
            <div className="mt-4">
              <TournamentSchedule tournamentId={selectedTournament} />
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <PlayerDashboard user={user} />
          </div>
          
        </div>
      );
  }
};

export default App;