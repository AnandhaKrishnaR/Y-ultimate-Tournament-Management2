import React, { useState } from 'react';
import { motion } from 'framer-motion';
import axios from 'axios';
import localImage from './assets/ui.png';

const apiClient = axios.create({
  baseURL: 'http://127.0.0.1:8000'
});

function Login({ onLoginSuccess, onGoToRegister }) { 
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await apiClient.post('/api/users/token/', {
        username: username,
        password: password
      });

      const { access, refresh } = response.data;
      localStorage.setItem('accessToken', access);
      localStorage.setItem('refreshToken', refresh);

      const userResponse = await apiClient.get('/api/users/me/', {
        headers: {
          'Authorization': `Bearer ${access}`
        }
      });

      onLoginSuccess(userResponse.data); 

    } catch (err) {
      console.error('Login failed:', err);
      
      if (err.code === 'ERR_NETWORK' || err.message === 'Network Error') {
        setError('Cannot connect to server. Please make sure the backend is running on http://127.0.0.1:8000');
      } else if (err.response) {
        
        const status = err.response.status;
        if (status === 401) {
          setError('Invalid Email or Username / Password.');
        } else if (status === 500) {
          setError('Server error. Please try again later.');
        } else {
          setError(`Login failed: ${err.response.data?.detail || err.response.data?.message || 'Unknown error'}`);
        }
      } else {
        setError('Login failed. Please check your connection and try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-6xl bg-white rounded-3xl shadow-strong overflow-hidden flex flex-col md:flex-row"
      >
        
        <div 
          className="hidden md:flex md:flex-[1.7] bg-cover bg-center relative"
          style={{ backgroundImage: `url(${localImage})` }}
        >
          <div className="absolute inset-0 bg-gradient-to-br from-primary-600/80 to-accent-600/80" />
          <div className="relative z-10 flex items-center justify-center p-12 text-white">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-center"
            >
              <h1 className="text-4xl font-bold mb-4">Y-ULTIMATE</h1>
              <p className="text-xl opacity-90">Management Platform</p>
            </motion.div>
          </div>
        </div>
        
        
        <div className="flex-1 flex items-center justify-center p-8 md:p-12">
          <div className="w-full max-w-md">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-center mb-8"
            >
              <p className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-2">
                Y-ULTIMATE MANAGEMENT PLATFORM
              </p>
              <h2 className="text-3xl font-bold text-gray-800">Welcome Back</h2>
              <p className="text-gray-600 mt-2">Login to your account</p>
            </motion.div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
              >
                <input 
                  type="text" 
                  placeholder="Email or Username" 
                  value={username} 
                  onChange={(e) => setUsername(e.target.value)} 
                  required
                  className="w-full px-4 py-3.5 border-2 border-gray-200 rounded-xl focus:border-primary-500 focus:outline-none transition-all duration-300 text-gray-800 placeholder-gray-400"
                />
              </motion.div>
              
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
              >
                <input 
                  type="password" 
                  placeholder="Password" 
                  value={password} 
                  onChange={(e) => setPassword(e.target.value)} 
                  required
                  className="w-full px-4 py-3.5 border-2 border-gray-200 rounded-xl focus:border-primary-500 focus:outline-none transition-all duration-300 text-gray-800 placeholder-gray-400"
                />
              </motion.div>

              {error && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="p-3 bg-red-50 border border-red-200 text-red-600 rounded-xl text-sm"
                >
                  {error}
                </motion.div>
              )}

              <motion.button
                type="submit"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                disabled={loading}
                className="w-full py-3.5 bg-gradient-to-r from-primary-600 to-primary-500 hover:from-primary-700 hover:to-primary-600 text-white font-semibold rounded-xl shadow-medium transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Logging in...
                  </span>
                ) : (
                  'Login'
                )}
              </motion.button>
            </form>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="mt-6 text-center space-y-3"
            >
              <div className="flex items-center justify-center gap-4 text-sm text-gray-600">
                <a href="#" className="hover:text-primary-600 transition-colors">Forgot Password?</a>
                <span className="text-gray-300">|</span>
                <button
                  onClick={onGoToRegister}
                  className="hover:text-primary-600 transition-colors"
                >
                  Register as Spectator?
                </button>
              </div>
              <p className="text-xs text-gray-400">Built by Team VisionX</p>
            </motion.div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

export default Login;