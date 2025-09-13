'use client'

import { useState, useRef, useEffect } from 'react'
import { Send, GripHorizontal } from 'lucide-react'

export function ChatBar() {
  const [message, setMessage] = useState('')
  const [width, setWidth] = useState(600)
  const [position, setPosition] = useState({ x: 561.5, y: 20 })
  const [isDragging, setIsDragging] = useState(false)
  const [isResizing, setIsResizing] = useState(false)
  const [isFocused, setIsFocused] = useState(false)
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 })
  const [resizeStart, setResizeStart] = useState({ mouseX: 0, initialWidth: 0, initialX: 0 })

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
      document.addEventListener('mousemove', handleMouseMove)
      document.addEventListener('mouseup', handleMouseUp)
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
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
            bottom: position.y + 60,
            left: position.x,
            width: width,
            height: 200,
            background: 'rgba(255, 255, 255, 0.05)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: 12,
            pointerEvents: 'none',
            animation: 'glass-grow 0.3s ease-out',
            zIndex: 99
          }}
        />
      )}
      
      <style jsx>{`
        @keyframes glass-grow {
          0% {
            height: 0;
            opacity: 0;
          }
          100% {
            height: 200px;
            opacity: 1;
          }
        }
      `}</style>
    </div>
  )
}
