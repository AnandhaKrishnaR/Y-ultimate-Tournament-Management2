import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom'; 
import axios from 'axios';


const getApiClient = (isMultipart = false) => {
  const accessToken = localStorage.getItem('accessToken');
  const headers = {
    'Authorization': `Bearer ${accessToken}`
  };
  if (isMultipart) {
    headers['Content-Type'] = 'multipart/form-data';
  }
  return axios.create({
    baseURL: 'http://127.0.0.1:8000/api/community', 
    headers: headers
  });
};

function DiscussionHub() {
  const [threads, setThreads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

 
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [submitting, setSubmitting] = useState(false);

  
  const fetchThreads = async () => {
    try {
      setLoading(true);
      const apiClient = getApiClient();
      const response = await apiClient.get('/threads/');
      setThreads(response.data);
    } catch (err) {
      setError('Failed to load discussion threads.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchThreads();
  }, []);

  
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title || !content) {
      setError('Title and content are required.');
      return;
    }
    setSubmitting(true);
    setError('');

    try {
      const apiClient = getApiClient();
      await apiClient.post('/threads/', {
        title: title,
        content: content
      });
      alert('Thread created successfully!');
      
      setTitle('');
      setContent('');
      fetchThreads();
    } catch (err) {
      setError(`Failed to create thread: ${JSON.stringify(err.response.data)}`);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold text-gray-800">Discussion Hub</h2>

      
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-xl font-semibold text-gray-800 mb-4">Create a New Thread</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Title:</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Content:</label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows="4"
              className="w-full p-2 border border-gray-300 rounded-md"
              required
            />
          </div>
          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-lg bg-indigo-600 px-4 py-2 text-white font-semibold hover:bg-indigo-700 disabled:opacity-50"
          >
            {submitting ? 'Posting...' : 'Post New Thread'}
          </button>
          {error && <p className="text-red-600 mt-2">{error}</p>}
        </form>
      </div>

      
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-xl font-semibold text-gray-800 mb-4">All Threads</h3>
        {loading ? <p>Loading threads...</p> : (
          <div className="space-y-4">
            {threads.length === 0 ? <p>No threads posted yet.</p> :
              threads.map(thread => (
                <div key={thread.id} className="p-4 border rounded-md hover:bg-gray-50">
                  
                  <Link 
                    to={`/community/threads/${thread.id}`} 
                    className="text-lg font-semibold text-indigo-600 hover:underline"
                  >
                    {thread.title}
                  </Link>
                  <p className="text-sm text-gray-600 mt-1">{thread.content.substring(0, 100)}...</p>
                  <p className="text-xs text-gray-400 mt-2">
                    Posted by: {thread.author.username} on {new Date(thread.created_at).toLocaleDateString()}
                    <span className="ml-2">({thread.replies.length} replies)</span>
                  </p>
                </div>
              ))
            }
          </div>
        )}
      </div>
    </div>
  );
}

export default DiscussionHub;