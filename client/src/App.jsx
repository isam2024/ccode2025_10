import { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';
import ImageGrid from './components/ImageGrid';
import PromptInput from './components/PromptInput';
import StatusBar from './components/StatusBar';

const API_BASE = import.meta.env.VITE_API_BASE || '/api';

function App() {
  const [jobs, setJobs] = useState([]);
  const [health, setHealth] = useState({ server: 'checking', comfyui: 'checking' });
  const [loading, setLoading] = useState(false);

  // Fetch health status
  useEffect(() => {
    checkHealth();
    const interval = setInterval(checkHealth, 30000); // Every 30 seconds
    return () => clearInterval(interval);
  }, []);

  // Fetch jobs
  useEffect(() => {
    fetchJobs();
    const interval = setInterval(fetchJobs, 3000); // Every 3 seconds
    return () => clearInterval(interval);
  }, []);

  const checkHealth = async () => {
    try {
      const response = await axios.get(`${API_BASE}/health`);
      setHealth(response.data);
    } catch (error) {
      console.error('Health check failed:', error);
      setHealth({ server: 'error', comfyui: 'error' });
    }
  };

  const fetchJobs = async () => {
    try {
      const response = await axios.get(`${API_BASE}/jobs`);
      setJobs(response.data);
    } catch (error) {
      console.error('Error fetching jobs:', error);
    }
  };

  const handleImagine = async (prompt) => {
    setLoading(true);
    try {
      const response = await axios.post(`${API_BASE}/imagine`, { prompt });
      console.log('Job created:', response.data);
      // Immediately fetch jobs to show the new job
      await fetchJobs();
    } catch (error) {
      console.error('Error creating job:', error);
      alert(`Error: ${error.response?.data?.error || error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app">
      <header className="app-header">
        <div className="header-content">
          <h1 className="logo">
            <span className="logo-icon">✨</span>
            MidJourney Clone
            <span className="logo-subtitle">Powered by ComfyUI</span>
          </h1>
          <StatusBar health={health} />
        </div>
      </header>

      <main className="app-main">
        <PromptInput onSubmit={handleImagine} loading={loading} />
        <ImageGrid jobs={jobs} />
      </main>

      <footer className="app-footer">
        <p>
          Create stunning AI images using natural language prompts.
          Supports Midjourney-style parameters like --ar, --seed, --chaos, --q, --s, --no
        </p>
      </footer>
    </div>
  );
}

export default App;
