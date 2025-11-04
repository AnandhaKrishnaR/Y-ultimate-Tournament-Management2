import React from 'react';

function CaptainDashboard({ user }) { 
  return (
    <div className="space-y-6">
      
      <div className="rounded-lg bg-gradient-to-r from-blue-500 to-purple-600 p-6 text-white shadow-lg">
        <h2 className="text-3xl font-bold">Welcome, {user.username}!</h2>
        <p>Use the sidebar to manage your teams, players, and registrations.</p>
      </div>
      

      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-xl font-semibold text-gray-800 mb-4">Quick Links</h3>
        <ul className="list-disc pl-5 space-y-2">
          <li>Create a new team</li>
          <li>Register a team for a tournament</li>
          <li>Add players to your roster</li>
          <li>View your teams</li>
          <li>Submit spirit scores</li>
        </ul>
      </div>
    </div>
  );
}

export default CaptainDashboard;