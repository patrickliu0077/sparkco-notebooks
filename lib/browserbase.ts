// Browserbase Integration

export const BROWSERBASE_CONFIG = {
  API_KEY: process.env.BROWSERBASE_API_KEY || '',
  BASE_URL: process.env.BROWSERBASE_BASE_URL || 'https://www.browserbase.com/v1',
  PROJECT_ID: process.env.BROWSERBASE_PROJECT_ID || ''
}

export interface BrowserbaseSession {
  id: string
  status: 'RUNNING' | 'COMPLETED' | 'ERROR' | 'TIMED_OUT'
  createdAt: string
  endedAt?: string
  projectId: string
  region: string
  connectUrl: string
  liveUrl?: string
  debuggerFullscreenUrl?: string
  uploads?: any[]
  downloads?: any[]
  logs?: BrowserbaseLog[]
}

export interface BrowserbaseLog {
  id: string
  timestamp: string
  level: 'info' | 'warn' | 'error' | 'debug'
  message: string
  source: string
  data?: any
}

export interface CreateSessionRequest {
  projectId?: string
  region?: string
  browserSettings?: {
    viewport?: { width: number; height: number }
    fingerprint?: boolean
    solveCaptchas?: boolean
  }
  proxies?: boolean
  keepAlive?: boolean
  timeout?: number
}

export class BrowserbaseClient {
  private apiKey: string
  private baseUrl: string
  private projectId: string

  constructor(apiKey?: string, projectId?: string) {
    this.apiKey = apiKey || BROWSERBASE_CONFIG.API_KEY
    this.baseUrl = BROWSERBASE_CONFIG.BASE_URL
    this.projectId = projectId || BROWSERBASE_CONFIG.PROJECT_ID
  }

  private async makeRequest(endpoint: string, options: RequestInit = {}) {
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      ...options,
      headers: {
        'X-BB-API-Key': this.apiKey,
        'Content-Type': 'application/json',
        ...options.headers,
      },
    })

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`Browserbase API error: ${response.status} - ${errorText}`)
    }

    return response.json()
  }

  async createSession(request: CreateSessionRequest = {}): Promise<BrowserbaseSession> {
    return this.makeRequest('/sessions', {
      method: 'POST',
      body: JSON.stringify({
        projectId: this.projectId,
        browserSettings: {
          viewport: { width: 1280, height: 720 },
          fingerprint: true,
          solveCaptchas: true,
          ...request.browserSettings
        },
        keepAlive: true,
        timeout: 300000, // 5 minutes
        ...request
      }),
    })
  }

  async getSession(sessionId: string): Promise<BrowserbaseSession> {
    return this.makeRequest(`/sessions/${sessionId}`)
  }

  async getSessionLogs(sessionId: string): Promise<{ logs: BrowserbaseLog[] }> {
    return this.makeRequest(`/sessions/${sessionId}/logs`)
  }

  async endSession(sessionId: string): Promise<void> {
    await this.makeRequest(`/sessions/${sessionId}`, {
      method: 'DELETE',
    })
  }

  // Helper method to run browser automation with Stagehand
  async runWithStagehand(
    instructions: string,
    onUpdate: (session: BrowserbaseSession) => void,
    onComplete: (session: BrowserbaseSession) => void,
    onError: (error: Error) => void
  ) {
    try {
      // Create session
      const session = await this.createSession({
        browserSettings: {
          viewport: { width: 1280, height: 720 },
          fingerprint: true,
          solveCaptchas: true
        },
        keepAlive: true
      })

      onUpdate(session)

      // Note: Actual Stagehand automation would happen here
      // For now, we'll simulate the process and provide the live URL
      
      // Poll for session updates
      const pollInterval = setInterval(async () => {
        try {
          const updatedSession = await this.getSession(session.id)
          onUpdate(updatedSession)
          
          if (updatedSession.status === 'COMPLETED' || updatedSession.status === 'ERROR' || updatedSession.status === 'TIMED_OUT') {
            clearInterval(pollInterval)
            onComplete(updatedSession)
          }
        } catch (error) {
          clearInterval(pollInterval)
          onError(error as Error)
        }
      }, 2000)

      // Cleanup after 5 minutes
      setTimeout(() => {
        clearInterval(pollInterval)
      }, 300000)

    } catch (error) {
      onError(error as Error)
    }
  }
}

// Global client instance
export const browserbaseClient = new BrowserbaseClient()

// Helper function to run browser automation
export async function runBrowserbaseTask(
  instructions: string,
  onUpdate: (session: BrowserbaseSession) => void,
  onComplete: (session: BrowserbaseSession) => void,
  onError: (error: Error) => void
) {
  return browserbaseClient.runWithStagehand(instructions, onUpdate, onComplete, onError)
}
