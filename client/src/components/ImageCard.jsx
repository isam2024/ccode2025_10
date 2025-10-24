import { useState } from 'react';
import './ImageCard.css';

function ImageCard({ job }) {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed': return '✓';
      case 'processing': return '⏳';
      case 'queued': return '⋯';
      case 'failed': return '✗';
      default: return '?';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return '#10b981';
      case 'processing': return '#3b82f6';
      case 'queued': return '#f59e0b';
      case 'failed': return '#ef4444';
      default: return '#6b7280';
    }
  };

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now - date;

    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days}d ago`;
    if (hours > 0) return `${hours}h ago`;
    if (minutes > 0) return `${minutes}m ago`;
    return `${seconds}s ago`;
  };

  return (
    <div className="image-card">
      <div className="image-container">
        {job.status === 'completed' && job.images && job.images.length > 0 ? (
          <>
            {!imageLoaded && !imageError && (
              <div className="image-placeholder">
                <div className="spinner-large"></div>
              </div>
            )}
            {imageError ? (
              <div className="image-error">
                <span>Failed to load image</span>
              </div>
            ) : (
              <img
                src={job.images[0].url}
                alt={job.prompt}
                className={`job-image ${imageLoaded ? 'loaded' : ''}`}
                onLoad={() => setImageLoaded(true)}
                onError={() => setImageError(true)}
              />
            )}
          </>
        ) : job.status === 'processing' ? (
          <div className="image-placeholder processing">
            <div className="spinner-large"></div>
            <div className="progress-bar">
              <div
                className="progress-fill"
                style={{ width: `${job.progress || 0}%` }}
              ></div>
            </div>
            <p>{job.progress || 0}%</p>
          </div>
        ) : job.status === 'queued' ? (
          <div className="image-placeholder queued">
            <span className="placeholder-icon">⏳</span>
            <p>Queued</p>
          </div>
        ) : job.status === 'failed' ? (
          <div className="image-placeholder failed">
            <span className="placeholder-icon">✗</span>
            <p>Failed</p>
            {job.error && <small>{job.error}</small>}
          </div>
        ) : null}
      </div>

      <div className="card-content">
        <div className="card-header">
          <span
            className="status-badge"
            style={{ backgroundColor: getStatusColor(job.status) }}
          >
            {getStatusIcon(job.status)} {job.status}
          </span>
          <span className="time-badge">{formatTime(job.createdAt)}</span>
        </div>

        <p className="prompt-text">{job.prompt}</p>

        {job.options && Object.keys(job.options).length > 0 && (
          <div className="options-tags">
            {Object.entries(job.options).map(([key, value]) => (
              <span key={key} className="option-tag">
                {key}: {String(value)}
              </span>
            ))}
          </div>
        )}

        {job.status === 'completed' && job.images && job.images.length > 0 && (
          <a
            href={job.images[0].url}
            download
            className="download-button"
            target="_blank"
            rel="noopener noreferrer"
          >
            Download
          </a>
        )}
      </div>
    </div>
  );
}

export default ImageCard;
