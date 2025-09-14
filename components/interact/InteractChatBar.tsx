'use client'

import { useState } from 'react'
import { Send } from 'lucide-react'

interface InteractChatBarProps {
  onSendMessage: (message: string) => void
}

export function InteractChatBar({ onSendMessage }: InteractChatBarProps) {
  const [message, setMessage] = useState('')

  const handleSend = () => {
    if (message.trim()) {
      onSendMessage(message.trim())
      setMessage('')
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <div style={{
      padding: '16px 24px',
      borderTop: '1px solid #E5E7EB',
      background: '#FFFFFF'
    }}>
      <div style={{
        maxWidth: '800px',
        margin: '0 auto',
        display: 'flex',
        alignItems: 'flex-end',
        gap: 12,
        background: '#F9FAFB',
        border: '1px solid #E5E7EB',
        borderRadius: 12,
        padding: '12px 16px'
      }}>
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type your message to the agent..."
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
        />
        
        <button
          onClick={handleSend}
          disabled={!message.trim()}
          style={{
            width: 32,
            height: 32,
            borderRadius: 8,
            background: message.trim() ? '#3B82F6' : '#E5E7EB',
            color: message.trim() ? '#FFFFFF' : '#9CA3AF',
            border: 'none',
            cursor: message.trim() ? 'pointer' : 'not-allowed',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'all 0.15s ease',
            flexShrink: 0
          }}
          onMouseEnter={(e) => {
            if (message.trim()) {
              e.currentTarget.style.background = '#2563EB'
            }
          }}
          onMouseLeave={(e) => {
            if (message.trim()) {
              e.currentTarget.style.background = '#3B82F6'
            }
          }}
        >
          <Send size={14} />
        </button>
      </div>
    </div>
  )
}
