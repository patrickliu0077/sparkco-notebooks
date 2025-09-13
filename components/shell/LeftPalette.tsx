'use client'

import { useState } from 'react'
import { useLeftPanelCollapsed, useAgentStore } from "@/lib/store"
import { 
  Mail, 
  MessageSquare, 
  FileText, 
  Table, 
  Globe, 
  Folder,
  Settings,
  Zap,
  Wrench,
  GitBranch,
  RotateCcw,
  Database,
  Search,
  ArrowRight,
  MessageCircle,
  Sparkles,
  Bot,
  CreditCard,
  Store,
  Webhook,
  DollarSign,
  Users,
  Shield,
  CheckCircle
} from "lucide-react"
import type { PaletteItem } from "@/lib/types"

const connectorItems: PaletteItem[] = [
  {
    id: 'gmail',
    type: 'connector',
    label: 'Gmail',
    description: 'Connect to Gmail for email operations',
    icon: 'Mail',
    data: { connector: 'gmail' }
  },
  {
    id: 'slack',
    type: 'connector', 
    label: 'Slack',
    description: 'Connect to Slack for messaging',
    icon: 'MessageSquare',
    data: { connector: 'slack' }
  },
  {
    id: 'notion',
    type: 'connector',
    label: 'Notion',
    description: 'Connect to Notion for document management',
    icon: 'FileText',
    data: { connector: 'notion' }
  },
  {
    id: 'sheets',
    type: 'connector',
    label: 'Google Sheets',
    description: 'Connect to Google Sheets for data',
    icon: 'Table',
    data: { connector: 'sheets' }
  },
  {
    id: 'http',
    type: 'connector',
    label: 'HTTP API',
    description: 'Connect to any HTTP API',
    icon: 'Globe',
    data: { connector: 'http' }
  },
  {
    id: 'files',
    type: 'connector',
    label: 'Files',
    description: 'Work with local files',
    icon: 'Folder',
    data: { connector: 'files' }
  },
  {
    id: 'agent-api',
    type: 'connector',
    label: 'Agent API',
    description: 'Connect to other AI agents',
    icon: 'Bot',
    data: { connector: 'agent-api' }
  },
  {
    id: 'payment',
    type: 'connector',
    label: 'Payment',
    description: 'Stripe, PayPal, crypto payments',
    icon: 'CreditCard',
    data: { connector: 'payment' }
  },
  {
    id: 'marketplace',
    type: 'connector',
    label: 'Marketplace',
    description: 'Agent marketplace integration',
    icon: 'Store',
    data: { connector: 'marketplace' }
  },
  {
    id: 'webhook',
    type: 'connector',
    label: 'Webhook',
    description: 'Receive agent callbacks',
    icon: 'Webhook',
    data: { connector: 'webhook' }
  }
]

const nodeItems: PaletteItem[] = [
  {
    id: 'llm',
    type: 'node',
    label: 'LLM',
    description: 'Large Language Model processing',
    icon: 'Zap',
    data: { nodeType: 'llm' }
  },
  {
    id: 'payment',
    type: 'node',
    label: 'Payment',
    description: 'Process payments',
    icon: 'DollarSign',
    data: { nodeType: 'payment' }
  },
  {
    id: 'agent-call',
    type: 'node',
    label: 'Agent Call',
    description: 'Call another agent',
    icon: 'Users',
    data: { nodeType: 'agent-call' }
  },
  {
    id: 'escrow',
    type: 'node',
    label: 'Escrow',
    description: 'Hold funds in escrow',
    icon: 'Shield',
    data: { nodeType: 'escrow' }
  }
]

const promptItems: PaletteItem[] = []

const iconMap = {
  Mail, MessageSquare, FileText, Table, Globe, Folder, Settings,
  Zap, Wrench, GitBranch, RotateCcw, Database, Search, ArrowRight,
  MessageCircle, Sparkles, Bot, CreditCard, Store, Webhook,
  DollarSign, Users, Shield, CheckCircle
}

interface PaletteItemCardProps {
  item: PaletteItem
  onDragStart: (item: PaletteItem) => void
}

