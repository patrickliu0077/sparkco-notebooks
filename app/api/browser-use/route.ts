import { NextRequest, NextResponse } from 'next/server'
import { BROWSER_USE_CONFIG } from '@/lib/browser-use'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { action, ...params } = body

    switch (action) {
      case 'createTask':
        return await createTask(params)
      case 'getTask':
        return await getTask(params.taskId)
      case 'getTaskLogs':
        return await getTaskLogs(params.taskId)
      case 'createSession':
        return await createSession()
      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    }
  } catch (error) {
    console.error('Browser Use API error:', error)
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : 'Internal server error' 
    }, { status: 500 })
  }
}

async function createTask(params: any) {
  const response = await fetch(`${BROWSER_USE_CONFIG.BASE_URL}/tasks`, {
    method: 'POST',
    headers: {
      'X-Browser-Use-API-Key': BROWSER_USE_CONFIG.API_KEY,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      task: params.task,
      llm: params.llm || 'gpt-4o-mini',
      maxSteps: params.maxSteps || 10,
      highlightElements: true,
      vision: true,
      thinking: true,
      ...params
    }),
  })

  if (!response.ok) {
    const errorText = await response.text()
    console.error('Browser Use API error details:', errorText)
    
    if (response.status === 429) {
      throw new Error('Rate limit exceeded. Please wait before trying again.')
    }
    
    throw new Error(`Browser Use API error: ${response.status} - ${errorText}`)
  }

  const data = await response.json()
  return NextResponse.json(data)
}

async function getTask(taskId: string) {
  const response = await fetch(`${BROWSER_USE_CONFIG.BASE_URL}/tasks/${taskId}`, {
    headers: {
      'X-Browser-Use-API-Key': BROWSER_USE_CONFIG.API_KEY,
    },
  })

  if (!response.ok) {
    if (response.status === 429) {
      throw new Error('Rate limit exceeded. Please wait before trying again.')
    }
    throw new Error(`Browser Use API error: ${response.status}`)
  }

  const data = await response.json()
  
  // Also get task logs for detailed steps
  try {
    const logsResponse = await fetch(`${BROWSER_USE_CONFIG.BASE_URL}/tasks/${taskId}/logs`, {
      headers: {
        'X-Browser-Use-API-Key': BROWSER_USE_CONFIG.API_KEY,
      },
    })
    
    if (logsResponse.ok) {
      const logsData = await logsResponse.json()
      data.steps = logsData.logs || []
    }
  } catch (error) {
    console.error('Error fetching task logs:', error)
    data.steps = []
  }
  
  return NextResponse.json(data)
}

async function getTaskLogs(taskId: string) {
  const response = await fetch(`${BROWSER_USE_CONFIG.BASE_URL}/tasks/${taskId}/logs`, {
    headers: {
      'X-Browser-Use-API-Key': BROWSER_USE_CONFIG.API_KEY,
    },
  })

  if (!response.ok) {
    if (response.status === 429) {
      throw new Error('Rate limit exceeded. Please wait before trying again.')
    }
    throw new Error(`Browser Use API error: ${response.status}`)
  }

  const data = await response.json()
  return NextResponse.json(data)
}

async function createSession() {
  const response = await fetch(`${BROWSER_USE_CONFIG.BASE_URL}/sessions`, {
    method: 'POST',
    headers: {
      'X-Browser-Use-API-Key': BROWSER_USE_CONFIG.API_KEY,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({}),
  })

  if (!response.ok) {
    if (response.status === 429) {
      throw new Error('Rate limit exceeded. Please wait before trying again.')
    }
    throw new Error(`Browser Use API error: ${response.status}`)
  }

  const data = await response.json()
  return NextResponse.json(data)
}
