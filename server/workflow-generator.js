/**
 * Generates ComfyUI workflows from text prompts
 * This creates a basic Stable Diffusion workflow similar to Midjourney
 */
class WorkflowGenerator {
  /**
   * Generate a basic text-to-image workflow
   */
  static generateTextToImage(prompt, options = {}) {
    const {
      negativePrompt = 'text, watermark, lowres, low quality, worst quality, deformed, glitch, low contrast, noisy, saturation, blurry',
      width = 1024,
      height = 1024,
      steps = 20,
      cfg = 7.5,
      sampler = 'euler',
      scheduler = 'normal',
      seed = Math.floor(Math.random() * 1000000000),
      model = 'sd_xl_base_1.0.safetensors',
      denoise = 1.0
    } = options;

    // Basic SDXL workflow structure
    const workflow = {
      "3": {
        "inputs": {
          "seed": seed,
          "steps": steps,
          "cfg": cfg,
          "sampler_name": sampler,
          "scheduler": scheduler,
          "denoise": denoise,
          "model": ["4", 0],
          "positive": ["6", 0],
          "negative": ["7", 0],
          "latent_image": ["5", 0]
        },
        "class_type": "KSampler",
        "_meta": {
          "title": "KSampler"
        }
      },
      "4": {
        "inputs": {
          "ckpt_name": model
        },
        "class_type": "CheckpointLoaderSimple",
        "_meta": {
          "title": "Load Checkpoint"
        }
      },
      "5": {
        "inputs": {
          "width": width,
          "height": height,
          "batch_size": 1
        },
        "class_type": "EmptyLatentImage",
        "_meta": {
          "title": "Empty Latent Image"
        }
      },
      "6": {
        "inputs": {
          "text": prompt,
          "clip": ["4", 1]
        },
        "class_type": "CLIPTextEncode",
        "_meta": {
          "title": "CLIP Text Encode (Prompt)"
        }
      },
      "7": {
        "inputs": {
          "text": negativePrompt,
          "clip": ["4", 1]
        },
        "class_type": "CLIPTextEncode",
        "_meta": {
          "title": "CLIP Text Encode (Negative)"
        }
      },
      "8": {
        "inputs": {
          "samples": ["3", 0],
          "vae": ["4", 2]
        },
        "class_type": "VAEDecode",
        "_meta": {
          "title": "VAE Decode"
        }
      },
      "9": {
        "inputs": {
          "filename_prefix": "ComfyUI",
          "images": ["8", 0]
        },
        "class_type": "SaveImage",
        "_meta": {
          "title": "Save Image"
        }
      }
    };

    return workflow;
  }

  /**
   * Generate workflow with upscaling
   */
  static generateWithUpscale(prompt, options = {}) {
    const baseWorkflow = this.generateTextToImage(prompt, options);

    // Add upscaling nodes (simplified version)
    baseWorkflow["10"] = {
      "inputs": {
        "upscale_method": "nearest-exact",
        "scale_by": 2,
        "image": ["8", 0]
      },
      "class_type": "ImageScale",
      "_meta": {
        "title": "Upscale Image"
      }
    };

    baseWorkflow["9"].inputs.images = ["10", 0];

    return baseWorkflow;
  }

  /**
   * Parse Midjourney-style parameters from prompt
   */
  static parseMidjourneyParams(fullPrompt) {
    const params = {
      prompt: fullPrompt,
      options: {}
    };

    // Extract aspect ratio
    const arMatch = fullPrompt.match(/--ar\s+(\d+):(\d+)/i);
    if (arMatch) {
      const ratio = parseInt(arMatch[1]) / parseInt(arMatch[2]);
      params.options.width = ratio >= 1 ? 1024 : Math.round(1024 * ratio);
      params.options.height = ratio >= 1 ? Math.round(1024 / ratio) : 1024;
      params.prompt = fullPrompt.replace(/--ar\s+\d+:\d+/i, '').trim();
    }

    // Extract quality
    const qualityMatch = fullPrompt.match(/--q\s+(\d+)/i);
    if (qualityMatch) {
      const quality = parseInt(qualityMatch[1]);
      params.options.steps = Math.min(Math.max(quality * 10, 10), 50);
      params.prompt = params.prompt.replace(/--q\s+\d+/i, '').trim();
    }

    // Extract seed
    const seedMatch = fullPrompt.match(/--seed\s+(\d+)/i);
    if (seedMatch) {
      params.options.seed = parseInt(seedMatch[1]);
      params.prompt = params.prompt.replace(/--seed\s+\d+/i, '').trim();
    }

    // Extract chaos (map to cfg)
    const chaosMatch = fullPrompt.match(/--chaos\s+(\d+)/i);
    if (chaosMatch) {
      const chaos = parseInt(chaosMatch[1]);
      params.options.cfg = 7.5 + (chaos / 100 * 5); // Range 7.5-12.5
      params.prompt = params.prompt.replace(/--chaos\s+\d+/i, '').trim();
    }

    // Extract stylize (map to steps)
    const stylizeMatch = fullPrompt.match(/--s\s+(\d+)/i);
    if (stylizeMatch) {
      const stylize = parseInt(stylizeMatch[1]);
      params.options.steps = Math.round(20 + (stylize / 1000 * 30));
      params.prompt = params.prompt.replace(/--s\s+\d+/i, '').trim();
    }

    // Extract no parameters (negative prompt)
    const noMatch = fullPrompt.match(/--no\s+([^-]+)/i);
    if (noMatch) {
      params.options.negativePrompt = noMatch[1].trim();
      params.prompt = params.prompt.replace(/--no\s+[^-]+/i, '').trim();
    }

    return params;
  }
}

module.exports = WorkflowGenerator;
