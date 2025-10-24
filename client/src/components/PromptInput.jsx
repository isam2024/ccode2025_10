import { useState } from 'react';
import './PromptInput.css';

function PromptInput({ onSubmit, loading }) {
  const [prompt, setPrompt] = useState('');
  const [showHelp, setShowHelp] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (prompt.trim() && !loading) {
      onSubmit(prompt);
      setPrompt('');
    }
  };

  const examplePrompts = [
    'a beautiful landscape with mountains and lakes, sunset, photorealistic --ar 16:9',
    'a cute robot reading a book in a cozy library, digital art --ar 1:1',
    'futuristic city with flying cars, neon lights, cyberpunk style --ar 21:9 --s 100',
    'portrait of a wise old wizard, detailed, fantasy art --no blur, watermark --ar 2:3'
  ];

  return (
    <div className="prompt-input-container">
      <form onSubmit={handleSubmit} className="prompt-form">
        <div className="input-wrapper">
          <input
            type="text"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Describe the image you want to create..."
            className="prompt-input"
            disabled={loading}
          />
          <button
            type="button"
            className="help-button"
            onClick={() => setShowHelp(!showHelp)}
            title="Show help"
          >
            ?
          </button>
        </div>
        <button
          type="submit"
          className="submit-button"
          disabled={!prompt.trim() || loading}
        >
          {loading ? (
            <>
              <span className="spinner"></span>
              Generating...
            </>
          ) : (
            <>
              <span className="button-icon">✨</span>
              Imagine
            </>
          )}
        </button>
      </form>

      {showHelp && (
        <div className="help-panel">
          <h3>Supported Parameters</h3>
          <div className="help-content">
            <div className="help-item">
              <code>--ar [width]:[height]</code>
              <span>Aspect ratio (e.g., --ar 16:9)</span>
            </div>
            <div className="help-item">
              <code>--seed [number]</code>
              <span>Random seed for reproducibility</span>
            </div>
            <div className="help-item">
              <code>--chaos [0-100]</code>
              <span>Variation amount (higher = more varied)</span>
            </div>
            <div className="help-item">
              <code>--q [1-5]</code>
              <span>Quality level</span>
            </div>
            <div className="help-item">
              <code>--s [0-1000]</code>
              <span>Stylization strength</span>
            </div>
            <div className="help-item">
              <code>--no [terms]</code>
              <span>Negative prompt (things to avoid)</span>
            </div>
          </div>

          <h4>Example Prompts:</h4>
          <div className="examples">
            {examplePrompts.map((example, index) => (
              <button
                key={index}
                className="example-button"
                onClick={() => setPrompt(example)}
              >
                {example}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default PromptInput;
