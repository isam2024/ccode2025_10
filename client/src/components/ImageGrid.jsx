import { useState } from 'react';
import './ImageGrid.css';
import ImageCard from './ImageCard';

function ImageGrid({ jobs }) {
  const [filter, setFilter] = useState('all');

  const filteredJobs = jobs.filter(job => {
    if (filter === 'all') return true;
    return job.status === filter;
  });

  const statusCounts = {
    all: jobs.length,
    completed: jobs.filter(j => j.status === 'completed').length,
    processing: jobs.filter(j => j.status === 'processing').length,
    queued: jobs.filter(j => j.status === 'queued').length,
    failed: jobs.filter(j => j.status === 'failed').length
  };

  return (
    <div className="image-grid-container">
      <div className="grid-header">
        <h2>Generated Images</h2>
        <div className="filter-buttons">
          {Object.entries(statusCounts).map(([status, count]) => (
            <button
              key={status}
              className={`filter-button ${filter === status ? 'active' : ''}`}
              onClick={() => setFilter(status)}
            >
              {status.charAt(0).toUpperCase() + status.slice(1)}
              <span className="count">{count}</span>
            </button>
          ))}
        </div>
      </div>

      {filteredJobs.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">🎨</div>
          <h3>No images yet</h3>
          <p>Start creating by entering a prompt above!</p>
        </div>
      ) : (
        <div className="image-grid">
          {filteredJobs.map(job => (
            <ImageCard key={job.id} job={job} />
          ))}
        </div>
      )}
    </div>
  );
}

export default ImageGrid;
