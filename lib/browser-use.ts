// Browser Use Cloud API Integration
// API Key: bu_A1fa8JQxqE2VnzPOVdU1nCLJt5zronxtRdkh5eITMqY

export const BROWSER_USE_CONFIG = {
  API_KEY: 'bu_A1fa8JQxqE2VnzPOVdU1nCLJt5zronxtRdkh5eITMqY',
  BASE_URL: 'https://api.browser-use.com/api/v2',
}

export interface BrowserTask {
  id: string
  status: 'pending' | 'running' | 'finished' | 'failed'
  output?: string
  parsed?: any
  steps: BrowserStep[]
  liveUrl?: string
}

export interface BrowserStep {
  id: string
  action: string
  description: string
  timestamp: Date
  screenshot?: string
  status: 'pending' | 'running' | 'completed' | 'failed'
}

export interface CreateTaskRequest {
  task: string
  llm?: string
  startUrl?: string
  maxSteps?: number
  structuredOutput?: string
  sessionId?: string
  metadata?: Record<string, string>
  highlightElements?: boolean
  flashMode?: boolean
  thinking?: boolean
  vision?: boolean
}

export class BrowserUseClient {
  private apiKey: string
  private baseUrl: string

  constructor(apiKey?: string) {
    this.apiKey = apiKey || BROWSER_USE_CONFIG.API_KEY
    this.baseUrl = BROWSER_USE_CONFIG.BASE_URL
  }

  private async makeRequest(endpoint: string, options: RequestInit = {}) {
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      ...options,
      headers: {
        'X-Browser-Use-API-Key': this.apiKey,
        'Content-Type': 'application/json',
        ...options.headers,
      },
    })

    if (!response.ok) {
      throw new Error(`Browser Use API error: ${response.status} ${response.statusText}`)
    }

    return response.json()
  }

  async createTask(request: CreateTaskRequest): Promise<{ id: string }> {
    return this.makeRequest('/tasks', {
      method: 'POST',
      body: JSON.stringify(request),
    })
  }

  async getTask(taskId: string): Promise<BrowserTask> {
    return this.makeRequest(`/tasks/${taskId}`)
  }

  async getTaskLogs(taskId: string): Promise<{ logs: BrowserStep[] }> {
    return this.makeRequest(`/tasks/${taskId}/logs`)
  }

  // Streaming implementation for real-time updates
  async* streamTask(taskId: string): AsyncGenerator<BrowserStep> {
    let lastStepCount = 0
    
    while (true) {
      try {
        const task = await this.getTask(taskId)
        
        // Check if task is finished
        if (task.status === 'finished' || task.status === 'failed') {
          // Yield any remaining steps
          if (task.steps.length > lastStepCount) {
            for (let i = lastStepCount; i < task.steps.length; i++) {
              yield task.steps[i]
            }
          }
          break
        }
        
        // Yield new steps
        if (task.steps.length > lastStepCount) {
          for (let i = lastStepCount; i < task.steps.length; i++) {
            yield task.steps[i]
          }
          lastStepCount = task.steps.length
        }
        
        // Wait before next poll
        await new Promise(resolve => setTimeout(resolve, 1000))
      } catch (error) {
        console.error('Error streaming task:', error)
        break
      }
    }
  }

  async createSession(): Promise<{ id: string; liveUrl: string }> {
    return this.makeRequest('/sessions', {
      method: 'POST',
      body: JSON.stringify({}),
    })
  }
}

// Global client instance
export const browserUseClient = new BrowserUseClient()

// Helper function to run a browser task with streaming
export async function runBrowserTask(
  instructions: string,
  onStep: (step: BrowserStep) => void,
  onComplete: (result: BrowserTask) => void,
  onError: (error: Error) => void
) {
  try {
    // Create task
    const { id: taskId } = await browserUseClient.createTask({
      task: instructions,
      llm: 'gpt-4o-mini',
      maxSteps: 10,
      highlightElements: true,
      vision: true,
      thinking: true
    })

    // Stream steps
    for await (const step of browserUseClient.streamTask(taskId)) {
      onStep(step)
    }

    // Get final result
    const finalResult = await browserUseClient.getTask(taskId)
    onComplete(finalResult)
    
  } catch (error) {
    onError(error as Error)
  }
}
