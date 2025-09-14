'use client'

import { useState } from 'react'
import { usePathname } from 'next/navigation'
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
  // Core Communication & Productivity (Composio)
  {
    id: 'gmail',
    type: 'connector',
    label: 'Gmail',
    description: 'Email operations with managed auth',
    icon: 'Mail',
    data: { connector: 'gmail' }
  },
  {
    id: 'slack',
    type: 'connector', 
    label: 'Slack',
    description: 'Team messaging and notifications',
    icon: 'MessageSquare',
    data: { connector: 'slack' }
  },
  {
    id: 'notion',
    type: 'connector',
    label: 'Notion',
    description: 'Document and knowledge management',
    icon: 'FileText',
    data: { connector: 'notion' }
  },
  {
    id: 'googlesheets',
    type: 'connector',
    label: 'Google Sheets',
    description: 'Spreadsheet data and collaboration',
    icon: 'Table',
    data: { connector: 'googlesheets' }
  },
  {
    id: 'googledrive',
    type: 'connector',
    label: 'Google Drive',
    description: 'Cloud file storage and sharing',
    icon: 'Folder',
    data: { connector: 'googledrive' }
  },
  
  // Developer & Project Management (Composio)
  {
    id: 'github',
    type: 'connector',
    label: 'GitHub',
    description: 'Code repositories and collaboration',
    icon: 'Settings',
    data: { connector: 'github' }
  },
  {
    id: 'jira',
    type: 'connector',
    label: 'Jira',
    description: 'Issue tracking and project management',
    icon: 'Settings',
    data: { connector: 'jira' }
  },
  {
    id: 'linear',
    type: 'connector',
    label: 'Linear',
    description: 'Modern issue tracking and planning',
    icon: 'Settings',
    data: { connector: 'linear' }
  },
  {
    id: 'asana',
    type: 'connector',
    label: 'Asana',
    description: 'Team task and project organization',
    icon: 'Settings',
    data: { connector: 'asana' }
  },
  
  // CRM & Sales (Composio)
  {
    id: 'hubspot',
    type: 'connector',
    label: 'HubSpot',
    description: 'CRM and marketing automation',
    icon: 'Settings',
    data: { connector: 'hubspot' }
  },
  {
    id: 'salesforce',
    type: 'connector',
    label: 'Salesforce',
    description: 'Enterprise CRM and sales',
    icon: 'Settings',
    data: { connector: 'salesforce' }
  },
  {
    id: 'pipedrive',
    type: 'connector',
    label: 'Pipedrive',
    description: 'Sales pipeline management',
    icon: 'Settings',
    data: { connector: 'pipedrive' }
  },
  
  // Communication & Meetings (Composio)
  {
    id: 'zoom',
    type: 'connector',
    label: 'Zoom',
    description: 'Video conferencing and meetings',
    icon: 'Settings',
    data: { connector: 'zoom' }
  },
  {
    id: 'calendly',
    type: 'connector',
    label: 'Calendly',
    description: 'Appointment scheduling automation',
    icon: 'Settings',
    data: { connector: 'calendly' }
  },
  {
    id: 'googlecalendar',
    type: 'connector',
    label: 'Google Calendar',
    description: 'Calendar and event management',
    icon: 'Settings',
    data: { connector: 'googlecalendar' }
  },
  
  // Finance & Payments (Composio)
  {
    id: 'stripe',
    type: 'connector',
    label: 'Stripe',
    description: 'Payment processing and billing',
    icon: 'CreditCard',
    data: { connector: 'stripe' }
  },
  {
    id: 'quickbooks',
    type: 'connector',
    label: 'QuickBooks',
    description: 'Accounting and financial management',
    icon: 'Settings',
    data: { connector: 'quickbooks' }
  },
  
  // E-commerce (Composio)
  {
    id: 'shopify',
    type: 'connector',
    label: 'Shopify',
    description: 'E-commerce store management',
    icon: 'Store',
    data: { connector: 'shopify' }
  },
  
  // Analytics & Data (Composio)
  {
    id: 'googleanalytics',
    type: 'connector',
    label: 'Google Analytics',
    description: 'Website traffic and user analytics',
    icon: 'Settings',
    data: { connector: 'googleanalytics' }
  },
  {
    id: 'mixpanel',
    type: 'connector',
    label: 'Mixpanel',
    description: 'Product analytics and user tracking',
    icon: 'Settings',
    data: { connector: 'mixpanel' }
  },
  
  // Design & Creative (Composio)
  {
    id: 'figma',
    type: 'connector',
    label: 'Figma',
    description: 'Design collaboration and prototyping',
    icon: 'Settings',
    data: { connector: 'figma' }
  },
  {
    id: 'canva',
    type: 'connector',
    label: 'Canva',
    description: 'Graphic design and content creation',
    icon: 'Settings',
    data: { connector: 'canva' }
  },
  
  // Support & Customer Service (Composio)
  {
    id: 'zendesk',
    type: 'connector',
    label: 'Zendesk',
    description: 'Customer support and ticketing',
    icon: 'Settings',
    data: { connector: 'zendesk' }
  },
  {
    id: 'intercom',
    type: 'connector',
    label: 'Intercom',
    description: 'Customer messaging and engagement',
    icon: 'MessageSquare',
    data: { connector: 'intercom' }
  },
  
  // Marketing (Composio)
  {
    id: 'mailchimp',
    type: 'connector',
    label: 'Mailchimp',
    description: 'Email marketing and automation',
    icon: 'Mail',
    data: { connector: 'mailchimp' }
  },
  {
    id: 'linkedin',
    type: 'connector',
    label: 'LinkedIn',
    description: 'Professional networking and outreach',
    icon: 'Settings',
    data: { connector: 'linkedin' }
  },
  
  // Custom Connectors (Keep existing)
  {
    id: 'agent-api',
    type: 'connector',
    label: 'Agent API',
    description: 'Connect to other AI agents',
    icon: 'Bot',
    data: { connector: 'agent-api' }
  },
  {
    id: 'marketplace',
    type: 'connector',
    label: 'Marketplace',
    description: 'Agent marketplace integration',
    icon: 'Store',
    data: { connector: 'marketplace' }
  },
  
  // Generic Fallbacks
  {
    id: 'http',
    type: 'connector',
    label: 'HTTP API',
    description: 'Connect to any custom HTTP API',
    icon: 'Globe',
    data: { connector: 'http' }
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

const nodeItems: PaletteItem[] = []

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
  const pathname = usePathname()
  const leftPanelCollapsed = useLeftPanelCollapsed()
  const [searchQuery, setSearchQuery] = useState('')

  // Hide on interact page
  if (pathname === '/interact') {
    return null
  }

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

  if (leftPanelCollapsed) {
    return (
      <div style={{
        width: '56px',
        borderRight: '1px solid #E5E7EB',
        backgroundColor: '#FFFFFF',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        paddingTop: '16px',
        paddingBottom: '16px',
        gap: '8px',
        position: 'relative',
        borderTopRightRadius: '8px',
        borderBottomRightRadius: '8px'
      }}>
        {/* Expand button */}
        <button
          onClick={() => {
            const { toggleLeftPanel } = useAgentStore.getState()
            if (leftPanelCollapsed) {
              toggleLeftPanel()
            }
          }}
          style={{
            width: '40px',
            height: '40px',
            background: 'linear-gradient(135deg, #F1F5F9 0%, #E2E8F0 100%)',
            border: '1px solid #E5E7EB',
            cursor: 'pointer',
            borderRadius: '8px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#111827',
            transition: 'all 0.2s ease',
            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'linear-gradient(135deg, #E2E8F0 0%, #CBD5E1 100%)'
            e.currentTarget.style.transform = 'scale(1.05)'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'linear-gradient(135deg, #F1F5F9 0%, #E2E8F0 100%)'
            e.currentTarget.style.transform = 'scale(1)'
          }}
          title="Expand Connector Setup"
        >
          <Globe size={18} />
        </button>

        {/* Connector count indicator */}
        <div style={{
          width: '32px',
          height: '20px',
          background: '#F3F4F6',
          borderRadius: '10px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '10px',
          fontWeight: 600,
          color: '#6B7280',
          border: '1px solid #E5E7EB'
        }}>
          {connectorItems.length}
        </div>

        {/* Quick connector icons */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '6px',
          marginTop: '8px',
          marginBottom: '16px'
        }}>
          {connectorItems.slice(0, 4).map((item) => {
            const IconComponent = iconMap[item.icon as keyof typeof iconMap]
            return (
              <div
                key={item.id}
                style={{
                  width: '28px',
                  height: '28px',
                  background: '#F8FAFC',
                  border: '1px solid #E5E7EB',
                  borderRadius: '6px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'all 0.15s ease'
                }}
                title={item.label}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = '#F1F5F9'
                  e.currentTarget.style.borderColor = '#D1D5DB'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = '#F8FAFC'
                  e.currentTarget.style.borderColor = '#E5E7EB'
                }}
              >
                <IconComponent size={12} color="#6B7280" />
              </div>
            )
          })}
          
          {connectorItems.length > 4 && (
            <div style={{
              width: '28px',
              height: '28px',
              background: '#F3F4F6',
              border: '1px solid #E5E7EB',
              borderRadius: '6px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '10px',
              fontWeight: 600,
              color: '#9CA3AF'
            }}>
              +{connectorItems.length - 4}
            </div>
          )}
        </div>

        {/* User info in collapsed view */}
        <div style={{
          marginTop: 'auto',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '8px'
        }}>
          {/* User avatar */}
          <div style={{
            width: '28px',
            height: '28px',
            borderRadius: '50%',
            background: '#F1F5F9',
            border: '1px solid #E5E7EB',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#6B7280',
            fontSize: '10px',
            fontWeight: 500,
            fontFamily: 'Inter, system-ui, sans-serif'
          }}>
            JD
          </div>
          
          {/* Plan indicator */}
          <div style={{
            width: '20px',
            height: '8px',
            background: '#E5E7EB',
            borderRadius: '4px',
            position: 'relative'
          }}>
            <div style={{
              position: 'absolute',
              left: 0,
              top: 0,
              width: '60%',
              height: '100%',
              background: '#3B82F6',
              borderRadius: '4px'
            }} />
          </div>
          
          {/* Agent count */}
          <div style={{
            fontSize: '9px',
            color: '#9CA3AF',
            fontWeight: 500
          }}>
            12
          </div>
        </div>
      </div>
    )
  }

  const filteredItems = filterItems(connectorItems)

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
          }}>Connector Setup</h2>
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
