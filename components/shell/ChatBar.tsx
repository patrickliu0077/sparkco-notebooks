'use client'

import { useState, useRef, useEffect } from 'react'
import { usePathname } from 'next/navigation'
import { Send, GripHorizontal, Loader2 } from 'lucide-react'
import { useAgentStore } from '@/lib/store'

interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
  actions?: any[]
  toolCalls?: any[]
}

export function ChatBar() {
  const pathname = usePathname()
  
  // Hide on interact page
  if (pathname === '/interact') {
    return null
  }
  
  const [message, setMessage] = useState('')
  const [width, setWidth] = useState(600)
  const [position, setPosition] = useState({ x: 561.5, y: 20 })
  const [isDragging, setIsDragging] = useState(false)
  const [isResizing, setIsResizing] = useState(false)
  const [isFocused, setIsFocused] = useState(false)
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 })
  const [resizeStart, setResizeStart] = useState({ mouseX: 0, initialWidth: 0, initialX: 0 })
  const [isLoading, setIsLoading] = useState(false)
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([])
  const messagesEndRef = useRef<HTMLDivElement>(null)
  
  // Get store actions and state
  const { addCell, updateCell, deleteCell, document } = useAgentStore()
  const cells = document.cells

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [chatHistory, isFocused])

  const typewriterEffect = async (text: string, callback: (partial: string) => void, speed: number = 30) => {
    let currentText = ''
    for (let i = 0; i < text.length; i++) {
      currentText += text[i]
      callback(currentText)
      await new Promise(resolve => setTimeout(resolve, speed))
    }
  }

  const executeActionsWithTypewriter = async (actions: any[]) => {
    for (const action of actions) {
      switch (action.type) {
        case 'ADD_CELL':
          // For prompt cells with content, add with typewriter effect
          if (action.kind === 'prompt' && action.data.content) {
            const originalContent = action.data.content
            // First add the cell with empty content
            addCell(action.kind, action.atIndex, { ...action.data, content: '' })
            
            // Get the newly added cell
            const newCells = useAgentStore.getState().document.cells
            const newCell = newCells[action.atIndex !== undefined ? action.atIndex : newCells.length - 1]
            
            // Stream the content with typewriter effect
            await typewriterEffect(originalContent, (partial) => {
              updateCell(newCell.id, { content: partial })
            })
          } else {
            addCell(action.kind, action.atIndex, action.data)
          }
          break
          
        case 'UPDATE_CELL':
          // If updating content, use typewriter effect
          if (action.updates.content) {
            const originalContent = action.updates.content
            // First clear the content
            updateCell(action.cellId, { ...action.updates, content: '' })
            
            // Stream the new content
            await typewriterEffect(originalContent, (partial) => {
              updateCell(action.cellId, { content: partial })
            })
          } else {
            updateCell(action.cellId, action.updates)
          }
          break
          
        case 'DELETE_CELL':
          // Add a small delay for visual effect
          await new Promise(resolve => setTimeout(resolve, 200))
          deleteCell(action.cellId)
          break
          
        case 'CLEAR_ALL':
          // Clear all cells with a staggered effect
          const cellsToDelete = [...cells]
          for (const cell of cellsToDelete) {
            deleteCell(cell.id)
            await new Promise(resolve => setTimeout(resolve, 100))
          }
          break
          
        case 'RUN_BLOCK':
          // This would trigger the run action on the specific block
          console.log('Run block:', action.cellId, action.action)
          break
      }
      
      // Add a small delay between actions for visual clarity
      await new Promise(resolve => setTimeout(resolve, 300))
    }
  }

  const handleSend = async () => {
    if (message.trim() && !isLoading) {
      const userMessage = message.trim()
      setMessage('')
      setIsLoading(true)
      
      // Add user message to history
      const newUserMessage: ChatMessage = {
        role: 'user',
        content: userMessage,
        timestamp: new Date()
      }
      setChatHistory(prev => [...prev, newUserMessage])
      
      try {
        // Call the chat agent API
        const response = await fetch('/api/chat-agent', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            message: userMessage,
            conversationHistory: chatHistory.map(msg => ({
              role: msg.role,
              content: msg.content
            })),
            currentBlocks: cells
          })
        })
        
        if (!response.ok) {
          throw new Error('Failed to get response')
        }
        
        const data = await response.json()
        
        // Add assistant response to history
        const assistantMessage: ChatMessage = {
          role: 'assistant',
          content: data.message,
          timestamp: new Date(),
          actions: data.actions,
          toolCalls: data.toolCalls
        }
        setChatHistory(prev => [...prev, assistantMessage])
        
        // Execute any actions returned by the agent with typewriter effect
        if (data.actions && data.actions.length > 0) {
          executeActionsWithTypewriter(data.actions)
        }
        
      } catch (error) {
        console.error('Chat error:', error)
        const errorMessage: ChatMessage = {
          role: 'assistant',
          content: 'Sorry, I encountered an error. Please try again.',
          timestamp: new Date()
        }
        setChatHistory(prev => [...prev, errorMessage])
      } finally {
        setIsLoading(false)
      }
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const handleDragStart = (e: React.MouseEvent) => {
    if (isResizing) return
    setIsDragging(true)
    setDragOffset({
      x: e.clientX - position.x,
      y: e.clientY - (window.innerHeight - position.y)
    })
  }

  const handleResizeStart = (e: React.MouseEvent) => {
    e.stopPropagation()
    setIsResizing(true)
    setResizeStart({
      mouseX: e.clientX,
      initialWidth: width,
      initialX: position.x
    })
  }

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isDragging) {
        setPosition({
          x: e.clientX - dragOffset.x,
          y: window.innerHeight - (e.clientY - dragOffset.y)
        })
      } else if (isResizing) {
        const deltaX = e.clientX - resizeStart.mouseX
        const newWidth = Math.max(300, Math.min(800, resizeStart.initialWidth + deltaX * 2))
        
        setWidth(newWidth)
        // Keep centered by adjusting X position based on width change
        const centerX = resizeStart.initialX + resizeStart.initialWidth / 2
        setPosition(prev => ({
          ...prev,
          x: centerX - newWidth / 2
        }))
      }
    }

    const handleMouseUp = () => {
      setIsDragging(false)
      setIsResizing(false)
    }

    if (isDragging || isResizing) {
      window.document.addEventListener('mousemove', handleMouseMove)
      window.document.addEventListener('mouseup', handleMouseUp)
    }

    return () => {
      window.document.removeEventListener('mousemove', handleMouseMove)
      window.document.removeEventListener('mouseup', handleMouseUp)
    }
  }, [isDragging, isResizing, dragOffset, resizeStart])

  // Center initially after mount
  useEffect(() => {
    setPosition(prev => ({
      x: (window.innerWidth - width) / 2,
      y: prev.y
    }))
  }, [width])

  return (
    <div
      style={{
        position: 'fixed',
        bottom: position.y,
        left: position.x,
        width: width,
        zIndex: 100,
        cursor: isDragging ? 'grabbing' : 'grab'
      }}
      onMouseDown={handleDragStart}
    >
      <div
        style={{
          background: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(229, 231, 235, 0.8)',
          borderRadius: 24,
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.12), 0 2px 8px rgba(0, 0, 0, 0.08)',
          padding: '12px 16px',
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          position: 'relative'
        }}
      >
        {/* Left resize handle */}
        <div
          style={{
            position: 'absolute',
            left: -8,
            top: '50%',
            transform: 'translateY(-50%)',
            width: 16,
            height: 20,
            cursor: 'ew-resize',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            opacity: 0.3
          }}
          onMouseDown={handleResizeStart}
        >
          <GripHorizontal size={12} color="#9CA3AF" />
        </div>

        {/* Right resize handle */}
        <div
          style={{
            position: 'absolute',
            right: -8,
            top: '50%',
            transform: 'translateY(-50%)',
            width: 16,
            height: 20,
            cursor: 'ew-resize',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            opacity: 0.3
          }}
          onMouseDown={handleResizeStart}
        >
          <GripHorizontal size={12} color="#9CA3AF" />
        </div>

        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder="Ask about your agent or describe what you want to build..."
          style={{
            flex: 1,
            minHeight: 20,
            maxHeight: 120,
            padding: 0,
            border: 'none',
            outline: 'none',
            background: 'transparent',
            resize: 'none',
            fontSize: 14,
            lineHeight: 1.4,
            color: '#111827',
            fontFamily: 'Inter, system-ui, sans-serif'
          }}
          rows={1}
          onMouseDown={(e) => e.stopPropagation()}
        />
        
        <div
          style={{
            width: 20,
            height: 20,
            borderRadius: 10,
            background: message.trim() ? '#111827' : '#E5E7EB',
            color: message.trim() ? '#FFFFFF' : '#9CA3AF',
            cursor: message.trim() ? 'pointer' : 'not-allowed',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'all 0.15s ease',
            flexShrink: 0
          }}
          onClick={handleSend}
          onMouseDown={(e) => e.stopPropagation()}
        >
          ↑
        </div>
      </div>
      
      {/* Glass screen that grows upward when focused */}
      {isFocused && (
        <div
          style={{
            position: 'fixed',
            bottom: position.y + 48,
            left: position.x + 24,
            width: width - 48,
            height: 400,
            background: 'rgba(59, 130, 246, 0.08)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(59, 130, 246, 0.15)',
            borderBottom: 'none',
            borderRadius: '12px 12px 0 0',
            animation: 'glass-grow 0.3s ease-out',
            zIndex: 99,
            display: 'flex',
            flexDirection: 'column'
          }}
        >
          {/* Chat messages */}
          <div style={{
            flex: 1,
            overflowY: 'auto',
            padding: '16px',
            display: 'flex',
            flexDirection: 'column',
            gap: 12
          }}>
            {chatHistory.map((msg, index) => (
              <div
                key={index}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: msg.role === 'user' ? 'flex-end' : 'flex-start'
                }}
              >
                <div
                  style={{
                    maxWidth: '70%',
                    padding: '8px 12px',
                    borderRadius: 12,
                    background: msg.role === 'user' ? '#111827' : '#F3F4F6',
                    color: msg.role === 'user' ? '#FFFFFF' : '#111827',
                    fontSize: 13,
                    lineHeight: 1.5
                  }}
                >
                  {msg.content}
                </div>
                {msg.toolCalls && msg.toolCalls.length > 0 && (
                  <div style={{
                    marginTop: 6,
                    padding: '6px 8px',
                    background: 'rgba(59, 130, 246, 0.1)',
                    borderRadius: 6,
                    fontSize: 10,
                    color: '#3B82F6',
                    fontFamily: 'JetBrains Mono, ui-monospace, monospace'
                  }}>
                    {msg.toolCalls?.map((tool: any, idx: number) => (
                      <div key={idx} style={{ marginBottom: idx < (msg.toolCalls?.length || 0) - 1 ? 4 : 0 }}>
                        <div style={{ fontWeight: 600 }}>
                          🔧 {tool.name}
                        </div>
                        <div style={{ 
                          marginLeft: 16, 
                          opacity: 0.9,
                          fontSize: 9,
                          marginTop: 2
                        }}>
                          {JSON.stringify(tool.args, null, 2)}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
            {isLoading && (
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                color: '#6B7280',
                fontSize: 12
              }}>
                <Loader2 size={12} className="animate-spin" />
                Thinking...
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </div>
      )}
      
      <style jsx>{`
        @keyframes glass-grow {
          0% {
            height: 0;
            opacity: 0;
          }
          100% {
            height: 400px;
            opacity: 1;
          }
        }
        
        @keyframes spin {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }
        
        .animate-spin {
          animation: spin 1s linear infinite;
        }
      `}</style>
    </div>
  )
}
