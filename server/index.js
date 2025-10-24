require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs').promises;
const { v4: uuidv4 } = require('uuid');

const ComfyUIClient = require('./comfyui-client');
const WorkflowGenerator = require('./workflow-generator');
const JobQueue = require('./job-queue');

const app = express();
let PORT = parseInt(process.env.SERVER_PORT || '3001');

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Initialize services
const comfyClient = new ComfyUIClient(
  process.env.COMFYUI_HOST || '127.0.0.1',
  parseInt(process.env.COMFYUI_PORT || '8188')
);

const jobQueue = new JobQueue();

// Store for WebSocket connections per job
const jobWebSockets = new Map();

// Ensure output directory exists
const IMAGES_DIR = process.env.IMAGES_DIR || './output/images';
async function ensureDirectories() {
  try {
    await fs.mkdir(IMAGES_DIR, { recursive: true });
    console.log(`Images directory ready: ${IMAGES_DIR}`);
  } catch (error) {
    console.error('Error creating directories:', error);
  }
}

/**
 * Process a job by submitting it to ComfyUI
 */
async function processJob(job) {
  try {
    console.log(`Processing job ${job.id}: "${job.prompt}"`);

    // Parse Midjourney-style parameters
    const { prompt, options } = WorkflowGenerator.parseMidjourneyParams(job.prompt);

    // Merge with job options
    const workflowOptions = { ...options, ...job.options };

    // Generate workflow
    const workflow = WorkflowGenerator.generateTextToImage(prompt, workflowOptions);

    // Connect to WebSocket for progress updates
    const ws = await comfyClient.connectWebSocket(
      (message) => handleWebSocketMessage(job.id, message),
      (error) => console.error(`WebSocket error for job ${job.id}:`, error)
    );

    jobWebSockets.set(job.id, ws);

    // Queue the workflow
    const result = await comfyClient.queuePrompt(workflow);
    const comfyPromptId = result.prompt_id;

    console.log(`Job ${job.id} queued in ComfyUI with prompt ID: ${comfyPromptId}`);
    jobQueue.setProcessing(job.id, comfyPromptId);

    // Note: Image retrieval will be handled by WebSocket messages
  } catch (error) {
    console.error(`Error processing job ${job.id}:`, error);
    jobQueue.setFailed(job.id, error);

    // Clean up WebSocket
    const ws = jobWebSockets.get(job.id);
    if (ws) {
      ws.close();
      jobWebSockets.delete(job.id);
    }
  }
}

/**
 * Handle WebSocket messages from ComfyUI
 */
async function handleWebSocketMessage(jobId, message) {
  const job = jobQueue.getJob(jobId);
  if (!job) return;

  try {
    if (message.type === 'progress') {
      // Update progress
      const progress = Math.round((message.data.value / message.data.max) * 100);
      jobQueue.updateProgress(jobId, progress);
    } else if (message.type === 'executing' && message.data.node === null) {
      // Execution completed
      console.log(`Job ${jobId} execution completed, fetching images...`);

      // Fetch the generated images from history
      const history = await comfyClient.getHistory(job.comfyPromptId);
      const outputs = history[job.comfyPromptId]?.outputs;

      if (outputs) {
        const images = [];

        // Find all saved images in the outputs
        for (const nodeId in outputs) {
          const nodeOutput = outputs[nodeId];
          if (nodeOutput.images) {
            for (const img of nodeOutput.images) {
              // Fetch the image data
              const imageData = await comfyClient.getImage(
                img.filename,
                img.subfolder || '',
                img.type || 'output'
              );

              // Save image locally
              const filename = `${jobId}_${Date.now()}.png`;
              const filepath = path.join(IMAGES_DIR, filename);
              await fs.writeFile(filepath, Buffer.from(imageData));

              images.push({
                filename,
                url: `/api/images/${filename}`,
                comfyFilename: img.filename
              });
            }
          }
        }

        jobQueue.setCompleted(jobId, images);
        console.log(`Job ${jobId} completed with ${images.length} images`);
      } else {
        jobQueue.setFailed(jobId, new Error('No outputs found in ComfyUI history'));
      }

      // Close WebSocket
      const ws = jobWebSockets.get(jobId);
      if (ws) {
        ws.close();
        jobWebSockets.delete(jobId);
      }
    } else if (message.type === 'execution_error') {
      // Execution failed
      console.error(`Job ${jobId} execution error:`, message.data);
      jobQueue.setFailed(jobId, new Error(message.data.exception_message || 'Execution error'));

      // Close WebSocket
      const ws = jobWebSockets.get(jobId);
      if (ws) {
        ws.close();
        jobWebSockets.delete(jobId);
      }
    }
  } catch (error) {
    console.error(`Error handling WebSocket message for job ${jobId}:`, error);
    jobQueue.setFailed(jobId, error);
  }
}

