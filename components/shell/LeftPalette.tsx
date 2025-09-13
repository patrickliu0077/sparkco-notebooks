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
        padding: '12px',
        borderRadius: '8px',
        border: '1px solid #E5E7EB',
        backgroundColor: '#FFFFFF',
        cursor: 'grab',
        transition: 'all 0.2s',
        marginBottom: '8px'
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.backgroundColor = '#F8FAFC'
        e.currentTarget.style.borderColor = '#E5E7EB'
        e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.06)'
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.backgroundColor = '#FFFFFF'
        e.currentTarget.style.borderColor = '#E5E7EB'
        e.currentTarget.style.boxShadow = 'none'
      }}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
        <div style={{
          width: '32px',
          height: '32px',
          borderRadius: '6px',
          backgroundColor: '#F1F5F9',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0
        }}>
          <IconComponent size={16} color="#111827" />
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <h4 style={{
            fontWeight: 500,
            fontSize: '14px',
            color: '#0F172A',
            margin: '0 0 4px 0'
          }}>
            {item.label}
          </h4>
          <p style={{
            fontSize: '12px',
            color: '#475569',
            margin: 0,
            lineHeight: 1.4
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
        position: 'relative'
      }}>
        <button
          onClick={() => {
            const { toggleLeftPanel } = useAgentStore.getState()
            toggleLeftPanel()
          }}
          style={{
            position: 'absolute',
            top: '140px',
            right: '6px',
            padding: '4px 6px',
            background: 'transparent',
            border: '1px solid #E5E7EB',
            cursor: 'pointer',
            borderRadius: '4px',
            color: '#6B7280',
            fontSize: '16px',
            lineHeight: 1,
            fontWeight: 400
          }}
          title="Expand panel"
        >
          ›
        </button>
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
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
    </div>
  )
}
