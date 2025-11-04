import React, { useState, useEffect } from 'react';
import axios from 'axios';

const apiClient = axios.create({
  
  baseURL: 'http://127.0.0.1:8000/api/coaching'
  
});


apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

function LogHomeVisit() {
  const [formData, setFormData] = useState({
    child_id: '',
    date: '',
    notes: ''
  });
  const [children, setChildren] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    fetchChildren();
  }, []);

  const fetchChildren = async () => {
    try {
   
      const response = await apiClient.get('/children/');
      setChildren(response.data);
    } catch (error) {
      console.error('Error fetching children:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setSubmitting(true);
    setSuccess(false);

    try {
      
      await apiClient.post('/home-visits/', {
        child_id: parseInt(formData.child_id),
        date: formData.date,
        notes: formData.notes
      });

      setSuccess(true);
      setFormData({
        child_id: '',
        date: '',
        notes: ''
      });

      setTimeout(() => setSuccess(false), 3000);
    } catch (error) {
      console.error('Error submitting home visit:', error);
      alert('Error submitting home visit. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Log Home Visit</h1>
      
      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-6 space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Child *
          </label>
          <select
            required
            value={formData.child_id}
            onChange={(e) => setFormData({ ...formData, child_id: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          >
            <option value="">Select a child...</option>
            
            {children.map((child) => (
              <option key={child.id} value={child.id}>
                {child.user.username || `Child #${child.id}`}
              </option>
            ))}
          </select>
        </div>

        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Visit Date *
          </label>
          <input
            type="date"
            required
            value={formData.date}
            onChange={(e) => setFormData({ ...formData, date: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Notes
          </label>
          <textarea
            value={formData.notes}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            rows={6}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            placeholder="Enter notes about the home visit..."
          />
        </div>

        {success && (
          <div className="bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-lg">
            Home visit logged successfully!
          </div>
        )}

        <button
          type="submit"
          disabled={submitting}
          className="w-full bg-indigo-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-indigo-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {submitting ? 'Submitting...' : 'Submit Home Visit'}
        </button>
      </form>
    </div>
  );
}

export default LogHomeVisit;