function PaletteItemCard({ item, onDragStart }: PaletteItemCardProps) {
  const IconComponent = iconMap[item.icon as keyof typeof iconMap]
  
  return (
    <div
      draggable
      onDragStart={() => onDragStart(item)}
      style={{
        padding: '8px',
        borderRadius: '6px',
        border: '1px solid #E5E7EB',
        backgroundColor: '#FFFFFF',
        cursor: 'grab',
        transition: 'all 0.15s',
        marginBottom: '6px'
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.backgroundColor = '#F9FAFB'
        e.currentTarget.style.borderColor = '#E5E7EB'
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.backgroundColor = '#FFFFFF'
        e.currentTarget.style.borderColor = '#E5E7EB'
      }}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
        <div style={{
          width: '24px',
          height: '24px',
          borderRadius: '4px',
          backgroundColor: '#F1F5F9',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0
        }}>
          <IconComponent size={14} color="#111827" />
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <h4 style={{
            fontWeight: 500,
            fontSize: '13px',
            color: '#374151',
            margin: '0 0 2px 0'
          }}>
            {item.label}
          </h4>
          <p style={{
            fontSize: '11px',
            color: '#6B7280',
            margin: 0,
            lineHeight: 1.3
          }}>
            {item.description}
          </p>
        </div>
      </div>
    </div>
  )
}

