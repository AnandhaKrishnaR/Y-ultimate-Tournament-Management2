import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom'; 
import axios from 'axios';

const getApiClient = () => {
  const accessToken = localStorage.getItem('accessToken');
  return axios.create({
    baseURL: 'http://127.0.0.1:8000/api/community',
    headers: {
      'Authorization': `Bearer ${accessToken}`
    }
  });
};

function ThreadDetail() {
  const { id } = useParams(); 
  const [thread, setThread] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  
  const [replyContent, setReplyContent] = useState('');
  const [submitting, setSubmitting] = useState(false);

  
  const fetchThread = async () => {
    try {
      setLoading(true);
      const apiClient = getApiClient();
      const response = await apiClient.get(`/threads/${id}/`);
      setThread(response.data);
    } catch (err) {
      setError('Failed to load thread.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchThread();
  }, [id]); 

  
  const handleSubmitReply = async (e) => {
    e.preventDefault();
    if (!replyContent) return;
    setSubmitting(true);

    try {
      const apiClient = getApiClient();
      await apiClient.post('/replies/', {
        thread: id, 
        content: replyContent
      });
      setReplyContent(''); 
      fetchThread(); 
    } catch (err) {
      setError(`Failed to post reply: ${JSON.stringify(err.response.data)}`);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <p>Loading thread...</p>;
  if (error) return <p className="text-red-600">{error}</p>;
  if (!thread) return <p>Thread not found.</p>;

  return (
    <div className="space-y-6">
      <Link to="/community/hub" className="text-indigo-600 hover:underline">&larr; Back to all threads</Link>
      
      
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-3xl font-bold text-gray-800">{thread.title}</h2>
        <p className="text-sm text-gray-500 mt-2">
          Posted by {thread.author.username} on {new Date(thread.created_at).toLocaleString()}
        </p>
        <p className="text-gray-700 mt-4 whitespace-pre-wrap">{thread.content}</p>
      </div>

      
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-xl font-semibold text-gray-800 mb-4">Post a Reply</h3>
        <form onSubmit={handleSubmitReply} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Your Reply:</label>
            <textarea
              value={replyContent}
              onChange={(e) => setReplyContent(e.target.value)}
              rows="4"
              className="w-full p-2 border border-gray-300 rounded-md"
              required
            />
          </div>
          <button
            type="submit"
            disabled={submitting}
            className="rounded-lg bg-indigo-600 px-4 py-2 text-white font-semibold hover:bg-indigo-700 disabled:opacity-50"
          >
            {submitting ? 'Posting...' : 'Post Reply'}
          </button>
        </form>
      </div>

      
      <div className="space-y-4">
        <h3 className="text-2xl font-semibold text-gray-800">Replies ({thread.replies.length})</h3>
        {thread.replies.map(reply => (
          <div key={reply.id} className="bg-white rounded-lg shadow p-4">
            <p className="text-sm text-gray-500">
              {reply.author.username} replied on {new Date(reply.created_at).toLocaleString()}
            </p>
            <p className="text-gray-700 mt-2 whitespace-pre-wrap">{reply.content}</p>
          </div>
        ))}
        {thread.replies.length === 0 && (
          <p className="text-gray-500">No replies yet.</p>
        )}
      </div>
    </div>
  );
}

export default ThreadDetail;