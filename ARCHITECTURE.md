# Architecture Documentation

## System Overview

The Midjourney-ComfyUI Clone is a full-stack application that provides a Midjourney-like interface for generating AI images using ComfyUI as the backend engine.

## Architecture Diagram

```
┌─────────────────┐
│   Web Browser   │
│    (Client)     │
└────────┬────────┘
         │ HTTP/WebSocket
         │
┌────────▼────────────────┐
│   Express Server        │
│   - REST API            │
│   - Job Queue           │
│   - Image Storage       │
└────────┬────────────────┘
         │ HTTP/WebSocket
         │
┌────────▼────────────────┐
│      ComfyUI            │
│   - Stable Diffusion    │
│   - Workflow Execution  │
│   - Model Management    │
└─────────────────────────┘
```

## Component Architecture

### Frontend (React + Vite)

#### Components

1. **App.jsx**
   - Main application container
   - Manages global state (jobs, health)
   - Coordinates component communication
   - Polling for job updates

2. **PromptInput**
   - User input for prompts
   - Parameter help panel
   - Example prompts
   - Form validation and submission

3. **ImageGrid**
   - Display generated images
   - Filter by status
   - Grid layout with responsive design

4. **ImageCard**
   - Individual image display
   - Progress indicators
   - Download functionality
   - Status badges

5. **StatusBar**
   - Connection status indicators
   - Real-time health monitoring

#### State Management

- **Local State**: React useState for component-specific state
- **Polling**: Regular intervals to fetch job updates (3s) and health (30s)
- **No Redux**: Deliberately simple state management for ease of maintenance

### Backend (Node.js + Express)

#### Core Modules

1. **server/index.js** (Main Server)
   - Express application setup
   - API routes
   - WebSocket management
   - Job processing orchestration
   - Image serving

2. **server/comfyui-client.js** (ComfyUI Client)
   - HTTP API wrapper for ComfyUI
   - WebSocket connection management
   - Queue management
   - Image retrieval
   - Health checks

3. **server/workflow-generator.js** (Workflow Generator)
   - Converts text prompts to ComfyUI workflows
   - Parses Midjourney-style parameters
   - Generates workflow JSON
   - Supports multiple workflow types

4. **server/job-queue.js** (Job Queue)
   - In-memory job storage
   - Status tracking
   - Event emitter for updates
   - Automatic cleanup

## Data Flow

### Image Generation Flow

```
1. User enters prompt
   ↓
2. Frontend sends POST /api/imagine
   ↓
3. Server creates job in queue
   ↓
4. Server parses Midjourney parameters
   ↓
5. Server generates ComfyUI workflow
   ↓
6. Server submits workflow to ComfyUI
   ↓
7. ComfyUI processes workflow
   ↓
8. Server receives WebSocket updates
   ↓
9. Server updates job progress
   ↓
10. Server retrieves generated image
   ↓
11. Server saves image locally
   ↓
12. Server marks job as completed
   ↓
13. Frontend polls and displays result
```

### WebSocket Communication

```
ComfyUI → Server:
- progress: Current step progress
- executing: Node execution status
- execution_error: Error messages

Server → (Internal Event Emitter):
- jobCreated
- jobUpdated
```

## API Layer

