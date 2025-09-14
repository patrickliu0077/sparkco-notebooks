'use client'

import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Placeholder from '@tiptap/extension-placeholder'
import { useEffect, useState } from 'react'
import { useAgentStore } from '@/lib/store'
import { MessageCircle, Play, Monitor, X, Minimize2, ExternalLink, Cloud, Loader2, BookOpen } from 'lucide-react'
import type { PromptCell as PromptCellType } from '@/lib/types'

interface PromptCellProps {
  cell: PromptCellType
  isSelected: boolean
  onSelect: () => void
}

export function PromptCell({ cell, isSelected, onSelect }: PromptCellProps) {
  const { updateCell } = useAgentStore()
  const [isRunning, setIsRunning] = useState(false)
  const [browserSteps, setBrowserSteps] = useState<any[]>([])
  const [liveUrl, setLiveUrl] = useState<string>()
  const [currentStep, setCurrentStep] = useState<string>()
  const [activeSessionId, setActiveSessionId] = useState<string>()
  const [isBrowserMinimized, setIsBrowserMinimized] = useState(false)
  const [isDeploying, setIsDeploying] = useState(false)
  const [deploymentResult, setDeploymentResult] = useState<any>(null)
  const [deploymentCode, setDeploymentCode] = useState<string>('')
  const [isGeneratingInkeep, setIsGeneratingInkeep] = useState(false)
  const [inkeepResult, setInkeepResult] = useState<any>(null)

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit,
      Placeholder.configure({
        placeholder: 'Write instructions for what you want your agent to do...',
      }),
    ],
    content: cell.content,
    onUpdate: ({ editor }) => {
      const content = editor.getText()
      updateCell(cell.id, { content })
    },
    editorProps: {
      attributes: {
        class: 'focus:outline-none',
      },
    },
  })

  useEffect(() => {
    if (editor && editor.getHTML() !== cell.content) {
      editor.commands.setContent(cell.content)
    }
  }, [cell.content, editor])

  const handleRunAgent = async (e: React.MouseEvent) => {
    e.stopPropagation()
    setIsRunning(true)
    setBrowserSteps([])
    setCurrentStep('🚀 Starting Stagehand automation...')
    
    try {
      // Execute Stagehand task directly (it will create its own session)
      const stagehandResponse = await fetch('/api/stagehand', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'executeTask',
          sessionId: null, // Let Stagehand create its own session
          instructions: cell.content
        })
      })
      
      if (!stagehandResponse.ok) {
        throw new Error('Failed to start Stagehand task')
      }
      
      const stagehandData = await stagehandResponse.json()
      console.log('Stagehand task started:', stagehandData)
      
      // Use the live URL from Stagehand's active session
      if (stagehandData.liveUrl) {
        setLiveUrl(stagehandData.liveUrl)
        console.log('Using Stagehand live URL:', stagehandData.liveUrl)
      }
      
      // Use Stagehand's session ID
      if (stagehandData.sessionId) {
        setActiveSessionId(stagehandData.sessionId)
      }
      
      setCurrentStep('🤖 Stagehand is executing your instructions...')
      
      // Add initial step to browserSteps
      setBrowserSteps([{
        id: 'init',
        action: 'Session Started',
        description: `Session ID: ${stagehandData.sessionId?.substring(0, 8)}...`,
        timestamp: new Date().toISOString()
      }])
      
      // Poll for execution logs
      const currentSessionId = stagehandData.sessionId
      const pollInterval = setInterval(async () => {
        try {
          if (currentSessionId) {
            // Fetch execution logs from Stagehand API
            const logsResponse = await fetch('/api/stagehand', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                action: 'getLogs',
                sessionId: currentSessionId
              })
            })
            
            if (logsResponse.ok) {
              const logsData = await logsResponse.json()
              
              // Update browser steps with actual execution logs
              if (logsData.logs && logsData.logs.length > 0) {
                const formattedSteps = logsData.logs.map((log: any, index: number) => ({
                  id: `log-${index}`,
                  action: log.action,
                  description: log.description,
                  timestamp: log.timestamp,
                  type: log.type
                }))
                
                setBrowserSteps(formattedSteps)
                
                // Update current step based on latest log
                const latestLog = logsData.logs[logsData.logs.length - 1]
                if (latestLog.type === 'info' || latestLog.type === 'navigation') {
                  setCurrentStep(`🔄 ${latestLog.action}: ${latestLog.description.substring(0, 50)}...`)
                } else if (latestLog.type === 'result') {
                  setCurrentStep(`📊 ${latestLog.description.substring(0, 100)}...`)
                }
              }
              
              // Handle completion status
              if (logsData.status === 'COMPLETED') {
                clearInterval(pollInterval)
                setIsRunning(false)
                setCurrentStep('✅ Automation completed successfully!')
                
                setTimeout(() => {
                  setCurrentStep(undefined)
                }, 10000)
              } else if (logsData.status === 'ERROR') {
                clearInterval(pollInterval)
                setIsRunning(false)
                setCurrentStep('❌ Automation failed')
                
                setTimeout(() => {
                  setCurrentStep(undefined)
                }, 10000)
              }
            }
          }
        } catch (error) {
          console.error('Error polling logs:', error)
        }
      }, 2000) // Poll every 2 seconds for more responsive updates
      
      // Cleanup after 5 minutes
      setTimeout(() => {
        clearInterval(pollInterval)
        if (isRunning) {
          setIsRunning(false)
          setCurrentStep(undefined)
        }
      }, 300000)
      
    } catch (error) {
      setIsRunning(false)
      setCurrentStep(undefined)
      
      if (error instanceof Error) {
        setCurrentStep(`Error: ${error.message}`)
        
        // Add error step
        setBrowserSteps([{
          id: 'error-init',
          action: 'Failed to Start',
          description: error.message,
          timestamp: new Date().toISOString()
        }])
      }
      
      console.error('Failed to start automation:', error)
      
      setTimeout(() => {
        setCurrentStep(undefined)
      }, 5000)
    }
  }

  const handleCloseBrowser = () => {
    setIsRunning(false)
    setBrowserSteps([])
    setLiveUrl(undefined)
    setCurrentStep(undefined)
    setActiveSessionId(undefined)
    setIsBrowserMinimized(false)
  }

  const handleDeployAgent = async (e: React.MouseEvent) => {
    e.stopPropagation()
    setIsDeploying(true)
    setDeploymentResult(null)
    setDeploymentCode('')
    
    // TypeScript code snippets to stream
    const codeSnippets = [
      `// Initializing Cloudflare Durable Object...
export class AgentDurableObject {
  state: DurableObjectState
  env: Env`,
      
      `\n  constructor(state: DurableObjectState, env: Env) {
    this.state = state
    this.env = env
  }`,
      
      `\n\n  // Setting up conversation storage...
  async loadConversation(): Promise<ConversationState> {
    const state = await this.state.storage.get<ConversationState>('conversation')
    return state || { messages: [], lastActivity: new Date().toISOString() }
  }`,
      
      `\n\n  // Configuring OpenAI integration...
  async callOpenAI(messages: Message[]): Promise<string> {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': \`Bearer \${this.env.OPENAI_API_KEY}\`,
        'Content-Type': 'application/json'
      },`,
      
      `\n      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: '${cell.content.substring(0, 50)}...' },
          ...messages
        ]
      })
    })`,
      
      `\n\n  // Setting up HTTP endpoints...
  async fetch(request: Request): Promise<Response> {
    const url = new URL(request.url)
    
    if (url.pathname === '/api/chat') {
      return this.handleChat(request)
    }`,
      
      `\n\n    if (url.pathname === '/health') {
      return new Response(JSON.stringify({
        status: 'healthy',
        agentId: '${cell.id}',
        timestamp: new Date().toISOString()
      }))
    }`,
      
      `\n\n  // Deploying to Cloudflare Workers...
  // Building production bundle...
  // Uploading to edge network...
  // Configuring Durable Object bindings...`,
      
      `\n\n  // Finalizing deployment...
  return new Response('Agent deployed successfully!')
}`
    ]
    
    try {
      // Stream code snippets with delays
      for (let i = 0; i < codeSnippets.length; i++) {
        await new Promise(resolve => setTimeout(resolve, 800))
        setDeploymentCode(prev => prev + codeSnippets[i])
      }
      
      // Wait a bit more before showing result
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      const response = await fetch('/api/deploy-agent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: cell.content,
          agentName: cell.name?.replace(/\s+/g, '-').toLowerCase() || undefined,
          agentType: 'langchain'
        })
      })
      
      if (!response.ok) {
        throw new Error('Failed to deploy agent')
      }
      
      const result = await response.json()
      console.log('Agent deployed:', result)
      setDeploymentResult(result)
      setDeploymentCode('') // Clear code after successful deployment
      
    } catch (error) {
      console.error('Failed to deploy agent:', error)
      setDeploymentResult({
        error: error instanceof Error ? error.message : 'Deployment failed'
      })
      setDeploymentCode('')
    } finally {
      setIsDeploying(false)
    }
  }

  const handleGenerateInkeep = async (e: React.MouseEvent) => {
    e.stopPropagation()
    setIsGeneratingInkeep(true)
    setInkeepResult(null)
    
    try {
      // Simulate Inkeep agent generation
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      // Generate Inkeep configuration based on the prompt content
      const inkeepConfig = {
        apiKey: `ink_${Math.random().toString(36).substring(2, 15)}`,
        organizationId: `org_${Math.random().toString(36).substring(2, 15)}`,
        integrationId: `int_${Math.random().toString(36).substring(2, 15)}`,
        baseSettings: {
          name: cell.name || 'AI Assistant',
          primaryBrandColor: '#8B5CF6',
          description: cell.content.substring(0, 100) + '...',
          chatSettings: {
            placeholder: 'Ask me anything...',
            quickQuestions: [
              'How can I help you today?',
              'What would you like to know?',
              'Tell me about your project'
            ]
          },
          searchSettings: {
            enabled: true,
            placeholder: 'Search documentation...'
          }
        },
        sources: [
          {
            type: 'documentation',
            url: 'https://docs.example.com',
            crawlInterval: 'daily'
          },
          {
            type: 'github',
            repo: 'your-org/your-repo',
            branch: 'main'
          }
        ],
        embeddingCode: `<!-- Inkeep Chat Widget -->
<script>
  (function() {
    const script = document.createElement('script');
    script.src = 'https://unpkg.com/@inkeep/widgets-embed@latest/dist/embed.js';
    script.type = 'module';
    script.defer = true;
    document.head.appendChild(script);
    
    script.onload = function() {
      Inkeep.embed({
        componentType: 'ChatButton',
        properties: {
          chatButtonType: 'PILL',
          baseSettings: {
            apiKey: '${`ink_${Math.random().toString(36).substring(2, 15)}`}',
            integrationId: '${`int_${Math.random().toString(36).substring(2, 15)}`}',
            organizationId: '${`org_${Math.random().toString(36).substring(2, 15)}`}',
            primaryBrandColor: '#8B5CF6',
            organizationDisplayName: '${cell.name || 'Your Organization'}',
          },
          modalSettings: {
            promptSuggestions: [
              '${cell.content.substring(0, 50)}...',
              'How does this work?',
              'Tell me more about the features'
            ]
          },
          searchSettings: {
            enabled: true,
            placeholder: 'Search for answers...'
          },
          aiChatSettings: {
            chatSubjectName: '${cell.name || 'AI Assistant'}',
            botAvatarSrcUrl: 'https://api.dicebear.com/7.x/bottts/svg?seed=${cell.id}',
            quickQuestions: [
              'What can you help me with?',
              'How do I get started?',
              'Tell me about the documentation'
            ]
          }
        }
      });
    };
  })();
</script>`
      }
      
      setInkeepResult(inkeepConfig)
      console.log('Inkeep agent generated:', inkeepConfig)
      
    } catch (error) {
      console.error('Failed to generate Inkeep agent:', error)
      setInkeepResult({
        error: error instanceof Error ? error.message : 'Generation failed'
      })
    } finally {
      setIsGeneratingInkeep(false)
    }
  }

  return (
    <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
      {/* Main Cell Content */}
      <div
        onClick={onSelect}
        style={{
          flex: 1,
          padding: 12,
          borderRadius: 4,
          border: `1px solid ${isSelected ? '#8B5CF6' : '#E5E7EB'}`,
          background: '#FFFFFF',
          transition: 'all .15s ease',
          boxShadow: isSelected
            ? '0 0 0 3px rgba(139, 92, 246, 0.1)'
            : 'none',
          cursor: 'pointer',
          position: 'relative'
        }}
      >
        {/* Minimal Action Buttons - Edge Tooltips */}
        {cell.content.trim() && (
          <>
            {/* Deploy Agent Button */}
            <div
              style={{
                position: 'absolute',
                top: '50%',
                right: -12,
                transform: 'translateY(-50%) translateY(-42px)',
                zIndex: 10,
                opacity: isSelected ? 1 : 0,
                transition: 'opacity 0.2s ease',
                pointerEvents: isSelected ? 'auto' : 'none'
              }}
            >
              <button
                onClick={handleDeployAgent}
                disabled={isDeploying}
                style={{
                  width: 24,
                  height: 24,
                  borderRadius: '50%',
                  border: '1px solid #E5E7EB',
                  background: '#FFFFFF',
                  color: isDeploying ? '#9CA3AF' : '#3B82F6',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: isDeploying ? 'not-allowed' : 'pointer',
                  transition: 'all 0.15s ease',
                  boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
                  position: 'relative'
                }}
                onMouseEnter={(e) => {
                  if (!isDeploying) {
                    e.currentTarget.style.transform = 'scale(1.1)'
                    e.currentTarget.style.boxShadow = '0 2px 6px rgba(0, 0, 0, 0.15)'
                  }
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'scale(1)'
                  e.currentTarget.style.boxShadow = '0 1px 3px rgba(0, 0, 0, 0.1)'
                }}
              >
                {isDeploying ? <Loader2 size={10} className="animate-spin" /> : <Cloud size={10} />}
                {/* Tooltip */}
                <span style={{
                  position: 'absolute',
                  right: 30,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: '#1F2937',
                  color: '#FFFFFF',
                  fontSize: 9,
                  padding: '4px 8px',
                  borderRadius: 4,
                  whiteSpace: 'nowrap',
                  opacity: 0,
                  pointerEvents: 'none',
                  transition: 'opacity 0.2s ease',
                  fontWeight: 500
                }}
                onMouseEnter={(e) => { e.currentTarget.style.opacity = '1' }}
                className="tooltip"
                >
                  {isDeploying ? 'Deploying...' : 'Deploy to Cloudflare'}
                </span>
              </button>
            </div>
            
            {/* Inkeep Agent Button - Between Deploy and Computer Use */}
            <div
              style={{
                position: 'absolute',
                top: '50%',
                right: -12,
                transform: 'translateY(-50%)',
                zIndex: 10,
                opacity: isSelected ? 1 : 0,
                transition: 'opacity 0.2s ease',
                pointerEvents: isSelected ? 'auto' : 'none'
              }}
            >
              <button
                onClick={handleGenerateInkeep}
                disabled={isGeneratingInkeep}
                style={{
                  width: 24,
                  height: 24,
                  borderRadius: '50%',
                  border: '1px solid #E5E7EB',
                  background: '#FFFFFF',
                  color: isGeneratingInkeep ? '#9CA3AF' : '#8B5CF6',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: isGeneratingInkeep ? 'not-allowed' : 'pointer',
                  transition: 'all 0.15s ease',
                  boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
                  position: 'relative'
                }}
                onMouseEnter={(e) => {
                  if (!isGeneratingInkeep) {
                    e.currentTarget.style.transform = 'scale(1.1)'
                    e.currentTarget.style.boxShadow = '0 2px 6px rgba(0, 0, 0, 0.15)'
                  }
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'scale(1)'
                  e.currentTarget.style.boxShadow = '0 1px 3px rgba(0, 0, 0, 0.1)'
                }}
              >
                {isGeneratingInkeep ? <Loader2 size={10} className="animate-spin" /> : <BookOpen size={10} />}
                {/* Tooltip */}
                <span style={{
                  position: 'absolute',
                  right: 30,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: '#1F2937',
                  color: '#FFFFFF',
                  fontSize: 9,
                  padding: '4px 8px',
                  borderRadius: 4,
                  whiteSpace: 'nowrap',
                  opacity: 0,
                  pointerEvents: 'none',
                  transition: 'opacity 0.2s ease',
                  fontWeight: 500
                }}
                onMouseEnter={(e) => { e.currentTarget.style.opacity = '1' }}
                className="tooltip"
                >
                  {isGeneratingInkeep ? 'Generating...' : 'Generate Inkeep Agent'}
                </span>
              </button>
            </div>
            
            {/* Computer Use Button */}
            <div
              style={{
                position: 'absolute',
                top: '50%',
                right: -12,
                transform: 'translateY(-50%) translateY(42px)',
                zIndex: 10,
                opacity: isSelected ? 1 : 0,
                transition: 'opacity 0.2s ease',
                pointerEvents: isSelected ? 'auto' : 'none'
              }}
            >
              <button
                onClick={handleRunAgent}
                disabled={isRunning}
                style={{
                  width: 24,
                  height: 24,
                  borderRadius: '50%',
                  border: '1px solid #E5E7EB',
                  background: '#FFFFFF',
                  color: isRunning ? '#9CA3AF' : '#111827',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: isRunning ? 'not-allowed' : 'pointer',
                  transition: 'all 0.15s ease',
                  boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
                  position: 'relative'
                }}
                onMouseEnter={(e) => {
                  if (!isRunning) {
                    e.currentTarget.style.transform = 'scale(1.1)'
                    e.currentTarget.style.boxShadow = '0 2px 6px rgba(0, 0, 0, 0.15)'
                  }
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'scale(1)'
                  e.currentTarget.style.boxShadow = '0 1px 3px rgba(0, 0, 0, 0.1)'
                }}
              >
                {isRunning ? <Monitor size={10} className="animate-pulse" /> : <Play size={10} />}
                {/* Tooltip */}
                <span style={{
                  position: 'absolute',
                  right: 30,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: '#1F2937',
                  color: '#FFFFFF',
                  fontSize: 9,
                  padding: '4px 8px',
                  borderRadius: 4,
                  whiteSpace: 'nowrap',
                  opacity: 0,
                  pointerEvents: 'none',
                  transition: 'opacity 0.2s ease',
                  fontWeight: 500
                }}
                onMouseEnter={(e) => { e.currentTarget.style.opacity = '1' }}
                className="tooltip"
                >
                  {isRunning ? 'Running...' : 'Computer Use'}
                </span>
              </button>
            </div>
            
            <style jsx>{`
              button:hover .tooltip {
                opacity: 1 !important;
              }
            `}</style>
          </>
        )}

        {/* Header */}
        <div style={{ marginBottom: 6 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
            <div
              style={{
                width: 20,
                height: 20,
                borderRadius: 4,
                background: '#F1F5F9',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <MessageCircle size={12} color="#111827" />
            </div>
            <div style={{ minWidth: 0, flex: 1 }}>
              <div style={{ fontWeight: 500, color: '#0F172A', lineHeight: 1.2, fontSize: 14 }}>
                {cell.name?.trim() || 'Instructions'}
              </div>
            </div>
            {cell.tags && cell.tags.length > 0 ? (
              <div style={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}>
                {cell.tags.slice(0, 2).map((tag) => (
                  <span
                    key={tag}
                    style={{
                      fontSize: 9,
                      padding: '1px 3px',
                      borderRadius: 2,
                      border: '1px solid #E5E7EB',
                      background: '#FFFFFF',
                      color: '#6B7280',
                      fontFamily: 'JetBrains Mono, ui-monospace, SFMono-Regular, Menlo, monospace',
                      textTransform: 'lowercase'
                    }}
                  >
                    {tag.toLowerCase()}
                  </span>
                ))}
              </div>
            ) : null}
          </div>
          
          {/* Note in header */}
          {cell.note && (
            <div
              style={{
                fontSize: 11,
                color: '#64748B',
                background: '#F9FAFB',
                border: '1px solid #E5E7EB',
                borderRadius: 4,
                padding: '4px 6px',
                marginTop: 4,
              }}
            >
              {cell.note}
            </div>
          )}
        </div>

        {/* Editor */}
        <div
          style={{
            minHeight: 120,
            borderRadius: 8,
            background: '#FFFFFF',
            padding: 10,
          }}
        >
          <EditorContent editor={editor} />
        </div>

        {/* Deployment Code Stream */}
        {isDeploying && deploymentCode && (
          <div style={{
            marginTop: 12,
            padding: 10,
            borderRadius: 6,
            background: '#FAFAFA',
            border: '1px solid #E5E7EB'
          }}>
            <div style={{
              fontSize: 11,
              fontWeight: 600,
              color: '#374151',
              marginBottom: 8,
              display: 'flex',
              alignItems: 'center',
              gap: 6
            }}>
              <div style={{
                width: 6,
                height: 6,
                borderRadius: '50%',
                background: '#3B82F6',
                animation: 'pulse 1.5s infinite'
              }} />
              Deploying to Cloudflare Workers
            </div>
            <div style={{
              fontSize: 9,
              color: '#6B7280',
              background: '#FFFFFF',
              padding: 8,
              borderRadius: 4,
              fontFamily: 'JetBrains Mono, ui-monospace, SFMono-Regular, Menlo, monospace',
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-word',
              maxHeight: 120,
              overflowY: 'auto',
              lineHeight: 1.4,
              border: '1px solid #F3F4F6'
            }}>
              {deploymentCode}
            </div>
          </div>
        )}

        {/* Inkeep Result */}
        {inkeepResult && !isGeneratingInkeep && (
          <div style={{
            marginTop: 12,
            padding: 10,
            borderRadius: 6,
            background: inkeepResult.error ? '#FEF2F2' : '#F5F3FF',
            border: `1px solid ${inkeepResult.error ? '#FECACA' : '#DDD6FE'}`
          }}>
            {inkeepResult.error ? (
              <div>
                <div style={{
                  fontSize: 11,
                  fontWeight: 600,
                  color: '#DC2626',
                  marginBottom: 4
                }}>
                  Inkeep Generation Failed
                </div>
                <div style={{
                  fontSize: 10,
                  color: '#7F1D1D'
                }}>
                  {inkeepResult.error}
                </div>
              </div>
            ) : (
              <div>
                <div style={{
                  fontSize: 11,
                  fontWeight: 600,
                  color: '#6B21A8',
                  marginBottom: 6
                }}>
                  📚 Inkeep Agent Generated!
                </div>
                <div style={{
                  fontSize: 10,
                  color: '#581C87',
                  marginBottom: 4
                }}>
                  API Key: <code style={{ 
                    background: '#F3F4F6', 
                    padding: '2px 4px', 
                    borderRadius: 2,
                    fontSize: 9
                  }}>{inkeepResult.apiKey}</code>
                </div>
                <div style={{
                  fontSize: 10,
                  color: '#581C87',
                  marginBottom: 4
                }}>
                  Organization ID: <code style={{ 
                    background: '#F3F4F6', 
                    padding: '2px 4px', 
                    borderRadius: 2,
                    fontSize: 9
                  }}>{inkeepResult.organizationId}</code>
                </div>
                <div style={{
                  fontSize: 10,
                  color: '#581C87',
                  marginBottom: 8
                }}>
                  Integration ID: <code style={{ 
                    background: '#F3F4F6', 
                    padding: '2px 4px', 
                    borderRadius: 2,
                    fontSize: 9
                  }}>{inkeepResult.integrationId}</code>
                </div>
                
                <details style={{ marginTop: 8 }}>
                  <summary style={{
                    fontSize: 10,
                    color: '#6B21A8',
                    cursor: 'pointer',
                    fontWeight: 600,
                    marginBottom: 4
                  }}>
                    View Embedding Code
                  </summary>
                  <div style={{
                    fontSize: 8,
                    color: '#374151',
                    background: '#FFFFFF',
                    padding: 8,
                    borderRadius: 4,
                    fontFamily: 'JetBrains Mono, ui-monospace, SFMono-Regular, Menlo, monospace',
                    whiteSpace: 'pre-wrap',
                    wordBreak: 'break-all',
                    maxHeight: 150,
                    overflowY: 'auto',
                    border: '1px solid #E5E7EB',
                    marginTop: 4
                  }}>
                    {inkeepResult.embeddingCode}
                  </div>
                </details>
                
                <div style={{
                  marginTop: 8,
                  padding: 6,
                  background: '#FFFFFF',
                  borderRadius: 4,
                  border: '1px solid #E5E7EB'
                }}>
                  <div style={{
                    fontSize: 9,
                    fontWeight: 600,
                    color: '#374151',
                    marginBottom: 4
                  }}>
                    Quick Start:
                  </div>
                  <ol style={{
                    fontSize: 9,
                    color: '#6B7280',
                    marginLeft: 16,
                    marginBottom: 0
                  }}>
                    <li>Copy the embedding code above</li>
                    <li>Add it to your website's HTML</li>
                    <li>Configure sources in Inkeep dashboard</li>
                  </ol>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Deployment Result */}
        {deploymentResult && !isDeploying && (
          <div style={{
            marginTop: 12,
            padding: 10,
            borderRadius: 6,
            background: deploymentResult.error ? '#FEF2F2' : '#F0FDF4',
            border: `1px solid ${deploymentResult.error ? '#FECACA' : '#BBF7D0'}`
          }}>
            {deploymentResult.error ? (
              <div>
                <div style={{
                  fontSize: 11,
                  fontWeight: 600,
                  color: '#DC2626',
                  marginBottom: 4
                }}>
                  Deployment Failed
                </div>
                <div style={{
                  fontSize: 10,
                  color: '#7F1D1D'
                }}>
                  {deploymentResult.error}
                </div>
              </div>
            ) : (
              <div>
                <div style={{
                  fontSize: 11,
                  fontWeight: 600,
                  color: '#166534',
                  marginBottom: 6
                }}>
                  ✅ Agent Deployed Successfully!
                </div>
                <div style={{
                  fontSize: 10,
                  color: '#14532D',
                  marginBottom: 4
                }}>
                  API Endpoint: 
                  <a 
                    href={deploymentResult.apiEndpoint} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    style={{
                      color: '#3B82F6',
                      marginLeft: 4,
                      textDecoration: 'underline'
                    }}
                  >
                    {deploymentResult.apiEndpoint}
                  </a>
                </div>
                {deploymentResult.durableObjectUrl && (
                  <div style={{
                    fontSize: 10,
                    color: '#14532D',
                    marginBottom: 8
                  }}>
                    Durable Object: 
                    <a 
                      href={deploymentResult.durableObjectUrl} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      style={{
                        color: '#3B82F6',
                        marginLeft: 4,
                        textDecoration: 'underline'
                      }}
                    >
                      {deploymentResult.durableObjectUrl}
                    </a>
                  </div>
                )}
                <div style={{
                  fontSize: 9,
                  color: '#374151',
                  background: '#F3F4F6',
                  padding: 6,
                  borderRadius: 4,
                  fontFamily: 'monospace',
                  whiteSpace: 'pre-wrap',
                  wordBreak: 'break-all'
                }}>
                  {deploymentResult.usage?.example}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Steps and Results Section - Under the instruction box */}
        {(isRunning || currentStep || browserSteps.length > 0) && (
          <div style={{
            marginTop: 12,
            padding: 10,
            borderRadius: 6,
            background: '#F8FAFC',
            border: '1px solid #E5E7EB'
          }}>
            <div style={{
              fontSize: 11,
              fontWeight: 600,
              color: '#374151',
              marginBottom: 8,
              textTransform: 'uppercase',
              letterSpacing: '0.05em'
            }}>
              Execution Steps & Results
            </div>
            
            {currentStep && (
              <div style={{
                padding: '6px 8px',
                borderRadius: 4,
                background: isRunning ? '#FEF3C7' : '#F0FDF4',
                border: `1px solid ${isRunning ? '#FDE68A' : '#BBF7D0'}`,
                marginBottom: 8
              }}>
                <div style={{
                  fontSize: 11,
                  color: isRunning ? '#92400E' : '#166534',
                  fontWeight: 500
                }}>
                  {currentStep}
                </div>
              </div>
            )}

            {browserSteps.length > 0 && (
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                gap: 6,
                maxHeight: 200,
                overflowY: 'auto'
              }}>
                {browserSteps.map((step, index) => (
                  <div
                    key={step.id || `step-${index}`}
                    style={{
                      padding: '6px 8px',
                      borderRadius: 4,
                      background: '#FFFFFF',
                      border: '1px solid #E5E7EB',
                      fontSize: 10,
                      color: '#6B7280'
                    }}
                  >
                    <div style={{ 
                      fontWeight: 600, 
                      marginBottom: 2,
                      color: '#374151'
                    }}>
                      Step {index + 1}: {step.action}
                    </div>
                    <div style={{ 
                      opacity: 0.9,
                      fontSize: 9
                    }}>
                      {step.description}
                    </div>
                    {step.timestamp && (
                      <div style={{
                        fontSize: 8,
                        opacity: 0.7,
                        marginTop: 2
                      }}>
                        {new Date(step.timestamp).toLocaleTimeString()}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Browser Stream - Attached to the right */}
      {isRunning && (
        <div style={{
          width: isBrowserMinimized ? 200 : 320,
          height: isBrowserMinimized ? 40 : 400,
          background: '#FFFFFF',
          border: '1px solid #E5E7EB',
          borderRadius: 8,
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)',
          overflow: 'hidden',
          transition: 'all 0.3s ease',
          flexShrink: 0
        }}>
          {/* Browser Header */}
          <div style={{
            height: 32,
            background: '#F9FAFB',
            borderBottom: '1px solid #E5E7EB',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0 8px'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6
            }}>
              <Monitor size={12} color="#6B7280" />
              <span style={{
                fontSize: 11,
                fontWeight: 500,
                color: '#374151'
              }}>
                Browser Session {cell.id.substring(0, 6)}
              </span>
            </div>
            
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: 4
            }}>
              <button
                onClick={() => setIsBrowserMinimized(!isBrowserMinimized)}
                style={{
                  width: 16,
                  height: 16,
                  border: 'none',
                  background: 'transparent',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: 2
                }}
              >
                <Minimize2 size={10} color="#6B7280" />
              </button>
              <button
                onClick={handleCloseBrowser}
                style={{
                  width: 16,
                  height: 16,
                  border: 'none',
                  background: 'transparent',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: 2
                }}
              >
                <X size={10} color="#6B7280" />
              </button>
            </div>
          </div>

          {/* Browser Content */}
          {!isBrowserMinimized && (
            <div style={{
              height: 'calc(100% - 32px)',
              display: 'flex',
              flexDirection: 'column'
            }}>
              {/* Live Browser Display */}
              {liveUrl && (
                <div style={{
                  height: '240px',
                  borderBottom: '1px solid #E5E7EB',
                  background: '#000000',
                  position: 'relative',
                  overflow: 'hidden'
                }}>
                  {liveUrl.startsWith('http') ? (
                    // HTTP URL - embed the debugger
                    <iframe
                      src={liveUrl}
                      style={{
                        width: '100%',
                        height: '100%',
                        border: 'none'
                      }}
                      title={`Live Browser Session ${cell.id}`}
                      allow="camera; microphone; display-capture"
                    />
                  ) : (
                    // WebSocket or other URL - show info
                    <div style={{
                      width: '100%',
                      height: '100%',
                      background: '#1a1a1a',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexDirection: 'column',
                      gap: 8,
                      padding: 8
                    }}>
                      <div style={{
                        width: 24,
                        height: 24,
                        borderRadius: '50%',
                        background: '#3B82F6',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        animation: 'pulse 2s infinite'
                      }}>
                        <Monitor size={12} color="#FFFFFF" />
                      </div>
                      <div style={{
                        fontSize: 10,
                        color: '#9CA3AF',
                        textAlign: 'center'
                      }}>
                        Live Browser Session
                      </div>
                      <button
                        onClick={() => window.open(liveUrl, '_blank')}
                        style={{
                          padding: '4px 8px',
                          borderRadius: 4,
                          border: '1px solid #374151',
                          background: 'transparent',
                          color: '#9CA3AF',
                          fontSize: 9,
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: 4
                        }}
                      >
                        <ExternalLink size={8} />
                        Open Live View
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* Session Info */}
              <div style={{
                flex: 1,
                overflow: 'auto',
                padding: '8px'
              }}>
                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 6
                }}>
                  {activeSessionId && (
                    <div style={{
                      padding: '6px 8px',
                      borderRadius: 4,
                      background: '#F0FDF4',
                      border: '1px solid #BBF7D0'
                    }}>
                      <div style={{
                        fontSize: 9,
                        fontWeight: 500,
                        color: '#374151',
                        marginBottom: 2
                      }}>
                        Session Active
                      </div>
                      <div style={{
                        fontSize: 8,
                        color: '#6B7280',
                        fontFamily: 'JetBrains Mono, ui-monospace, SFMono-Regular, Menlo, monospace'
                      }}>
                        ID: {activeSessionId.substring(0, 12)}...
                      </div>
                    </div>
                  )}
                  
                  <div style={{
                    padding: '6px 8px',
                    borderRadius: 4,
                    background: '#F8FAFC',
                    border: '1px solid #E5E7EB'
                  }}>
                    <div style={{
                      fontSize: 9,
                      fontWeight: 500,
                      color: '#374151',
                      marginBottom: 2
                    }}>
                      Live URL
                    </div>
                    <div style={{
                      fontSize: 7,
                      color: '#6B7280',
                      fontFamily: 'JetBrains Mono, ui-monospace, SFMono-Regular, Menlo, monospace',
                      wordBreak: 'break-all',
                      lineHeight: 1.2
                    }}>
                      {liveUrl || 'Waiting for URL...'}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          <style jsx>{`
            @keyframes pulse {
              0%, 100% {
                opacity: 1;
              }
              50% {
                opacity: 0.5;
              }
            }
          `}</style>
        </div>
      )}
    </div>
  )
}
