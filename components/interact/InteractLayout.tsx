'use client'

import { useState } from 'react'
import { Bot } from 'lucide-react'
import { AgentSelector } from './AgentSelector'
import { SessionList } from './SessionList'
import { ChatInterface } from './ChatInterface'
import { InteractChatBar } from './InteractChatBar'

export function InteractLayout() {
  const [selectedAgentId, setSelectedAgentId] = useState<string | null>(null)
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(null)

  return (
    <div style={{ 
      height: '100vh', 
      display: 'flex',
      background: '#FAFAFA'
    }}>
      {/* Left Column */}
      <div style={{
        width: '320px',
        borderRight: '1px solid #E5E7EB',
        background: '#FFFFFF',
        display: 'flex',
        flexDirection: 'column'
      }}>
        {/* Agent Selection */}
        <div style={{
          padding: '16px',
          borderBottom: '1px solid #E5E7EB'
        }}>
          <h2 style={{
            fontSize: '14px',
            fontWeight: 600,
            color: '#111827',
            margin: '0 0 12px 0'
          }}>
            Select Agent
          </h2>
          <AgentSelector 
            selectedAgentId={selectedAgentId}
            onSelectAgent={setSelectedAgentId}
          />
        </div>

        {/* Sessions List */}
        <div style={{
          flex: 1,
          overflow: 'auto'
        }}>
          <SessionList
            agentId={selectedAgentId}
            selectedSessionId={selectedSessionId}
            onSelectSession={setSelectedSessionId}
          />
        </div>
      </div>

      {/* Right Side - Chat Interface */}
      <div style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        position: 'relative'
      }}>
        {selectedAgentId && selectedSessionId ? (
          <>
            <ChatInterface 
              agentId={selectedAgentId}
              sessionId={selectedSessionId}
            />
            <InteractChatBar 
              onSendMessage={(message) => {
                console.log('Sending message:', message)
                // TODO: Implement message sending
              }}
            />
          </>
        ) : (
          <div style={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#9CA3AF'
          }}>
            <div style={{ textAlign: 'center' }}>
              <Bot size={48} style={{ margin: '0 auto 12px', opacity: 0.5 }} />
              <p style={{ fontSize: 16, fontWeight: 500, marginBottom: 4 }}>
                Select an agent to start interacting
              </p>
              <p style={{ fontSize: 14 }}>
                Choose an agent from the left panel and create or select a session
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
