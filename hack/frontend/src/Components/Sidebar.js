import React from 'react';
import { NavLink } from 'react-router-dom'; 

function Sidebar({ userRole, onLogout }) {

  const navLinkClass = ({ isActive }) =>
    `block w-full px-4 py-3 text-left text-gray-700 hover:bg-gray-100 ${
      isActive ? 'bg-gray-200 font-semibold' : ''
    }`;

  const renderLinks = () => {
    const commonLinks = (
      <>
        
        <li><NavLink to="/community/hub" className={navLinkClass}>Discussion Hub</NavLink></li>
        <li><NavLink to="/community/resources" className={navLinkClass}>Resources</NavLink></li>
      </>
    );

    switch (userRole) {
   case 'ADMIN':
        return (
          <>
            <li><NavLink to="/" className={navLinkClass} end>Dashboard</NavLink></li>
            <li><NavLink to="/admin/create-tournament" className={navLinkClass}>Create Tournament</NavLink></li>
            <li><NavLink to="/admin/generate-schedule" className={navLinkClass}>Generate Schedule</NavLink></li>
            <li><NavLink to="/admin/create-user" className={navLinkClass}>Create User</NavLink></li>
           
            <li><NavLink to="/admin/manage-children" className={navLinkClass}>Manage Children</NavLink></li>
           
            <li><NavLink to="/admin/assign-session" className={navLinkClass}>Assign Session</NavLink></li>
            <li><NavLink to="/admin/view-submissions" className={navLinkClass}>View All Submissions</NavLink></li>
            {commonLinks}
          </>
        );
      case 'MANAGER':
        return (
          <>
            <li><NavLink to="/" className={navLinkClass} end>Dashboard</NavLink></li>
            <li><NavLink to="/captain/create-team" className={navLinkClass}>Create a New Team</NavLink></li>
            <li><NavLink to="/captain/register-team" className={navLinkClass}>Register Team</NavLink></li>
            <li><NavLink to="/captain/add-player" className={navLinkClass}>Add Player to Roster</NavLink></li>
            <li><NavLink to="/captain/my-teams" className={navLinkClass}>View My Teams</NavLink></li>
            <li><NavLink to="/captain/spirit-score" className={navLinkClass}>Submit Spirit Score</NavLink></li>
            {commonLinks}
          </>
        );
      case 'COACH':
        return (
          <>
            <li><NavLink to="/" className={navLinkClass} end>Dashboard</NavLink></li>
            <li><NavLink to="/coach/attendance" className={navLinkClass}>Session Attendance</NavLink></li>
            <li><NavLink to="/coach/home-visit" className={navLinkClass}>Log Home Visit</NavLink></li>
            <li><NavLink to="/coach/lsas" className={navLinkClass}>Log LSAS Assessment</NavLink></li>
            {commonLinks}
          </>
        );
      case 'VOLUNTEER':
        return (
          <>
            <li><NavLink to="/" className={navLinkClass} end>Dashboard</NavLink></li>
            {commonLinks}
          </>
        );
     default: 
        return (
          <>
            <li><NavLink to="/" className={navLinkClass} end>Schedule & Scores</NavLink></li>
            {/* --- ADD THIS NEW LINK --- */}
            <li><NavLink to="/my-coaching-profile" className={navLinkClass}>My Coaching Profile</NavLink></li>
            {commonLinks}
          </>
        );
    }
  };
  return (
    <div className="flex h-screen w-64 flex-col bg-white shadow-lg">
      <div className="p-4 border-b">
        <h3 className="text-xl font-bold text-gray-800">Y-Ultimate Platform</h3>
        <p className="text-sm text-gray-500">Role: {userRole}</p>
      </div>
      <ul className="flex-1 list-none p-0 m-0 overflow-y-auto">
        {renderLinks()}
      </ul>
      <div className="p-4 border-t">
        <button 
          onClick={onLogout} 
          className="w-full rounded-lg bg-red-600 px-4 py-2 text-white font-semibold hover:bg-red-700"
        >
          Logout
        </button>
      </div>
    </div>
  );
}

export default Sidebar;