const EventEmitter = require('events');

/**
 * Manages image generation jobs and their status
 */
class JobQueue extends EventEmitter {
  constructor() {
    super();
    this.jobs = new Map();
  }

  /**
   * Create a new job
   */
  createJob(jobId, prompt, options) {
    const job = {
      id: jobId,
      prompt,
      options,
      status: 'queued',
      progress: 0,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      images: [],
      error: null,
      comfyPromptId: null
    };

    this.jobs.set(jobId, job);
    this.emit('jobCreated', job);
    return job;
  }

  /**
   * Update job status
   */
  updateJob(jobId, updates) {
    const job = this.jobs.get(jobId);
    if (!job) {
      throw new Error(`Job ${jobId} not found`);
    }

    Object.assign(job, updates, { updatedAt: Date.now() });
    this.emit('jobUpdated', job);
    return job;
  }

  /**
   * Set job as processing
   */
  setProcessing(jobId, comfyPromptId) {
    return this.updateJob(jobId, {
      status: 'processing',
      comfyPromptId
    });
  }

  /**
   * Update job progress
   */
  updateProgress(jobId, progress) {
    return this.updateJob(jobId, {
      progress: Math.min(Math.max(progress, 0), 100)
    });
  }

  /**
   * Set job as completed
   */
  setCompleted(jobId, images) {
    return this.updateJob(jobId, {
      status: 'completed',
      progress: 100,
      images
    });
  }

  /**
   * Set job as failed
   */
  setFailed(jobId, error) {
    return this.updateJob(jobId, {
      status: 'failed',
      error: error.message || String(error)
    });
  }

  /**
   * Get job by ID
   */
  getJob(jobId) {
    return this.jobs.get(jobId);
  }

  /**
   * Get all jobs
   */
  getAllJobs() {
    return Array.from(this.jobs.values()).sort((a, b) => b.createdAt - a.createdAt);
  }

  /**
   * Get jobs by status
   */
  getJobsByStatus(status) {
    return Array.from(this.jobs.values())
      .filter(job => job.status === status)
      .sort((a, b) => b.createdAt - a.createdAt);
  }

  /**
   * Clean old completed jobs (older than 1 hour)
   */
  cleanOldJobs() {
    const oneHourAgo = Date.now() - (60 * 60 * 1000);
    let cleaned = 0;

    for (const [jobId, job] of this.jobs.entries()) {
      if (job.status === 'completed' && job.updatedAt < oneHourAgo) {
        this.jobs.delete(jobId);
        cleaned++;
      }
    }

    if (cleaned > 0) {
      console.log(`Cleaned ${cleaned} old jobs`);
    }

    return cleaned;
  }
}

module.exports = JobQueue;
