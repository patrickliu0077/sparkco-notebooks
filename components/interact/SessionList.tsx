'use client'

import { useState } from 'react'
import { Plus, MessageCircle, Clock } from 'lucide-react'

interface Session {
  id: string
  title: string
  lastMessage: string
  timestamp: Date
  messageCount: number
}

interface SessionListProps {
  agentId: string | null
  selectedSessionId: string | null
  onSelectSession: (sessionId: string | null) => void
}

export function SessionList({ agentId, selectedSessionId, onSelectSession }: SessionListProps) {
  const [sessions, setSessions] = useState<Session[]>([
    {
      id: 'session-1',
      title: 'New Conversation',
      lastMessage: 'Hello! How can I help you today?',
      timestamp: new Date(),
      messageCount: 1
    }
  ])

  const handleCreateSession = () => {
    if (!agentId) return
    
    const newSession: Session = {
      id: `session-${Date.now()}`,
      title: `Session ${sessions.length + 1}`,
      lastMessage: 'New conversation started',
      timestamp: new Date(),
      messageCount: 0
    }
    
    setSessions([newSession, ...sessions])
    onSelectSession(newSession.id)
  }

  const formatTime = (date: Date) => {
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const minutes = Math.floor(diff / 60000)
    
    if (minutes < 1) return 'Just now'
    if (minutes < 60) return `${minutes}m ago`
    if (minutes < 1440) return `${Math.floor(minutes / 60)}h ago`
    return date.toLocaleDateString()
  }

  if (!agentId) {
    return (
      <div style={{
        padding: '16px',
        textAlign: 'center',
        color: '#9CA3AF'
      }}>
        <MessageCircle size={32} style={{ margin: '0 auto 8px', opacity: 0.5 }} />
        <p style={{ fontSize: 14 }}>Select an agent first</p>
      </div>
    )
  }

  return (
    <div style={{ padding: '16px' }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '12px'
      }}>
        <h3 style={{
          fontSize: '12px',
          fontWeight: 600,
          color: '#6B7280',
          margin: 0,
          textTransform: 'uppercase',
          letterSpacing: '0.05em'
        }}>
          Sessions
        </h3>
        <button
          onClick={handleCreateSession}
          style={{
            width: '24px',
            height: '24px',
            borderRadius: '4px',
            border: '1px solid #E5E7EB',
            background: '#FFFFFF',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            color: '#6B7280'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = '#F3F4F6'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = '#FFFFFF'
          }}
        >
          <Plus size={12} />
        </button>
      </div>

      {/* Sessions */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        {sessions.map((session) => {
          const isSelected = selectedSessionId === session.id
          
          return (
            <div
              key={session.id}
              onClick={() => onSelectSession(session.id)}
              style={{
                padding: '12px',
                borderRadius: '6px',
                border: `1px solid ${isSelected ? '#3B82F6' : '#E5E7EB'}`,
                background: isSelected ? '#F8FAFC' : '#FFFFFF',
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
              onMouseEnter={(e) => {
                if (!isSelected) {
                  e.currentTarget.style.borderColor = '#D1D5DB'
                  e.currentTarget.style.background = '#F9FAFB'
                }
              }}
              onMouseLeave={(e) => {
                if (!isSelected) {
                  e.currentTarget.style.borderColor = '#E5E7EB'
                  e.currentTarget.style.background = '#FFFFFF'
                }
              }}
            >
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '4px'
              }}>
                <div style={{
                  fontSize: '13px',
                  fontWeight: 500,
                  color: isSelected ? '#1E40AF' : '#111827',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                  flex: 1
                }}>
                  {session.title}
                </div>
                <div style={{
                  fontSize: '10px',
                  color: '#9CA3AF',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 2
                }}>
                  <Clock size={8} />
                  {formatTime(session.timestamp)}
                </div>
              </div>
              
              <div style={{
                fontSize: '11px',
                color: '#6B7280',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                marginBottom: '4px'
              }}>
                {session.lastMessage}
              </div>
              
              <div style={{
                fontSize: '10px',
                color: '#9CA3AF'
              }}>
                {session.messageCount} messages
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
