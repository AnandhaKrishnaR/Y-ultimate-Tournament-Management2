import React, { useState, useEffect } from 'react';
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

function ResourceRepository({ user }) {
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');


  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);

  const fetchResources = async () => {
    try {
      setLoading(true);
      const apiClient = getApiClient();
      const response = await apiClient.get('/resources/');
      setResources(response.data);
    } catch (err) {
      setError('Failed to load resources.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResources();
  }, []);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!title || !file) {
      setError('Title and file are required.');
      return;
    }
    setUploading(true);
    setError('');

    const formData = new FormData();
    formData.append('title', title);
    formData.append('description', description);
    formData.append('file', file);

    try {
      const apiClient = getApiClient(true); 
      await apiClient.post('/resources/', formData);
      alert('File uploaded successfully!');
      
      setTitle('');
      setDescription('');
      setFile(null);
      fetchResources();
    } catch (err) {
      setError(`Upload failed: ${JSON.stringify(err.response.data)}`);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold text-gray-800">Resource Repository</h2>

      
      {user.role === 'ADMIN' && (
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-xl font-semibold text-gray-800 mb-4">Upload New Resource</h3>
          <form onSubmit={handleUpload} className="space-y-4">
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
              <label className="block text-sm font-medium text-gray-700">Description:</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">File:</label>
              <input
                type="file"
                onChange={handleFileChange}
                className="w-full"
                required
              />
            </div>
            <button
              type="submit"
              disabled={uploading}
              className="w-full rounded-lg bg-indigo-600 px-4 py-2 text-white font-semibold hover:bg-indigo-700 disabled:opacity-50"
            >
              {uploading ? 'Uploading...' : 'Upload'}
            </button>
            {error && <p className="text-red-600 mt-2">{error}</p>}
          </form>
        </div>
      )}

      
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-xl font-semibold text-gray-800 mb-4">Available Resources</h3>
        {loading ? <p>Loading...</p> : (
          <div className="space-y-3">
            {resources.length === 0 ? <p>No resources uploaded yet.</p> :
              resources.map(resource => (
                <div key={resource.id} className="p-4 border rounded-md">
                  <a 
                    href={resource.file} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="text-lg font-semibold text-indigo-600 hover:underline"
                  >
                    {resource.title}
                  </a>
                  <p className="text-sm text-gray-600">{resource.description}</p>
                  <p className="text-xs text-gray-400">Uploaded by: {resource.uploaded_by?.username || 'System'}</p>
                </div>
              ))
            }
          </div>
        )}
      </div>
    </div>
  );
}

export default ResourceRepository;