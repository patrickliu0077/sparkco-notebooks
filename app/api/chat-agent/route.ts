import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
})

// Define the tools for notebook manipulation
const tools: OpenAI.Chat.ChatCompletionTool[] = [
  {
    type: 'function',
    function: {
      name: 'create_prompt_block',
      description: 'Create a new prompt/instruction block in the notebook',
      parameters: {
        type: 'object',
        properties: {
          name: {
            type: 'string',
            description: 'Name/title for the prompt block'
          },
          content: {
            type: 'string',
            description: 'The instruction content to put in the block'
          },
          tags: {
            type: 'array',
            items: { type: 'string' },
            description: 'Optional tags for the block'
          },
          note: {
            type: 'string',
            description: 'Optional note for the block'
          },
          atIndex: {
            type: 'number',
            description: 'Optional index to insert the block at'
          }
        },
        required: ['content']
      }
    }
  },
  {
    type: 'function',
    function: {
      name: 'create_connector_block',
      description: 'Create a new connector/integration block in the notebook',
      parameters: {
        type: 'object',
        properties: {
          name: {
            type: 'string',
            description: 'Name for the connector block'
          },
          connectorType: {
            type: 'string',
            enum: ['api', 'database', 'webhook', 'custom'],
            description: 'Type of connector'
          },
          description: {
            type: 'string',
            description: 'Description of what this connector does'
          },
          config: {
            type: 'object',
            description: 'Configuration for the connector'
          }
        },
        required: ['name', 'connectorType']
      }
    }
  },
  {
    type: 'function',
    function: {
      name: 'create_node_block',
      description: 'Create a new processing node block in the notebook',
      parameters: {
        type: 'object',
        properties: {
          name: {
            type: 'string',
            description: 'Name for the node block'
          },
          nodeType: {
            type: 'string',
            enum: ['llm', 'transform', 'filter', 'aggregate'],
            description: 'Type of processing node'
          },
          description: {
            type: 'string',
            description: 'Description of what this node does'
          },
          params: {
            type: 'object',
            description: 'Parameters for the node'
          }
        },
        required: ['name', 'nodeType']
      }
    }
  },
  {
    type: 'function',
    function: {
      name: 'update_block',
      description: 'Update an existing block in the notebook by its index',
      parameters: {
        type: 'object',
        properties: {
          blockIndex: {
            type: 'number',
            description: 'Index of the block to update (0-based)'
          },
          updates: {
            type: 'object',
            properties: {
              name: { type: 'string' },
              content: { type: 'string' },
              tags: {
                type: 'array',
                items: { type: 'string' }
              },
              note: { type: 'string' }
            }
          }
        },
        required: ['blockIndex', 'updates']
      }
    }
  },
  {
    type: 'function',
    function: {
      name: 'delete_block',
      description: 'Delete a block from the notebook by its index',
      parameters: {
        type: 'object',
        properties: {
          blockIndex: {
            type: 'number',
            description: 'Index of the block to delete (0-based)'
          }
        },
        required: ['blockIndex']
      }
    }
  },
  {
    type: 'function',
    function: {
      name: 'clear_notebook',
      description: 'Clear all blocks from the notebook',
      parameters: {
        type: 'object',
        properties: {}
      }
    }
  },
  {
    type: 'function',
    function: {
      name: 'run_block',
      description: 'Execute/run a specific block (browser automation or deploy)',
      parameters: {
        type: 'object',
        properties: {
          blockIndex: {
            type: 'number',
            description: 'Index of the block to run (0-based)'
          },
          action: {
            type: 'string',
            enum: ['browser', 'deploy'],
            description: 'Which action to run (browser automation or deploy to Cloudflare)'
          }
        },
        required: ['blockIndex', 'action']
      }
    }
  }
]

// System prompt for the agent
const SYSTEM_PROMPT = `You are an intelligent AI assistant for a notebook application that helps users create and manage AI agents.

The notebook contains different types of blocks:
1. **Prompt blocks** - Instructions for AI agents that can be run with browser automation or deployed to Cloudflare
2. **Connector blocks** - Integrations with external services (API, database, webhook)
3. **Node blocks** - Processing nodes for data flow (LLM, transform, filter, aggregate)

You can help users by:
- Creating new blocks with appropriate content
- Updating existing blocks
- Running browser automation on prompt blocks
- Deploying prompt blocks as Cloudflare agents
- Explaining how to use the notebook effectively
- Suggesting improvements to their agent instructions

When users ask you to set up the notebook or create agents, use the provided tools to manipulate the notebook directly.
When users ask general questions or need explanations, respond normally without using tools.

Be helpful, concise, and proactive in suggesting improvements to their agent designs.

Example scenarios:
- "Create a web scraping agent" -> Create a prompt block with web scraping instructions
- "Add an API connector" -> Create a connector block configured for API
- "Deploy the first block" -> Run the deploy action on block at index 0
- "Clear everything" -> Use clear_notebook tool
- "Update the second block to..." -> Use update_block with blockIndex: 1`

