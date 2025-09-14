'use client'

import { 
  Mail, 
  MessageSquare, 
  FileText, 
  Table, 
  Globe, 
  Folder, 
  Settings,
  Bot,
  CreditCard,
  Store,
  Webhook,
  Users,
  Calendar,
  Video,
  BarChart3,
  Palette,
  HeadphonesIcon,
  TrendingUp,
  ShoppingCart,
  Building2
} from 'lucide-react'
import type { ConnectorCell } from '@/lib/types'

const connectorIconMap = {
  // Core Communication & Productivity
  gmail: Mail,
  slack: MessageSquare,
  notion: FileText,
  googlesheets: Table,
  googledrive: Folder,
  
  // Developer & Project Management
  github: Settings,
  jira: Settings,
  linear: Settings,
  asana: Settings,
  
  // CRM & Sales
  hubspot: Building2,
  salesforce: Building2,
  pipedrive: TrendingUp,
  
  // Communication & Meetings
  zoom: Video,
  calendly: Calendar,
  googlecalendar: Calendar,
  
  // Finance & Payments
  stripe: CreditCard,
  quickbooks: Settings,
  
  // E-commerce
  shopify: ShoppingCart,
  
  // Analytics & Data
  googleanalytics: BarChart3,
  mixpanel: BarChart3,
  
  // Design & Creative
  figma: Palette,
  canva: Palette,
  
  // Support & Customer Service
  zendesk: HeadphonesIcon,
  intercom: MessageSquare,
  
  // Marketing
  mailchimp: Mail,
  linkedin: Users,
  
  // Custom Connectors
  'agent-api': Bot,
  marketplace: Store,
  
  // Generic Fallbacks
  http: Globe,
  webhook: Webhook,
  custom: Settings,
} as const

interface Props {
  cell: ConnectorCell
  isSelected: boolean
  onSelect: () => void
}

export function ConnectorCellView({ cell, isSelected, onSelect }: Props) {
  const Icon = (connectorIconMap as any)[cell.connector] ?? Settings
  const entries = Object.entries(cell.config || {})

  return (
    <div
      onClick={onSelect}
      style={{
        width: 120,
        height: 90,
        padding: '8px 8px 12px 8px',
        borderRadius: 8,
        border: `1px solid ${isSelected ? '#8B5CF6' : '#E5E7EB'}`,
        background: '#FFFFFF',
        transition: 'all .15s ease',
        boxShadow: isSelected
          ? '0 0 0 3px rgba(139, 92, 246, 0.1)'
          : 'none',
        cursor: 'pointer',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
      }}
    >
      {/* Header */}
      <div style={{ marginBottom: 4 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 4 }}>
          <div
            style={{
              width: 24,
              height: 24,
              borderRadius: 6,
              background: '#F1F5F9',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Icon size={14} color="#111827" />
          </div>
        </div>

        {/* Name */}
        <div style={{ 
          textAlign: 'center',
          fontSize: 11,
          fontWeight: 500,
          color: '#0F172A',
          lineHeight: 1.2,
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
          marginBottom: 2
        }}>
          {cell.name?.trim() || cell.connector}
        </div>

        {/* Note in header */}
        {cell.note && (
          <div
            style={{
              fontSize: 8,
              color: '#64748B',
              background: '#F9FAFB',
              border: '1px solid #E5E7EB',
              borderRadius: 3,
              padding: '2px 4px',
              marginBottom: 2,
              textAlign: 'center',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap'
            }}
          >
            {cell.note}
          </div>
        )}

        {/* Status indicator */}
        <div style={{ 
          textAlign: 'center',
          fontSize: 8,
          color: entries.length > 0 ? '#10B981' : '#9CA3AF',
          fontWeight: 500,
          textTransform: 'uppercase',
          letterSpacing: '0.05em'
        }}>
          {entries.length > 0 ? 'Configured' : 'Setup needed'}
        </div>
      </div>
    </div>
  )
}
