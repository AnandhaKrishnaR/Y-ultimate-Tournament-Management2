import React from 'react';
import LiveScoring from './LiveScoring';

function VolunteerDashboard() {
  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold text-gray-800">Volunteer Dashboard</h2>
      <div className="bg-white rounded-lg shadow p-6">
        <LiveScoring />
      </div>
    </div>
  );
}

export default VolunteerDashboard;