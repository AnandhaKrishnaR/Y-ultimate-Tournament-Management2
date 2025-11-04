import React, { useState, useEffect } from 'react';
import axios from 'axios';


const getCoachingApiClient = () => {
  const accessToken = localStorage.getItem('accessToken');
  return axios.create({
    baseURL: 'http://127.0.0.1:8000/api/coaching', 
    headers: { 'Authorization': `Bearer ${accessToken}` }
  });
};

function MyCoachingProfile({ user }) {
  const [coachingProfile, setCoachingProfile] = useState(null);
  const [loadingCoaching, setLoadingCoaching] = useState(true);
  const [isRegistered, setIsRegistered] = useState(false);

  useEffect(() => {
    
    const fetchCoachingProfile = async () => {
      try {
        const coachingApi = getCoachingApiClient();
        const response = await coachingApi.get('/my-profile/');
        setCoachingProfile(response.data);
        setIsRegistered(true);
      } catch (err) {
        
        setIsRegistered(false);
      }
      setLoadingCoaching(false);
    };

    if (user) {
      fetchCoachingProfile();
    }
  }, [user]);

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-xl font-semibold text-gray-800 mb-4">My Coaching Profile</h3>
      {loadingCoaching ? <p>Loading coaching profile...</p> : (
        !isRegistered ? (
          <p className="text-gray-500">You are not registered in the coaching program.</p>
        ) : (
          <div className="space-y-4">
           
            <div>
              <h4 className="font-semibold">My Coach</h4>
              <p className="text-gray-700">Name: {coachingProfile.coach_details?.username || "Not Assigned"}</p>
            </div>
            
            
            <div>
              <h4 className="font-semibold">My Sessions</h4>
              {coachingProfile.session_details.length > 0 ? (
                <ul className="list-disc pl-5">
                  {coachingProfile.session_details.map(session => (
                    <li key={session.id} className="text-sm text-gray-700">
                      {session.location} on {new Date(session.date).toLocaleDateString()} ({session.status})
                    </li>
                  ))}
                </ul>
              ) : <p className="text-sm text-gray-500">No sessions found.</p>}
            </div>
            
            
            <div>
              <h4 className="font-semibold">My Attendance</h4>
              {coachingProfile.attendance_details.length > 0 ? (
                <ul className="list-disc pl-5">
                  {coachingProfile.attendance_details.map(att => (
                    <li key={att.id} className="text-sm text-gray-700">
                      {att.session.location} on {new Date(att.session.date).toLocaleDateString()}: 
                      <span className={`font-semibold ${att.status === 'Present' ? 'text-green-600' : 'text-red-600'}`}>
                        {att.status}
                      </span>
                    </li>
                  ))}
                </ul>
              ) : <p className="text-sm text-gray-500">No attendance records found.</p>}
            </div>

          </div>
        )
      )}
    </div>
  );
}

export default MyCoachingProfile;