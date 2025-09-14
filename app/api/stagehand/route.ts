import { NextRequest, NextResponse } from 'next/server'
import { Stagehand } from '@browserbasehq/stagehand'

// API Keys from environment variables
const BROWSERBASE_API_KEY = process.env.BROWSERBASE_API_KEY || ''
const BROWSERBASE_PROJECT_ID = process.env.BROWSERBASE_PROJECT_ID || ''
const OPENAI_API_KEY = process.env.OPENAI_API_KEY || ''

// Store for execution logs (in production, use a proper database or Redis)
const executionLogs = new Map<string, any[]>()

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { action, ...params } = body

    switch (action) {
      case 'executeTask':
        return await executeTask(params)
      case 'getLogs':
        return await getExecutionLogs(params)
      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    }
  } catch (error) {
    console.error('Stagehand API error:', error)
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : 'Internal server error' 
    }, { status: 500 })
  }
}

async function getExecutionLogs(params: { sessionId: string }) {
  const { sessionId } = params
  const logs = executionLogs.get(sessionId) || []
  
  return NextResponse.json({
    sessionId,
    logs,
    status: logs.some(log => log.type === 'complete') ? 'COMPLETED' : 
            logs.some(log => log.type === 'error') ? 'ERROR' : 'RUNNING'
  })
}

async function executeTask(params: { sessionId: string, instructions: string }) {
  const { instructions } = params
  
  try {
    console.log(`Executing Stagehand task: ${instructions}`)
    
    // Set environment variables for Stagehand
    process.env.BROWSERBASE_API_KEY = BROWSERBASE_API_KEY
    process.env.BROWSERBASE_PROJECT_ID = BROWSERBASE_PROJECT_ID
    process.env.OPENAI_API_KEY = OPENAI_API_KEY
    
    // Initialize Stagehand with Browserbase (simplified config based on docs)
    const stagehand = new Stagehand({
      env: "BROWSERBASE",
      apiKey: OPENAI_API_KEY,
      // Enable verbose logging to capture actions
      verbose: 2
    });

    console.log('Initializing Stagehand...')
    await stagehand.init();
    console.log('Stagehand initialized successfully!')
    console.log(`Watch live: https://browserbase.com/sessions/${stagehand.browserbaseSessionID}`)
    
    // Initialize logs for this session
    const sessionLogs: any[] = []
    const stagehandSessionId = stagehand.browserbaseSessionID || `temp-${Date.now()}`
    executionLogs.set(stagehandSessionId, sessionLogs)
    
    // Add initial log
    sessionLogs.push({
      type: 'info',
      action: 'Session Initialized',
      description: `Browser session started with ID: ${stagehand.browserbaseSessionID}`,
      timestamp: new Date().toISOString()
    })
    
    // Fetch debug URL for live inspector view
    const debugResponse = await fetch(`https://www.browserbase.com/v1/sessions/${stagehand.browserbaseSessionID}/debug`, {
      headers: {
        'X-BB-API-Key': BROWSERBASE_API_KEY,
      },
    })
    
    let liveUrl = `https://browserbase.com/sessions/${stagehand.browserbaseSessionID}`
    
    if (debugResponse.ok) {
      const debugData = await debugResponse.json()
      console.log('Debug URLs:', debugData)
      
      // Use debuggerFullscreenUrl for live viewing
      if (debugData.debuggerFullscreenUrl) {
        liveUrl = debugData.debuggerFullscreenUrl
        console.log('Using debuggerFullscreenUrl:', debugData.debuggerFullscreenUrl)
      }
    }
    
    console.log('Returning live URL to frontend:', liveUrl)
    
    // Return immediately with live URL, then execute in background
    const response = NextResponse.json({
      taskId: `stagehand-${Date.now()}`,
      sessionId: stagehand.browserbaseSessionID,
      status: 'running',
      liveUrl: liveUrl,
      message: 'Stagehand session created, executing instructions...'
    })
    
    // Execute instructions in background (don't await)
    setImmediate(async () => {
      try {
        const page = stagehand.page;
        console.log('Got page reference, creating agent...')
        
        sessionLogs.push({
          type: 'info',
          action: 'Agent Creation',
          description: 'Creating AI agent to execute instructions',
          timestamp: new Date().toISOString()
        })

        // Set up console log capture
        page.on('console', (msg) => {
          sessionLogs.push({
            type: 'console',
            action: `Console ${msg.type()}`,
            description: msg.text(),
            timestamp: new Date().toISOString()
          })
          console.log(`Browser console [${msg.type()}]:`, msg.text())
        })

        // Set up page navigation tracking
        page.on('framenavigated', (frame) => {
          if (frame === page.mainFrame()) {
            const url = frame.url()
            sessionLogs.push({
              type: 'navigation',
              action: 'Page Navigation',
              description: `Navigated to: ${url}`,
              url: url,
              timestamp: new Date().toISOString()
            })
            console.log('Navigated to:', url)
          }
        })

        // Set up request tracking for major actions
        page.on('request', (request) => {
          if (request.isNavigationRequest()) {
            sessionLogs.push({
              type: 'request',
              action: 'Navigation Request',
              description: `Loading: ${request.url()}`,
              url: request.url(),
              timestamp: new Date().toISOString()
            })
          }
        })

        const agent = await stagehand.agent({
          instructions: "You are a helpful assistant that can use a web browser. Execute the user's instructions step by step. Describe what you're doing as you go."
        });

        sessionLogs.push({
          type: 'info',
          action: 'Execution Started',
          description: `Executing: ${instructions}`,
          timestamp: new Date().toISOString()
        })

        console.log('Agent created, executing instructions...')
        
        // Execute with verbose logging
        const result = await agent.execute(instructions);
        
        console.log('Stagehand execution completed:', result)
        
        // Parse and log the result
        if (result) {
          sessionLogs.push({
            type: 'result',
            action: 'Execution Result',
            description: typeof result === 'string' ? result : JSON.stringify(result),
            timestamp: new Date().toISOString()
          })
        }
        
        sessionLogs.push({
          type: 'complete',
          action: 'Task Completed',
          description: 'All instructions have been executed successfully',
          timestamp: new Date().toISOString()
        })
        
        await stagehand.close();
        
        // Clean up logs after 10 minutes
        setTimeout(() => {
          if (stagehand.browserbaseSessionID) {
            executionLogs.delete(stagehand.browserbaseSessionID)
          }
        }, 600000)
        
      } catch (error) {
        console.error('Background execution error:', error)
        sessionLogs.push({
          type: 'error',
          action: 'Execution Error',
          description: error instanceof Error ? error.message : 'Unknown error occurred',
          timestamp: new Date().toISOString()
        })
      }
    })
    
    return response
    
  } catch (error) {
    console.error('Stagehand execution error:', error)
    return NextResponse.json({
      error: error instanceof Error ? error.message : 'Stagehand execution failed',
      details: error instanceof Error ? error.stack : undefined
    }, { status: 500 })
  }
}
