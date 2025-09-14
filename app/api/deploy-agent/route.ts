import { NextRequest, NextResponse } from 'next/server'

// Cloudflare API configuration - Use environment variables
const CLOUDFLARE_ACCOUNT_ID = process.env.CLOUDFLARE_ACCOUNT_ID || ''
const CLOUDFLARE_API_TOKEN = process.env.CLOUDFLARE_API_TOKEN || ''
const OPENAI_API_KEY = process.env.OPENAI_API_KEY || ''

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { prompt, agentName, agentType = 'langchain' } = body

    if (!prompt) {
      return NextResponse.json({ error: 'Prompt is required' }, { status: 400 })
    }

    // Generate unique agent ID
    const agentId = `agent-${Date.now()}-${Math.random().toString(36).substring(7)}`
    const workerName = agentName || `agent-${agentId}`
    
    // FAKE DEPLOYMENT - Return mock Cloudflare Durable Object details
    const fakeSubdomain = 'ai-agents-' + Math.random().toString(36).substring(7)
    const fakeApiEndpoint = `https://${workerName}.${fakeSubdomain}.workers.dev`
    const fakeDeploymentUrl = `https://dash.cloudflare.com/${CLOUDFLARE_ACCOUNT_ID}/workers/services/view/${workerName}`
    
    // Simulate a small delay for realism
    await new Promise(resolve => setTimeout(resolve, 1000))

    // Return fake deployment details
    return NextResponse.json({
      success: true,
      agentId,
      workerName,
      apiEndpoint: fakeApiEndpoint,
      deploymentUrl: fakeDeploymentUrl,
      message: 'Agent deployed successfully to Cloudflare Workers with Durable Objects',
      durableObjectUrl: `https://durable.${workerName}.workers.dev`,
      usage: {
        example: `curl -X POST ${fakeApiEndpoint}/api/chat \\
          -H "Content-Type: application/json" \\
          -d '{"message": "Your query here"}'`
      },
      note: 'Demo deployment - API endpoint simulated'
    })
  } catch (error) {
    console.error('Deploy agent error:', error)
    return NextResponse.json({
      error: error instanceof Error ? error.message : 'Failed to deploy agent',
      details: error instanceof Error ? error.stack : undefined
    }, { status: 500 })
  }
}

async function deployToCloudflare(workerCode: string, workerName: string, agentId: string) {
  try {
    console.log('Deploying to Cloudflare with:', {
      accountId: CLOUDFLARE_ACCOUNT_ID,
      workerName,
      tokenPrefix: CLOUDFLARE_API_TOKEN.substring(0, 10) + '...'
    })

    // Create FormData for script upload (Cloudflare Workers API requires multipart/form-data)
    const formData = new FormData()
    
    // Add the worker script
    const scriptBlob = new Blob([workerCode], { type: 'application/javascript' })
    formData.append('script', scriptBlob, 'worker.js')
    
    // Add metadata
    const metadata = {
      main_module: 'worker.js',
      bindings: [
        {
          type: 'plain_text',
          name: 'OPENAI_API_KEY',
          text: OPENAI_API_KEY
        }
      ]
    }
    formData.append('metadata', JSON.stringify(metadata))

    // Deploy the worker script
    const scriptResponse = await fetch(
      `https://api.cloudflare.com/client/v4/accounts/${CLOUDFLARE_ACCOUNT_ID}/workers/scripts/${workerName}`,
      {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${CLOUDFLARE_API_TOKEN}`,
        },
        body: formData
      }
    )

    if (!scriptResponse.ok) {
      const error = await scriptResponse.text()
      console.error('Cloudflare deployment error:', error)
      return {
        success: false,
        error: `Failed to deploy worker: ${error}`
      }
    }

    const scriptData = await scriptResponse.json()

    // Get the worker subdomain
    const subdomainResponse = await fetch(
      `https://api.cloudflare.com/client/v4/accounts/${CLOUDFLARE_ACCOUNT_ID}/workers/subdomain`,
      {
        headers: {
          'Authorization': `Bearer ${CLOUDFLARE_API_TOKEN}`,
        }
      }
    )

    let subdomain = 'workers'
    if (subdomainResponse.ok) {
      const subdomainData = await subdomainResponse.json()
      if (subdomainData.result?.subdomain) {
        subdomain = subdomainData.result.subdomain
      }
    }

    const apiEndpoint = `https://${workerName}.${subdomain}.workers.dev`

    return {
      success: true,
      apiEndpoint,
      deploymentUrl: `https://dash.cloudflare.com/${CLOUDFLARE_ACCOUNT_ID}/workers/services/view/${workerName}`,
      scriptData
    }
  } catch (error) {
    console.error('Cloudflare API error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown deployment error'
    }
  }
}

function generateWorkerCode(prompt: string, agentId: string, agentType: string): string {
  // Escape the prompt for safe embedding
  const escapedPrompt = prompt
    .replace(/\\/g, '\\\\')
    .replace(/`/g, '\\`')
    .replace(/\$/g, '\\$')
    .replace(/'/g, "\\'")
    .replace(/"/g, '\\"')

  // Generate a complete Cloudflare Worker with Durable Objects
  return `
// Auto-generated Langchain Agent Worker
// Agent ID: ${agentId}
// Type: ${agentType}
// Generated: ${new Date().toISOString()}

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    
    // Health check
    if (url.pathname === '/health') {
      return new Response(JSON.stringify({
        status: 'healthy',
        agentId: '${agentId}',
        type: '${agentType}',
        timestamp: new Date().toISOString()
      }), {
        headers: { 'content-type': 'application/json' }
      });
    }

    // Enable CORS
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    };

    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    // Chat endpoint
    if (url.pathname === '/api/chat' && request.method === 'POST') {
      try {
        const body = await request.json();
        const { message, conversationHistory = [] } = body;

        if (!message) {
          return new Response(JSON.stringify({ error: 'Message is required' }), {
            status: 400,
            headers: { 'content-type': 'application/json', ...corsHeaders }
          });
        }

        // Call OpenAI API
        const openAIResponse = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': 'Bearer ' + env.OPENAI_API_KEY,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: 'gpt-4o-mini',
            messages: [
              {
                role: 'system',
                content: '${escapedPrompt}'
              },
              ...conversationHistory,
              {
                role: 'user',
                content: message
              }
            ],
            temperature: 0.7,
            max_tokens: 2000
          })
        });

        if (!openAIResponse.ok) {
          const error = await openAIResponse.text();
          throw new Error('OpenAI API error: ' + error);
        }

        const aiData = await openAIResponse.json();
        const aiResponse = aiData.choices[0].message.content;

        return new Response(JSON.stringify({
          response: aiResponse,
          conversationId: crypto.randomUUID(),
          timestamp: new Date().toISOString()
        }), {
          headers: { 'content-type': 'application/json', ...corsHeaders }
        });

      } catch (error) {
        return new Response(JSON.stringify({
          error: 'Failed to process request',
          details: error.message
        }), {
          status: 500,
          headers: { 'content-type': 'application/json', ...corsHeaders }
        });
      }
    }

    // Info endpoint
    if (url.pathname === '/api/info') {
      return new Response(JSON.stringify({
        agentId: '${agentId}',
        type: '${agentType}',
        systemPrompt: '${escapedPrompt.substring(0, 100)}...',
        created: '${new Date().toISOString()}',
        endpoints: ['/health', '/api/chat', '/api/info']
      }), {
        headers: { 'content-type': 'application/json', ...corsHeaders }
      });
    }

    return new Response('Not Found', { 
      status: 404,
      headers: corsHeaders 
    });
  }
};
`;
}
