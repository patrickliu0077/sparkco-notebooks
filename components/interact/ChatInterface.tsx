'use client'

import { useState } from 'react'
import { Bot, User } from 'lucide-react'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
}

interface ChatInterfaceProps {
  agentId: string
  sessionId: string
}

export function ChatInterface({ agentId, sessionId }: ChatInterfaceProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'msg-1',
      role: 'assistant',
      content: 'Hello! I\'m your AI agent. How can I help you today?',
      timestamp: new Date()
    }
  ])

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }

  return (
    <div style={{
      flex: 1,
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden'
    }}>
      {/* Chat Header */}
      <div style={{
        padding: '16px 24px',
        borderBottom: '1px solid #E5E7EB',
        background: '#FFFFFF'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8
        }}>
          <div style={{
            width: '32px',
            height: '32px',
            borderRadius: '8px',
            background: '#F1F5F9',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <Bot size={16} color="#111827" />
          </div>
          <div>
            <div style={{
              fontSize: '14px',
              fontWeight: 500,
              color: '#111827'
            }}>
              AI Agent Chat
            </div>
            <div style={{
              fontSize: '12px',
              color: '#6B7280'
            }}>
              Session {sessionId}
            </div>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div style={{
        flex: 1,
        overflow: 'auto',
        padding: '16px 24px',
        background: '#FAFAFA'
      }}>
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 16,
          maxWidth: '800px',
          margin: '0 auto'
        }}>
          {messages.map((message) => (
            <div
              key={message.id}
              style={{
                display: 'flex',
                gap: 12,
                alignItems: 'flex-start'
              }}
            >
              {/* Avatar */}
              <div style={{
                width: '32px',
                height: '32px',
                borderRadius: '8px',
                background: message.role === 'assistant' ? '#F1F5F9' : '#3B82F6',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}>
                {message.role === 'assistant' ? (
                  <Bot size={16} color="#111827" />
                ) : (
                  <User size={16} color="#FFFFFF" />
                )}
              </div>

              {/* Message Content */}
              <div style={{
                flex: 1,
                minWidth: 0
              }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  marginBottom: 4
                }}>
                  <div style={{
                    fontSize: '13px',
                    fontWeight: 500,
                    color: '#111827'
                  }}>
                    {message.role === 'assistant' ? 'AI Agent' : 'You'}
                  </div>
                  <div style={{
                    fontSize: '11px',
                    color: '#9CA3AF'
                  }}>
                    {formatTime(message.timestamp)}
                  </div>
                </div>
                
                <div style={{
                  fontSize: '14px',
                  lineHeight: 1.5,
                  color: '#374151',
                  background: '#FFFFFF',
                  padding: '12px 16px',
                  borderRadius: '8px',
                  border: '1px solid #E5E7EB'
                }}>
                  {message.content}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
