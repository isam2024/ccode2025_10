import './StatusBar.css';

function StatusBar({ health }) {
  const getStatusColor = (status) => {
    if (status === 'ok' || status === 'healthy') return '#10b981';
    if (status === 'checking') return '#f59e0b';
    return '#ef4444';
  };

  const getStatusText = (status) => {
    if (status === 'ok' || status === 'healthy') return 'Connected';
    if (status === 'checking') return 'Checking...';
    return 'Disconnected';
  };

  return (
    <div className="status-bar">
      <div className="status-item">
        <span className="status-label">Server:</span>
        <span className="status-indicator">
          <span
            className="status-dot"
            style={{ backgroundColor: getStatusColor(health.server) }}
          ></span>
          {getStatusText(health.server)}
        </span>
      </div>
      <div className="status-item">
        <span className="status-label">ComfyUI:</span>
        <span className="status-indicator">
          <span
            className="status-dot"
            style={{ backgroundColor: getStatusColor(health.comfyui) }}
          ></span>
          {getStatusText(health.comfyui)}
        </span>
      </div>
    </div>
  );
}

export default StatusBar;
