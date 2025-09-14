'use client'

import { useDocument } from '@/lib/store'
import { Sparkles, Zap, Bot, Rocket, Target, Crown, Diamond, Star } from 'lucide-react'

const iconMap = {
  Sparkles, Zap, Bot, Rocket, Target, Crown, Diamond, Star
}

interface AgentSelectorProps {
  selectedAgentId: string | null
  onSelectAgent: (agentId: string | null) => void
}

export function AgentSelector({ selectedAgentId, onSelectAgent }: AgentSelectorProps) {
  const document = useDocument()
  
  // For now, we'll use the current document as the agent
  // In the future, this could be expanded to show multiple agents
  const agents = [
    {
      id: document.id,
      title: document.title,
      icon: document.icon || 'Sparkles',
      description: document.description || 'AI Agent',
      cellCount: document.cells.length
    }
  ]

  const handleSelectAgent = (agentId: string) => {
    onSelectAgent(selectedAgentId === agentId ? null : agentId)
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      {agents.map((agent) => {
        const IconComponent = iconMap[agent.icon as keyof typeof iconMap] || Sparkles
        const isSelected = selectedAgentId === agent.id
        
        return (
          <div
            key={agent.id}
            onClick={() => handleSelectAgent(agent.id)}
            style={{
              width: '100%',
              height: '80px',
              padding: '12px',
              borderRadius: '8px',
              border: `1px solid ${isSelected ? '#3B82F6' : '#E5E7EB'}`,
              background: isSelected ? '#F8FAFC' : '#FFFFFF',
              cursor: 'pointer',
              transition: 'all 0.15s ease',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center'
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
              width: '24px',
              height: '24px',
              borderRadius: '6px',
              background: isSelected ? '#3B82F6' : '#F1F5F9',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '6px'
            }}>
              <IconComponent size={14} color={isSelected ? '#FFFFFF' : '#111827'} />
            </div>
            
            <div style={{
              fontSize: '12px',
              fontWeight: 500,
              color: isSelected ? '#1E40AF' : '#111827',
              textAlign: 'center',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
              width: '100%',
              marginBottom: '2px'
            }}>
              {agent.title}
            </div>
            
            <div style={{
              fontSize: '10px',
              color: '#9CA3AF',
              textAlign: 'center'
            }}>
              {agent.cellCount} cells
            </div>
          </div>
        )
      })}
    </div>
  )
}
