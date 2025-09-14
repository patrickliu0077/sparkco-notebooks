import { NextRequest, NextResponse } from 'next/server'
import { BROWSERBASE_CONFIG } from '@/lib/browserbase'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { action, ...params } = body

    switch (action) {
      case 'createSession':
        return await createSession(params)
      case 'getSession':
        return await getSession(params.sessionId)
      case 'getSessionDebug':
        return await getSessionDebug(params.sessionId)
      case 'getSessionLogs':
        return await getSessionLogs(params.sessionId)
      case 'endSession':
        return await endSession(params.sessionId)
      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    }
  } catch (error) {
    console.error('Browserbase API error:', error)
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : 'Internal server error' 
    }, { status: 500 })
  }
}

async function createSession(params: any) {
  const response = await fetch(`${BROWSERBASE_CONFIG.BASE_URL}/sessions`, {
    method: 'POST',
    headers: {
      'X-BB-API-Key': BROWSERBASE_CONFIG.API_KEY,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      projectId: '19fa1c5f-87e2-4694-9230-d14adc06a872',
      browserSettings: {
        viewport: { width: 1280, height: 720 },
        ...params.browserSettings
      },
      keepAlive: true,
      timeout: 300, // 5 minutes in seconds
      ...params
    }),
  })

  if (!response.ok) {
    const errorText = await response.text()
    console.error('Browserbase API error details:', errorText)
    
    if (response.status === 429) {
      throw new Error('Rate limit exceeded. Please wait before trying again.')
    }
    
    throw new Error(`Browserbase API error: ${response.status} - ${errorText}`)
  }

  const data = await response.json()
  return NextResponse.json(data)
}

async function getSession(sessionId: string) {
  const response = await fetch(`${BROWSERBASE_CONFIG.BASE_URL}/sessions/${sessionId}`, {
    headers: {
      'X-BB-API-Key': BROWSERBASE_CONFIG.API_KEY,
    },
  })

  if (!response.ok) {
    if (response.status === 429) {
      throw new Error('Rate limit exceeded. Please wait before trying again.')
    }
    throw new Error(`Browserbase API error: ${response.status}`)
  }

  const data = await response.json()
  return NextResponse.json(data)
}

async function getSessionDebug(sessionId: string) {
  const response = await fetch(`${BROWSERBASE_CONFIG.BASE_URL}/sessions/${sessionId}/debug`, {
    headers: {
      'X-BB-API-Key': BROWSERBASE_CONFIG.API_KEY,
    },
  })

  if (!response.ok) {
    if (response.status === 429) {
      throw new Error('Rate limit exceeded. Please wait before trying again.')
    }
    throw new Error(`Browserbase API error: ${response.status}`)
  }

  const data = await response.json()
  return NextResponse.json(data)
}

async function getSessionLogs(sessionId: string) {
  const response = await fetch(`${BROWSERBASE_CONFIG.BASE_URL}/sessions/${sessionId}/logs`, {
    headers: {
      'X-BB-API-Key': BROWSERBASE_CONFIG.API_KEY,
    },
  })

  if (!response.ok) {
    if (response.status === 429) {
      throw new Error('Rate limit exceeded. Please wait before trying again.')
    }
    throw new Error(`Browserbase API error: ${response.status}`)
  }

  const data = await response.json()
  return NextResponse.json(data)
}

async function endSession(sessionId: string) {
  const response = await fetch(`${BROWSERBASE_CONFIG.BASE_URL}/sessions/${sessionId}`, {
    method: 'DELETE',
    headers: {
      'X-BB-API-Key': BROWSERBASE_CONFIG.API_KEY,
    },
  })

  if (!response.ok) {
    if (response.status === 429) {
      throw new Error('Rate limit exceeded. Please wait before trying again.')
    }
    throw new Error(`Browserbase API error: ${response.status}`)
  }

  return NextResponse.json({ success: true })
}