export function LeftPalette() {
  const leftPanelCollapsed = useLeftPanelCollapsed()
  const [activeTab, setActiveTab] = useState<'connectors' | 'nodes' | 'prompts'>('connectors')
  const [searchQuery, setSearchQuery] = useState('')

  const handleDragStart = (item: PaletteItem) => {
    console.log('Dragging item:', item)
  }

  const filterItems = (items: PaletteItem[]) => {
    if (!searchQuery) return items
    return items.filter(item => 
      item.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase())
    )
  }

  const tabs = [
    { id: 'connectors', label: 'Connectors', items: connectorItems },
    { id: 'nodes', label: 'Nodes', items: nodeItems }
  ] as const

  if (leftPanelCollapsed) {
    return (
      <div style={{
        width: '48px',
        borderRight: '1px solid #E5E7EB',
        backgroundColor: '#FFFFFF',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        paddingTop: '12px',
        gap: '4px',
        position: 'relative',
        borderTopRightRadius: '8px',
        borderBottomRightRadius: '8px'
      }}>
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => {
              setActiveTab(tab.id)
              const { toggleLeftPanel } = useAgentStore.getState()
              if (leftPanelCollapsed) {
                toggleLeftPanel()
              }
            }}
            style={{
              width: '36px',
              height: '36px',
              background: activeTab === tab.id ? '#F1F5F9' : 'transparent',
              border: 'none',
              cursor: 'pointer',
              borderRadius: '6px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: activeTab === tab.id ? '#111827' : '#6B7280',
              transition: 'all 0.15s ease'
            }}
            onMouseEnter={(e) => {
              if (activeTab !== tab.id) {
                e.currentTarget.style.background = '#F8FAFC'
              }
            }}
            onMouseLeave={(e) => {
              if (activeTab !== tab.id) {
                e.currentTarget.style.background = 'transparent'
              }
            }}
          >
            {tab.id === 'connectors' && <Globe size={16} />}
            {tab.id === 'nodes' && <Zap size={16} />}
          </button>
        ))}
      </div>
    )
  }

  const activeTabData = tabs.find(tab => tab.id === activeTab)
  const filteredItems = activeTabData ? filterItems(activeTabData.items) : []

  return (
    <div style={{
      width: '280px',
      borderRight: '1px solid #E5E7EB',
      backgroundColor: '#FFFFFF',
      display: 'flex',
      flexDirection: 'column',
      borderTopRightRadius: '8px',
      borderBottomRightRadius: '8px'
    }}>
      {/* Header */}
      <div style={{
        padding: '12px 16px',
        borderBottom: '1px solid #E5E7EB',
        position: 'relative'
      }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '12px' }}>
          <h2 style={{
            fontWeight: 600,
            color: '#111827',
            fontSize: '14px',
            margin: 0
          }}>Setup</h2>
          <button
            onClick={() => {
              const { toggleLeftPanel } = useAgentStore.getState()
              toggleLeftPanel()
            }}
            style={{
              padding: '4px 6px',
              background: 'transparent',
              border: '1px solid #E5E7EB',
              cursor: 'pointer',
              borderRadius: '4px',
              color: '#6B7280',
              fontSize: '16px',
              lineHeight: 1,
              fontWeight: 400,
              marginTop: '-2px'
            }}
            title="Collapse panel"
          >
            ‹
          </button>
        </div>
        
        {/* Search */}
        <div style={{
          position: 'relative',
          marginBottom: '12px'
        }}>
          <Search size={16} style={{
            position: 'absolute',
            left: '12px',
            top: '50%',
            transform: 'translateY(-50%)',
            color: '#9CA3AF'
          }} />
          <input
            type="text"
            placeholder="Search components..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              width: '100%',
              paddingLeft: '40px',
              paddingRight: '16px',
              paddingTop: '8px',
              paddingBottom: '8px',
              fontSize: '14px',
              border: '1px solid #E5E7EB',
              borderRadius: '6px',
              backgroundColor: '#FFFFFF',
              outline: 'none'
            }}
            onFocus={(e) => {
              e.target.style.borderColor = '#3B82F6'
              e.target.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.12)'
            }}
            onBlur={(e) => {
              e.target.style.borderColor = '#E5E7EB'
              e.target.style.boxShadow = 'none'
            }}
          />
        </div>

        {/* Tabs */}
        <div style={{
          display: 'flex',
          borderRadius: '6px',
          backgroundColor: '#F8FAFC',
          padding: '2px'
        }}>
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                flex: 1,
                padding: '6px 8px',
                fontSize: '12px',
                fontWeight: 500,
                borderRadius: '4px',
                border: 'none',
                cursor: 'pointer',
                transition: 'all 0.15s',
                backgroundColor: activeTab === tab.id ? '#FFFFFF' : 'transparent',
                color: activeTab === tab.id ? '#111827' : '#6B7280',
                boxShadow: activeTab === tab.id ? '0 1px 2px rgba(0,0,0,0.05)' : 'none'
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div style={{
        flex: 1,
        overflowY: 'auto',
        padding: '12px'
      }}>
        {filteredItems.length > 0 ? (
          filteredItems.map((item) => (
            <PaletteItemCard
              key={item.id}
              item={item}
              onDragStart={handleDragStart}
            />
          ))
        ) : (
          <div style={{
            textAlign: 'center',
            paddingTop: '32px',
            paddingBottom: '32px',
            color: '#9CA3AF'
          }}>
            <Search size={32} style={{ margin: '0 auto 8px', opacity: 0.5 }} />
            <p style={{ fontSize: '14px' }}>No components found</p>
          </div>
        )}
      </div>

      {/* User Info Section */}
      <div style={{
        borderTop: '1px solid #E5E7EB',
        padding: '12px 16px',
        background: '#F9FAFB'
      }}>
        <div style={{ marginBottom: 6 }}>
          <input
            defaultValue="John Doe"
            style={{
              fontSize: 14,
              fontWeight: 500,
              color: '#111827',
              background: 'transparent',
              border: 'none',
              outline: 'none',
              padding: '2px 0',
              width: '100%',
              fontFamily: 'Inter, system-ui, sans-serif'
            }}
            onFocus={(e) => {
              e.target.style.background = '#FFFFFF'
              e.target.style.borderRadius = '4px'
              e.target.style.padding = '2px 6px'
            }}
            onBlur={(e) => {
              e.target.style.background = 'transparent'
              e.target.style.padding = '2px 0'
            }}
          />
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
          <span style={{
            fontSize: 10,
            color: '#6B7280',
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            fontWeight: 500
          }}>
            Plan
          </span>
          <span style={{
            fontSize: 10,
            padding: '2px 6px',
            borderRadius: 3,
            background: '#DBEAFE',
            color: '#1E40AF',
            fontFamily: 'JetBrains Mono, ui-monospace, SFMono-Regular, Menlo, monospace',
            textTransform: 'lowercase',
            fontWeight: 500
          }}>
            pro
          </span>
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{
            fontSize: 10,
            color: '#6B7280',
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            fontWeight: 500
          }}>
            Agents
          </span>
          <span style={{
            fontSize: 10,
            color: '#9CA3AF',
            fontFamily: 'JetBrains Mono, ui-monospace, SFMono-Regular, Menlo, monospace'
          }}>
            12
          </span>
        </div>
      </div>
    </div>
  )
}