// API Routes

/**
 * Health check
 */
app.get('/api/health', async (req, res) => {
  const health = await comfyClient.checkHealth();
  res.json({
    server: 'ok',
    comfyui: health.status,
    timestamp: new Date().toISOString()
  });
});

/**
 * Create new image generation job
 */
app.post('/api/imagine', async (req, res) => {
  try {
    const { prompt, options = {} } = req.body;

    if (!prompt || typeof prompt !== 'string') {
      return res.status(400).json({ error: 'Prompt is required' });
    }

    // Create job
    const jobId = uuidv4();
    const job = jobQueue.createJob(jobId, prompt, options);

    // Start processing asynchronously
    processJob(job).catch(error => {
      console.error(`Unhandled error processing job ${jobId}:`, error);
    });

    res.json({
      jobId: job.id,
      status: job.status,
      message: 'Job created successfully'
    });
  } catch (error) {
    console.error('Error creating job:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * Get job status
 */
app.get('/api/jobs/:jobId', (req, res) => {
  const { jobId } = req.params;
  const job = jobQueue.getJob(jobId);

  if (!job) {
    return res.status(404).json({ error: 'Job not found' });
  }

  res.json(job);
});

/**
 * Get all jobs
 */
app.get('/api/jobs', (req, res) => {
  const { status } = req.query;

  const jobs = status
    ? jobQueue.getJobsByStatus(status)
    : jobQueue.getAllJobs();

  res.json(jobs);
});

/**
 * Serve generated images
 */
app.get('/api/images/:filename', async (req, res) => {
  try {
    const { filename } = req.params;
    const filepath = path.join(IMAGES_DIR, filename);

    res.sendFile(path.resolve(filepath));
  } catch (error) {
    res.status(404).json({ error: 'Image not found' });
  }
});

/**
 * Get ComfyUI queue status
 */
app.get('/api/comfyui/queue', async (req, res) => {
  try {
    const queue = await comfyClient.getQueue();
    res.json(queue);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * Interrupt current ComfyUI execution
 */
app.post('/api/comfyui/interrupt', async (req, res) => {
  try {
    await comfyClient.interrupt();
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Cleanup old jobs every 15 minutes
setInterval(() => {
  jobQueue.cleanOldJobs();
}, 15 * 60 * 1000);

// Start server with automatic port finding
async function start() {
  await ensureDirectories();

  const server = app.listen(PORT, () => {
    // Get the actual port that was assigned
    const actualPort = server.address().port;
    PORT = actualPort;

    console.log(`
╔═══════════════════════════════════════════════╗
║   Midjourney-ComfyUI Clone Server Started    ║
╠═══════════════════════════════════════════════╣
║  Server:  http://localhost:${actualPort}${actualPort.toString().length < 5 ? ' '.repeat(5 - actualPort.toString().length) : ''}         ║
║  ComfyUI: ${comfyClient.baseUrl}            ║
╚═══════════════════════════════════════════════╝
    `);

    // Check ComfyUI connection
    comfyClient.checkHealth().then(health => {
      if (health.status === 'healthy') {
        console.log('✓ ComfyUI connection successful');
      } else {
        console.log('✗ ComfyUI connection failed:', health.error);
        console.log('  Make sure ComfyUI is running at', comfyClient.baseUrl);
      }
    });
  });

  // Handle port in use error
  server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      console.log(`Port ${PORT} is in use, trying port ${PORT + 1}...`);
      PORT++;
      server.close();
      start();
    } else {
      throw err;
    }
  });
}

start().catch(error => {
  console.error('Failed to start server:', error);
  process.exit(1);
});