export async function POST(request: NextRequest) {
  try {
    const { message, conversationHistory = [], currentBlocks = [] } = await request.json()

    if (!message) {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 })
    }

    // Add context about current notebook state
    let contextMessage = message
    if (currentBlocks.length > 0) {
      contextMessage = `${message}\n\nCurrent notebook has ${currentBlocks.length} blocks:\n${
        currentBlocks.map((b: any, i: number) => 
          `${i}. ${b.kind} block: "${b.name || 'Unnamed'}"${b.content ? ` - ${b.content.substring(0, 50)}...` : ''}`
        ).join('\n')
      }`
    }

    // Build messages array
    const messages: OpenAI.Chat.ChatCompletionMessageParam[] = [
      { role: 'system', content: SYSTEM_PROMPT },
      ...conversationHistory,
      { role: 'user', content: contextMessage }
    ]

    // Call OpenAI with tools
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages,
      tools,
      tool_choice: 'auto',
      temperature: 0.7,
      max_tokens: 2000
    })

    const responseMessage = completion.choices[0].message

    // Check if the model wants to use tools
    if (responseMessage.tool_calls && responseMessage.tool_calls.length > 0) {
      const toolCalls = responseMessage.tool_calls
      const actions = []

      for (const toolCall of toolCalls) {
        const functionName = toolCall.function.name
        const functionArgs = JSON.parse(toolCall.function.arguments)

        // Log the tool call for debugging
        console.log(`Tool call: ${functionName}`, functionArgs)

        // Convert tool calls to frontend actions
        switch (functionName) {
          case 'create_prompt_block':
            actions.push({
              type: 'ADD_CELL',
              kind: 'prompt',
              data: {
                name: functionArgs.name || 'AI Agent Instructions',
                content: functionArgs.content,
                tags: functionArgs.tags || [],
                note: functionArgs.note || ''
              },
              atIndex: functionArgs.atIndex
            })
            break

          case 'create_connector_block':
            actions.push({
              type: 'ADD_CELL',
              kind: 'connector',
              data: {
                name: functionArgs.name,
                connector: functionArgs.connectorType || 'custom',
                description: functionArgs.description || '',
                config: functionArgs.config || {}
              }
            })
            break

          case 'create_node_block':
            actions.push({
              type: 'ADD_CELL',
              kind: 'node',
              data: {
                name: functionArgs.name,
                nodeType: functionArgs.nodeType,
                description: functionArgs.description || '',
                params: functionArgs.params || {}
              }
            })
            break

          case 'update_block':
            if (currentBlocks[functionArgs.blockIndex]) {
              actions.push({
                type: 'UPDATE_CELL',
                cellId: currentBlocks[functionArgs.blockIndex].id,
                updates: functionArgs.updates
              })
            }
            break

          case 'delete_block':
            if (currentBlocks[functionArgs.blockIndex]) {
              actions.push({
                type: 'DELETE_CELL',
                cellId: currentBlocks[functionArgs.blockIndex].id
              })
            }
            break

          case 'clear_notebook':
            actions.push({
              type: 'CLEAR_ALL'
            })
            break

          case 'run_block':
            if (currentBlocks[functionArgs.blockIndex]) {
              actions.push({
                type: 'RUN_BLOCK',
                cellId: currentBlocks[functionArgs.blockIndex].id,
                action: functionArgs.action
              })
            }
            break
        }
      }

      // Return structured response with actions for frontend to execute
      return NextResponse.json({
        type: 'actions',
        message: responseMessage.content || 'I\'ve updated your notebook as requested.',
        actions,
        toolCalls: toolCalls.map(tc => ({
          name: tc.function.name,
          args: JSON.parse(tc.function.arguments)
        }))
      })
    }

    // Regular text response
    return NextResponse.json({
      type: 'text',
      message: responseMessage.content || 'I understand. How can I help you with your notebook?',
      actions: []
    })

  } catch (error) {
    console.error('Chat agent error:', error)
    return NextResponse.json({
      error: error instanceof Error ? error.message : 'Failed to process chat',
      details: error instanceof Error ? error.stack : undefined
    }, { status: 500 })
  }
}
