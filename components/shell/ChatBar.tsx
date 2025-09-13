'use client'

import { useState } from 'react'
import { Send, Sparkles } from 'lucide-react'

export function ChatBar() {
  const [message, setMessage] = useState('')

  const handleSend = () => {
    if (message.trim()) {
      console.log('Sending message:', message)
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
    <div
      style={{
        position: 'fixed',
        bottom: 20,
        left: '50%',
        transform: 'translateX(-50%)',
        width: '90%',
        maxWidth: 600,
        zIndex: 100
      }}
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
          gap: 12
        }}
      >
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={handleKeyDown}
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
        >
          ↑
        </div>
      </div>
    </div>
  )
}
