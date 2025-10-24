# Midjourney Clone with ComfyUI Integration

A powerful AI image generation platform that replicates the Midjourney experience using ComfyUI as the backend. Create stunning AI-generated images using natural language prompts with Midjourney-style parameters.

## Features

- **Intuitive Web Interface**: Clean, modern UI similar to Midjourney
- **ComfyUI Integration**: Leverages ComfyUI's powerful Stable Diffusion workflows
- **Midjourney-Style Parameters**: Support for familiar parameters like `--ar`, `--seed`, `--chaos`, `--q`, `--s`, and `--no`
- **Real-time Progress Tracking**: WebSocket-based progress updates for image generation
- **Job Queue Management**: Efficient handling of multiple generation requests
- **Image Gallery**: View, filter, and download all your generated images

## Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v16 or higher)
- **ComfyUI** (running and accessible)
- **npm** or **yarn**

## ComfyUI Setup

1. Install and set up ComfyUI from [ComfyUI GitHub](https://github.com/comfyanonymous/ComfyUI)
2. Download required models (SDXL recommended):
   - Place checkpoint models in `ComfyUI/models/checkpoints/`
   - Default workflow expects `sd_xl_base_1.0.safetensors`
3. Start ComfyUI:
   ```bash
   cd ComfyUI
   python main.py
   ```
4. Verify ComfyUI is running at `http://127.0.0.1:8188`

## Installation

1. Clone this repository:
   ```bash
   git clone <repository-url>
   cd midjourney-comfyui-clone
   ```

2. Install backend dependencies:
   ```bash
   npm install
   ```

3. Install frontend dependencies:
   ```bash
   cd client
   npm install
   cd ..
   ```

4. Create environment configuration:
   ```bash
   cp .env.example .env
   ```

5. Edit `.env` file with your settings:
   ```env
   # ComfyUI Configuration
   COMFYUI_HOST=127.0.0.1
   COMFYUI_PORT=8188

   # Server Configuration
   SERVER_PORT=3001

   # Storage
   IMAGES_DIR=./output/images
   ```

## Usage

### Development Mode

Run both backend and frontend in development mode:

```bash
npm run dev
```

This will start:
- Backend server at `http://localhost:3001`
- Frontend development server at `http://localhost:3000`

### Production Mode

1. Build the frontend:
   ```bash
   npm run build
   ```

2. Start the backend server:
   ```bash
   npm start
   ```

3. Access the application at `http://localhost:3001`

## Creating Images

### Basic Usage

Simply enter a text prompt describing the image you want to create:

```
a beautiful landscape with mountains and lakes at sunset
```

### Advanced Parameters

Use Midjourney-style parameters to control image generation:

#### Aspect Ratio (`--ar`)
Control the aspect ratio of the generated image:
```
a cyberpunk city --ar 16:9
```

#### Seed (`--seed`)
Use a specific seed for reproducible results:
```
a magical forest --seed 12345
```

#### Chaos (`--chaos`)
Control variation amount (0-100, higher = more varied):
```
abstract art --chaos 50
```

#### Quality (`--q`)
Set quality level (1-5):
```
detailed portrait --q 5
```

#### Stylization (`--s`)
Control stylization strength (0-1000):
```
artistic landscape --s 500
```

#### Negative Prompt (`--no`)
Specify what to avoid in the image:
```
a beautiful beach --no people, buildings, text
```

### Example Prompts

```
a cute robot reading a book in a cozy library, digital art --ar 1:1

futuristic city with flying cars, neon lights, cyberpunk style --ar 21:9 --s 100

portrait of a wise old wizard, detailed, fantasy art --no blur, watermark --ar 2:3

underwater scene with colorful coral reef --seed 42 --q 5
```

## Project Structure

```
midjourney-comfyui-clone/
├── server/
│   ├── index.js              # Main Express server
│   ├── comfyui-client.js     # ComfyUI API client
│   ├── workflow-generator.js # Workflow generation logic
│   └── job-queue.js          # Job queue management
├── client/
│   ├── src/
│   │   ├── components/       # React components
│   │   ├── App.jsx           # Main app component
│   │   └── main.jsx          # Entry point
│   ├── index.html
│   └── package.json
├── output/
│   └── images/               # Generated images storage
├── package.json
├── .env.example
└── README.md
```

## API Documentation

### Endpoints

#### `GET /api/health`
Check server and ComfyUI connection status.

**Response:**
```json
{
  "server": "ok",
  "comfyui": "healthy",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

#### `POST /api/imagine`
Create a new image generation job.

**Request:**
```json
{
  "prompt": "a beautiful landscape --ar 16:9",
  "options": {
    "width": 1024,
    "height": 1024,
    "steps": 20
  }
}
```

**Response:**
```json
{
  "jobId": "uuid",
  "status": "queued",
  "message": "Job created successfully"
}
```

#### `GET /api/jobs/:jobId`
Get status of a specific job.

**Response:**
```json
{
  "id": "uuid",
  "prompt": "a beautiful landscape",
  "status": "completed",
  "progress": 100,
  "images": [
    {
      "filename": "image.png",
      "url": "/api/images/image.png"
    }
  ],
  "createdAt": 1234567890,
  "updatedAt": 1234567890
}
```

#### `GET /api/jobs`
Get all jobs (optionally filtered by status).

**Query Parameters:**
- `status`: Filter by job status (queued, processing, completed, failed)

#### `GET /api/images/:filename`
Retrieve a generated image.

#### `GET /api/comfyui/queue`
Get ComfyUI queue status.

#### `POST /api/comfyui/interrupt`
Interrupt current ComfyUI execution.

## Customization

### Modifying the Workflow

Edit `server/workflow-generator.js` to customize the ComfyUI workflow:

- Change default parameters
- Add new nodes
- Support different models
- Implement upscaling or other post-processing

### Styling

Edit CSS files in `client/src/` to customize the appearance:

- `App.css` - Main app styles
- `components/*.css` - Component-specific styles

### Adding New Parameters

1. Update `WorkflowGenerator.parseMidjourneyParams()` to parse new parameters
2. Modify the workflow generation to use these parameters
3. Update documentation

## Troubleshooting

### ComfyUI Connection Failed

- Ensure ComfyUI is running at the configured host and port
- Check firewall settings
- Verify `.env` configuration

### Images Not Generating

- Check ComfyUI console for errors
- Verify model files are installed correctly
- Ensure sufficient disk space and memory
- Check the workflow is compatible with your ComfyUI version

### Frontend Not Loading

- Clear browser cache
- Check console for errors
- Verify backend is running
- Check proxy configuration in `client/vite.config.js`

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT License - feel free to use this project for personal or commercial purposes.

## Acknowledgments

- [ComfyUI](https://github.com/comfyanonymous/ComfyUI) - The powerful backend for image generation
- Inspired by [Midjourney](https://www.midjourney.com/) - The amazing AI art platform
- Built with React, Express, and Node.js

## Support

For issues, questions, or contributions, please open an issue on GitHub.