### REST Endpoints

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/health` | GET | Server and ComfyUI health status |
| `/api/imagine` | POST | Create new image generation job |
| `/api/jobs` | GET | List all jobs (with optional filtering) |
| `/api/jobs/:jobId` | GET | Get specific job status |
| `/api/images/:filename` | GET | Serve generated images |
| `/api/comfyui/queue` | GET | Get ComfyUI queue status |
| `/api/comfyui/interrupt` | POST | Cancel current execution |

### Data Models

#### Job Object
```javascript
{
  id: string,              // Unique job identifier
  prompt: string,          // User's prompt
  options: object,         // Generation options
  status: string,          // queued|processing|completed|failed
  progress: number,        // 0-100
  createdAt: number,       // Timestamp
  updatedAt: number,       // Timestamp
  images: array,           // Generated image URLs
  error: string|null,      // Error message if failed
  comfyPromptId: string    // ComfyUI prompt ID
}
```

## Workflow Generation

### Parameter Parsing

The system parses Midjourney-style parameters:

```javascript
"prompt --ar 16:9 --seed 42"
↓
{
  prompt: "prompt",
  options: {
    width: 1024,
    height: 576,  // Calculated from 16:9
    seed: 42
  }
}
```

### ComfyUI Workflow Structure

Generated workflows follow ComfyUI's node-based format:

```javascript
{
  "node_id": {
    "inputs": {...},
    "class_type": "NodeType",
    "_meta": {...}
  }
}
```

Key nodes:
- **CheckpointLoaderSimple**: Load model
- **CLIPTextEncode**: Process prompts
- **EmptyLatentImage**: Create canvas
- **KSampler**: Generation sampler
- **VAEDecode**: Decode latent image
- **SaveImage**: Save result

## Storage

### File System Structure

```
output/
└── images/
    ├── {jobId}_{timestamp}.png
    ├── {jobId}_{timestamp}.png
    └── ...
```

### In-Memory Storage

- **Jobs**: Map<jobId, job>
- **WebSockets**: Map<jobId, WebSocket>

Automatic cleanup of completed jobs after 1 hour.

## Error Handling

### Error Types

1. **Connection Errors**: ComfyUI not reachable
2. **Validation Errors**: Invalid prompts or parameters
3. **Generation Errors**: ComfyUI workflow execution failures
4. **File Errors**: Image storage/retrieval issues

### Error Flow

```
Error occurs
↓
Caught in try-catch
↓
Job marked as failed
↓
Error message stored in job
↓
WebSocket closed
↓
Frontend displays error
```

## Scalability Considerations

### Current Limitations

- **In-Memory Storage**: Jobs lost on restart
- **Single Server**: No horizontal scaling
- **No Authentication**: Open access
- **Local Files**: No CDN or cloud storage

### Potential Improvements

1. **Database**: PostgreSQL/MongoDB for job persistence
2. **Redis**: Job queue and caching
3. **S3/CDN**: Cloud image storage
4. **Authentication**: User accounts and API keys
5. **Load Balancer**: Multiple server instances
6. **WebSocket Scaling**: Redis pub/sub
7. **Rate Limiting**: Prevent abuse
8. **Job Priority**: Queue management

## Security

### Current Implementation

- **CORS**: Enabled for development
- **Input Validation**: Basic validation on prompts
- **File Serving**: Restricted to output directory

### Recommendations for Production

1. Add authentication/authorization
2. Implement rate limiting
3. Validate and sanitize all inputs
4. Use HTTPS
5. Set up proper CORS policies
6. Implement file size limits
7. Add request signing
8. Set up monitoring and alerts

## Performance

### Optimization Strategies

1. **Polling**: 3-second intervals for job updates
2. **WebSocket**: Real-time progress from ComfyUI
3. **Lazy Loading**: Images loaded on demand
4. **Cleanup**: Automatic old job removal
5. **Caching**: Static assets cached by browser

### Bottlenecks

- ComfyUI generation speed (hardware dependent)
- Network transfer of images
- Disk I/O for image storage

## Monitoring

### Health Checks

- Server status
- ComfyUI connectivity
- Disk space (manual monitoring needed)

### Logging

Console logging for:
- Job lifecycle events
- API requests
- Errors and warnings
- ComfyUI communication

## Technology Stack

### Frontend
- React 18
- Vite
- Axios
- CSS3

### Backend
- Node.js
- Express
- WebSocket (ws)
- Axios

### Infrastructure
- ComfyUI
- File System Storage

## Development Guidelines

### Code Organization

- **Separation of Concerns**: Each module has a single responsibility
- **Error Handling**: Try-catch blocks with proper error propagation
- **Async/Await**: Modern asynchronous code
- **Event-Driven**: EventEmitter for job updates

### Adding New Features

1. Update workflow generator if needed
2. Add API endpoints if needed
3. Update frontend components
4. Update documentation
5. Test integration

### Testing Strategy

- Manual testing via UI
- ComfyUI integration testing
- Error scenario testing
- Performance testing under load
