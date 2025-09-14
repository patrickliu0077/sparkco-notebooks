'use client'

import { useState, useEffect } from 'react'
import { Monitor, X, Minimize2, ExternalLink } from 'lucide-react'

interface BrowserStreamProps {
  isRunning: boolean
  onClose: () => void
  cellId: string
  websocketUrl?: string
  sessionId?: string
}

export function BrowserStream({ isRunning, onClose, cellId, websocketUrl, sessionId }: BrowserStreamProps) {
  const [isMinimized, setIsMinimized] = useState(false)

  if (!isRunning) return null

  // Calculate position based on cellId to support multiple instances
  const instanceIndex = cellId ? (parseInt(cellId.slice(-1)) || 0) : 0
  const rightOffset = 20 + (instanceIndex * 340)

  return (
    <div style={{
      position: 'fixed',
      bottom: 20,
      right: rightOffset,
      width: isMinimized ? 200 : 320,
      height: isMinimized ? 40 : 320,
      background: '#FFFFFF',
      border: '1px solid #E5E7EB',
      borderRadius: 8,
      boxShadow: '0 8px 24px rgba(0, 0, 0, 0.12)',
      zIndex: 1000,
      overflow: 'hidden',
      transition: 'all 0.3s ease'
    }}>
      {/* Header */}
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
            Browserbase Live
          </span>
        </div>
        
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 4
        }}>
          <button
            onClick={() => setIsMinimized(!isMinimized)}
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
            onClick={onClose}
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

      {/* Content */}
      {!isMinimized && (
        <div style={{
          height: 'calc(100% - 32px)',
          display: 'flex',
          flexDirection: 'column'
        }}>
          {/* Live Browser Display */}
          {websocketUrl && (
            <div style={{
              height: '200px',
              borderBottom: '1px solid #E5E7EB',
              background: '#000000',
              position: 'relative',
              overflow: 'hidden'
            }}>
              {websocketUrl.startsWith('http') ? (
                // HTTP URL - embed the debugger
                <iframe
                  src={websocketUrl}
                  style={{
                    width: '100%',
                    height: '100%',
                    border: 'none'
                  }}
                  title="Live Browser Session"
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
                    onClick={() => window.open(websocketUrl, '_blank')}
                    style={{
                      padding: '4px 8px',
                      borderRadius: 4,
                      border: '1px solid #374151',
                      background: 'transparent',
                      color: '#9CA3AF',
                      fontSize: 9,
                      cursor: 'pointer'
                    }}
                  >
                    <ExternalLink size={8} style={{ marginRight: 4 }} />
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
              {sessionId && (
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
                    ID: {sessionId}
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
                  {websocketUrl || 'Waiting for URL...'}
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
  )
}
