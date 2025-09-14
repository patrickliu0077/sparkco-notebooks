'use client'

import { useState, useEffect } from 'react'
import { Monitor, X, Minimize2, ExternalLink } from 'lucide-react'
import type { BrowserbaseLog, BrowserbaseSession } from '@/lib/browserbase'

interface BrowserPreviewProps {
  isRunning: boolean
  onClose: () => void
  cellId: string
  steps: any[] // Will be formatted logs from Browserbase
  liveUrl?: string
  currentStep?: string
}

export function BrowserPreview({ isRunning, onClose, cellId, steps, liveUrl, currentStep }: BrowserPreviewProps) {
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
      height: isMinimized ? 40 : 280,
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
            Agent Browser
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
          {liveUrl && (
            <div style={{
              height: '160px',
              borderBottom: '1px solid #E5E7EB',
              background: '#000000',
              position: 'relative',
              overflow: 'hidden'
            }}>
              {liveUrl.startsWith('wss://') ? (
                // WebSocket live view - embed browser session
                <div style={{
                  width: '100%',
                  height: '100%',
                  background: '#1a1a1a',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexDirection: 'column',
                  gap: 8
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
                  <div style={{
                    fontSize: 8,
                    color: '#9CA3AF',
                    textAlign: 'center',
                    fontFamily: 'JetBrains Mono, ui-monospace, SFMono-Regular, Menlo, monospace',
                    wordBreak: 'break-all',
                    padding: '4px'
                  }}>
                    {liveUrl}
                  </div>
                </div>
              ) : (
                // HTTP URL - try to embed
                <iframe
                  src={liveUrl}
                  style={{
                    width: '200%',
                    height: '200%',
                    border: 'none',
                    transform: 'scale(0.5)',
                    transformOrigin: 'top left'
                  }}
                  title="Live Browser Session"
                />
              )}
            </div>
          )}

          {/* Steps */}
          <div style={{
            flex: 1,
            overflow: 'auto',
            padding: '8px'
          }}>
            {steps.length > 0 ? (
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                gap: 6
              }}>
                {steps.map((step, index) => (
                  <div
                    key={step.id || `step-${index}`}
                    style={{
                      padding: '6px 8px',
                      borderRadius: 4,
                      background: step.status === 'completed' ? '#F0FDF4' : 
                                 step.status === 'running' ? '#FEF3C7' : '#F8FAFC',
                      border: `1px solid ${step.status === 'completed' ? '#BBF7D0' : 
                                          step.status === 'running' ? '#FDE68A' : '#E5E7EB'}`
                    }}
                  >
                    <div style={{
                      fontSize: 9,
                      fontWeight: 500,
                      color: '#374151',
                      marginBottom: 2
                    }}>
                      Step {index + 1}: {step.action}
                    </div>
                    <div style={{
                      fontSize: 8,
                      color: '#6B7280',
                      lineHeight: 1.3
                    }}>
                      {step.description}
                    </div>
                  </div>
                ))}
                
                {/* Current step indicator */}
                {currentStep && (
                  <div style={{
                    padding: '6px 8px',
                    borderRadius: 4,
                    background: '#FEF3C7',
                    border: '1px solid #FDE68A',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 4
                  }}>
                    <div style={{
                      width: 8,
                      height: 8,
                      borderRadius: '50%',
                      background: '#F59E0B',
                      animation: 'pulse 2s infinite'
                    }} />
                    <div style={{
                      fontSize: 8,
                      color: '#92400E',
                      fontWeight: 500
                    }}>
                      {currentStep}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexDirection: 'column',
                gap: 8,
                height: '100%'
              }}>
                <div style={{
                  width: 32,
                  height: 32,
                  borderRadius: '50%',
                  background: '#111827',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  animation: 'pulse 2s infinite'
                }}>
                  <Monitor size={14} color="#FFFFFF" />
                </div>
                
                <div style={{
                  fontSize: 11,
                  color: '#6B7280',
                  textAlign: 'center'
                }}>
                  Starting browser agent...
                </div>
              </div>
            )}
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
