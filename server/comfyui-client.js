const axios = require('axios');
const WebSocket = require('ws');
const { v4: uuidv4 } = require('uuid');

class ComfyUIClient {
  constructor(host = '127.0.0.1', port = 8188) {
    this.host = host;
    this.port = port;
    this.baseUrl = `http://${host}:${port}`;
    this.wsUrl = `ws://${host}:${port}/ws`;
    this.clientId = uuidv4();
  }

  /**
   * Connect to ComfyUI WebSocket for progress updates
   */
  connectWebSocket(onMessage, onError) {
    return new Promise((resolve, reject) => {
      const ws = new WebSocket(`${this.wsUrl}?clientId=${this.clientId}`);

      ws.on('open', () => {
        console.log('Connected to ComfyUI WebSocket');
        resolve(ws);
      });

      ws.on('message', (data) => {
        try {
          const message = JSON.parse(data);
          if (onMessage) onMessage(message);
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
        }
      });

      ws.on('error', (error) => {
        console.error('WebSocket error:', error);
        if (onError) onError(error);
        reject(error);
      });

      ws.on('close', () => {
        console.log('WebSocket connection closed');
      });
    });
  }

  /**
   * Queue a workflow/prompt for execution
   */
  async queuePrompt(workflow) {
    try {
      const response = await axios.post(`${this.baseUrl}/prompt`, {
        prompt: workflow,
        client_id: this.clientId
      });
      return response.data;
    } catch (error) {
      console.error('Error queuing prompt:', error.message);
      throw new Error(`Failed to queue prompt: ${error.message}`);
    }
  }

  /**
   * Get the current queue status
   */
  async getQueue() {
    try {
      const response = await axios.get(`${this.baseUrl}/queue`);
      return response.data;
    } catch (error) {
      console.error('Error getting queue:', error.message);
      throw error;
    }
  }

  /**
   * Get generated image
   */
  async getImage(filename, subfolder = '', type = 'output') {
    try {
      const response = await axios.get(`${this.baseUrl}/view`, {
        params: { filename, subfolder, type },
        responseType: 'arraybuffer'
      });
      return response.data;
    } catch (error) {
      console.error('Error getting image:', error.message);
      throw error;
    }
  }

  /**
   * Get history of executions
   */
  async getHistory(promptId) {
    try {
      const response = await axios.get(`${this.baseUrl}/history/${promptId}`);
      return response.data;
    } catch (error) {
      console.error('Error getting history:', error.message);
      throw error;
    }
  }

  /**
   * Interrupt current execution
   */
  async interrupt() {
    try {
      await axios.post(`${this.baseUrl}/interrupt`);
      return { success: true };
    } catch (error) {
      console.error('Error interrupting:', error.message);
      throw error;
    }
  }

  /**
   * Get list of available models
   */
  async getModels() {
    try {
      const response = await axios.get(`${this.baseUrl}/object_info`);
      return response.data;
    } catch (error) {
      console.error('Error getting models:', error.message);
      throw error;
    }
  }

  /**
   * Check if ComfyUI is reachable
   */
  async checkHealth() {
    try {
      const response = await axios.get(`${this.baseUrl}/system_stats`, {
        timeout: 5000
      });
      return { status: 'healthy', data: response.data };
    } catch (error) {
      return { status: 'unhealthy', error: error.message };
    }
  }
}

module.exports = ComfyUIClient;
