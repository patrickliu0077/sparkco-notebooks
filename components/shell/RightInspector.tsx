'use client'

import { useAgentStore, useSelectedCell } from "@/lib/store"
import type { Cell, ConnectorCell, NodeCell, PromptCell } from "@/lib/types"
import {
  X,
  Settings,
  FileText,
  Zap,
  Wrench,
  GitBranch,
  RotateCcw,
  Database,
  Search,
  ArrowRight,
  Mail,
  MessageSquare,
  Table,
  Folder,
  Copy,
  Trash2
} from "lucide-react"

// Icon maps
const connectorIcons = {
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
  hubspot: Settings,
  salesforce: Settings,
  pipedrive: Settings,
  
  // Communication & Meetings
  zoom: Settings,
  calendly: Settings,
  googlecalendar: Settings,
  
  // Finance & Payments
  stripe: Settings,
  quickbooks: Settings,
  
  // E-commerce
  shopify: Settings,
  
  // Analytics & Data
  googleanalytics: Settings,
  mixpanel: Settings,
  
  // Design & Creative
  figma: Settings,
  canva: Settings,
  
  // Support & Customer Service
  zendesk: Settings,
  intercom: MessageSquare,
  
  // Marketing
  mailchimp: Mail,
  linkedin: Settings,
  
  // Custom Connectors
  'agent-api': Settings,
  marketplace: Settings,
  
  // Generic Fallbacks
  http: Search,
  webhook: Settings,
  custom: Settings
}

const nodeIcons = {
  llm: Zap,
  tool: Wrench,
  router: GitBranch,
  loop: RotateCcw,
  memory: Database,
  retrieve: Search,
  output: ArrowRight,
  input: ArrowRight
}

// Small UI primitives (inline styles to avoid Tailwind custom token issues)
const iconWrapper: React.CSSProperties = {
  width: 32,
  height: 32,
  borderRadius: 8,
  background: '#F1F5F9',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center'
}

const actionButton: React.CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: 6,
  padding: '6px 10px',
  borderRadius: 8,
  border: 'none',
  background: 'transparent',
  cursor: 'pointer',
  fontSize: 12
}

function Field({
  label,
  children,
  description
}: {
  label: string
  children: React.ReactNode
  description?: string
}) {
  return (
    <div style={{ marginBottom: 16, paddingBottom: 12, borderBottom: '1px solid #F3F4F6' }}>
      <label style={{ display: 'block', fontSize: 11, fontWeight: 500, color: '#6B7280', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
        {label}
      </label>
      {children}
      {description ? (
        <div style={{ marginTop: 4, fontSize: 11, color: '#9CA3AF' }}>{description}</div>
      ) : null}
    </div>
  )
}

function TextInput({
  value,
  onChange,
  placeholder,
  multiline,
  rows = 3
}: {
  value: string
  onChange: (v: string) => void
  placeholder?: string
  multiline?: boolean
  rows?: number
}) {
  const baseStyle: React.CSSProperties = {
    width: '100%',
    fontSize: 13,
    padding: '8px 10px',
    border: '1px solid #E5E7EB',
    borderRadius: 8,
    background: '#FFFFFF',
    outline: 'none'
  }
  if (multiline) {
    return (
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        rows={rows}
        style={{ ...baseStyle, resize: 'vertical' }}
        onFocus={(e) => {
          e.currentTarget.style.borderColor = '#3B82F6'
          e.currentTarget.style.boxShadow = '0 0 0 3px rgba(59,130,246,0.12)'
        }}
        onBlur={(e) => {
          e.currentTarget.style.borderColor = '#E5E7EB'
          e.currentTarget.style.boxShadow = 'none'
        }}
      />
    )
  }
  return (
    <input
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      style={baseStyle}
      onFocus={(e) => {
        e.currentTarget.style.borderColor = '#3B82F6'
        e.currentTarget.style.boxShadow = '0 0 0 3px rgba(59,130,246,0.12)'
      }}
      onBlur={(e) => {
        e.currentTarget.style.borderColor = '#E5E7EB'
        e.currentTarget.style.boxShadow = 'none'
      }}
    />
  )
}

function Select({
  value,
  onChange,
  options,
  grouped = false
}: {
  value: string
  onChange: (v: string) => void
  options: { value: string; label: string; group?: string }[]
  grouped?: boolean
}) {
  if (grouped) {
    const groupedOptions = options.reduce((acc, option) => {
      const group = option.group || 'Other'
      if (!acc[group]) acc[group] = []
      acc[group].push(option)
      return acc
    }, {} as Record<string, typeof options>)

    return (
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        style={{
          width: '100%',
          fontSize: 13,
          padding: '8px 10px',
          border: '1px solid #E5E7EB',
          borderRadius: 8,
          background: '#FFFFFF',
          outline: 'none',
          cursor: 'pointer'
        }}
        onFocus={(e) => {
          e.currentTarget.style.borderColor = '#3B82F6'
          ;(e.currentTarget as HTMLSelectElement).style.boxShadow = '0 0 0 3px rgba(59,130,246,0.12)'
        }}
        onBlur={(e) => {
          e.currentTarget.style.borderColor = '#E5E7EB'
          ;(e.currentTarget as HTMLSelectElement).style.boxShadow = 'none'
        }}
      >
        {Object.entries(groupedOptions).map(([group, groupOptions]) => (
          <optgroup key={group} label={group}>
            {groupOptions.map((op) => (
              <option key={op.value} value={op.value}>
                {op.label}
              </option>
            ))}
          </optgroup>
        ))}
      </select>
    )
  }

  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      style={{
        width: '100%',
        fontSize: 13,
        padding: '8px 10px',
        border: '1px solid #E5E7EB',
        borderRadius: 8,
        background: '#FFFFFF',
        outline: 'none',
        cursor: 'pointer'
      }}
      onFocus={(e) => {
        e.currentTarget.style.borderColor = '#3B82F6'
        ;(e.currentTarget as HTMLSelectElement).style.boxShadow = '0 0 0 3px rgba(59,130,246,0.12)'
      }}
      onBlur={(e) => {
        e.currentTarget.style.borderColor = '#E5E7EB'
        ;(e.currentTarget as HTMLSelectElement).style.boxShadow = 'none'
      }}
    >
      {options.map((op) => (
        <option key={op.value} value={op.value}>
          {op.label}
        </option>
      ))}
    </select>
  )
}

function PromptInspector({ cell }: { cell: PromptCell }) {
  const { updateCell } = useAgentStore()
  const patch = (u: Partial<PromptCell>) => updateCell(cell.id, u)

  return (
    <div>
      <Field label="Name">
        <TextInput value={cell.name || ''} onChange={(v) => patch({ name: v })} placeholder="Instructions name..." />
      </Field>
      <Field label="Content" description="The instructions text that will be used">
        <TextInput value={cell.content} onChange={(v) => patch({ content: v })} placeholder="Enter your instructions..." multiline rows={6} />
      </Field>
      <Field label="Tags" description="Comma-separated tags for organization">
        <TextInput
          value={cell.tags?.join(', ') || ''}
          onChange={(v) => {
            const tags = v.split(',').map(t => t.trim()).filter(Boolean)
            patch({ tags })
          }}
          placeholder="tag1, tag2, tag3"
        />
      </Field>
      <Field label="Notes">
        <TextInput value={cell.note || ''} onChange={(v) => patch({ note: v })} placeholder="Additional notes..." multiline rows={2} />
      </Field>
    </div>
  )
}

function ConnectorInspector({ cell }: { cell: ConnectorCell }) {
  const { updateCell } = useAgentStore()
  const patch = (u: Partial<ConnectorCell>) => updateCell(cell.id, u)

  const connectorOptions = [
    // Core Communication & Productivity (Composio)
    { value: 'gmail', label: 'Gmail' },
    { value: 'slack', label: 'Slack' },
    { value: 'notion', label: 'Notion' },
    { value: 'googlesheets', label: 'Google Sheets' },
    { value: 'googledrive', label: 'Google Drive' },
    
    // Developer & Project Management (Composio)
    { value: 'github', label: 'GitHub' },
    { value: 'jira', label: 'Jira' },
    { value: 'linear', label: 'Linear' },
    { value: 'asana', label: 'Asana' },
    
    // CRM & Sales (Composio)
    { value: 'hubspot', label: 'HubSpot' },
    { value: 'salesforce', label: 'Salesforce' },
    { value: 'pipedrive', label: 'Pipedrive' },
    
    // Communication & Meetings (Composio)
    { value: 'zoom', label: 'Zoom' },
    { value: 'calendly', label: 'Calendly' },
    { value: 'googlecalendar', label: 'Google Calendar' },
    
    // Finance & Payments (Composio)
    { value: 'stripe', label: 'Stripe' },
    { value: 'quickbooks', label: 'QuickBooks' },
    
    // E-commerce (Composio)
    { value: 'shopify', label: 'Shopify' },
    
    // Analytics & Data (Composio)
    { value: 'googleanalytics', label: 'Google Analytics' },
    { value: 'mixpanel', label: 'Mixpanel' },
    
    // Design & Creative (Composio)
    { value: 'figma', label: 'Figma' },
    { value: 'canva', label: 'Canva' },
    
    // Support & Customer Service (Composio)
    { value: 'zendesk', label: 'Zendesk' },
    { value: 'intercom', label: 'Intercom' },
    
    // Marketing (Composio)
    { value: 'mailchimp', label: 'Mailchimp' },
    { value: 'linkedin', label: 'LinkedIn' },
    
    // Custom Connectors
    { value: 'agent-api', label: 'Agent API' },
    { value: 'marketplace', label: 'Marketplace' },
    
    // Generic Fallbacks
    { value: 'http', label: 'HTTP API' },
    { value: 'webhook', label: 'Webhook' },
    { value: 'custom', label: 'Custom' }
  ]

  return (
    <div>
      <Field label="Name">
        <TextInput value={cell.name || ''} onChange={(v) => patch({ name: v })} placeholder="Connector name..." />
      </Field>
      <Field label="Connector Type">
        <Select value={cell.connector} onChange={(v) => patch({ connector: v as any })} options={connectorOptions.map(opt => ({
          ...opt,
          group: opt.value === 'gmail' || opt.value === 'slack' || opt.value === 'notion' || opt.value === 'googlesheets' || opt.value === 'googledrive' ? 'Communication & Productivity' :
                 opt.value === 'github' || opt.value === 'jira' || opt.value === 'linear' || opt.value === 'asana' ? 'Developer & Project Management' :
                 opt.value === 'hubspot' || opt.value === 'salesforce' || opt.value === 'pipedrive' ? 'CRM & Sales' :
                 opt.value === 'zoom' || opt.value === 'calendly' || opt.value === 'googlecalendar' ? 'Meetings & Scheduling' :
                 opt.value === 'stripe' || opt.value === 'quickbooks' ? 'Finance & Payments' :
                 opt.value === 'shopify' ? 'E-commerce' :
                 opt.value === 'googleanalytics' || opt.value === 'mixpanel' ? 'Analytics & Data' :
                 opt.value === 'figma' || opt.value === 'canva' ? 'Design & Creative' :
                 opt.value === 'zendesk' || opt.value === 'intercom' ? 'Support & Customer Service' :
                 opt.value === 'mailchimp' || opt.value === 'linkedin' ? 'Marketing & Social Media' :
                 opt.value === 'agent-api' || opt.value === 'marketplace' ? 'Custom Connectors' : 'Generic'
        }))} grouped={true} />
      </Field>
      <Field label="Description">
        <TextInput value={cell.description || ''} onChange={(v) => patch({ description: v })} placeholder="What does this connector do?" multiline rows={2} />
      </Field>
      <Field label="Configuration" description="Key-value pairs for connector setup">
        <div>
          {Object.entries(cell.config).map(([key, value]) => (
            <div key={key} style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
              <input
                value={key}
                onChange={(e) => {
                  const newConfig = { ...cell.config }
                  const oldVal = newConfig[key]
                  delete newConfig[key]
                  newConfig[e.target.value] = oldVal
                  patch({ config: newConfig })
                }}
                placeholder="Key"
                style={{ flex: 1, fontSize: 13, padding: '8px 10px', border: '1px solid #E5E7EB', borderRadius: 8 }}
              />
              <input
                value={value}
                onChange={(e) => {
                  const newConfig = { ...cell.config, [key]: e.target.value }
                  patch({ config: newConfig })
                }}
                placeholder="Value"
                style={{ flex: 1, fontSize: 13, padding: '8px 10px', border: '1px solid #E5E7EB', borderRadius: 8 }}
              />
              <button
                onClick={() => {
                  const newConfig = { ...cell.config }
                  delete newConfig[key]
                  patch({ config: newConfig })
                }}
                style={{ ...actionButton }}
                title="Remove"
              >
                <X size={14} />
              </button>
            </div>
          ))}
          <button
            onClick={() => patch({ config: { ...cell.config, '': '' } })}
            style={{
              width: '100%',
              padding: '8px 10px',
              borderRadius: 8,
              border: '1px solid #E5E7EB',
              background: '#FFFFFF',
              cursor: 'pointer',
              fontSize: 13,
              fontWeight: 500
            }}
          >
            Add Configuration
          </button>
        </div>
      </Field>
      <Field label="Notes">
        <TextInput value={cell.note || ''} onChange={(v) => patch({ note: v })} placeholder="Additional notes..." multiline rows={2} />
      </Field>
    </div>
  )
}

function NodeInspector({ cell }: { cell: NodeCell }) {
  const { updateCell } = useAgentStore()
  const patch = (u: Partial<NodeCell>) => updateCell(cell.id, u)

  const nodeOptions = [
    { value: 'llm', label: 'LLM' },
    { value: 'tool', label: 'Tool' },
    { value: 'router', label: 'Router' },
    { value: 'loop', label: 'Loop' },
    { value: 'memory', label: 'Memory' },
    { value: 'retrieve', label: 'Retrieve' },
    { value: 'output', label: 'Output' },
    { value: 'input', label: 'Input' }
  ]

  return (
    <div>
      <Field label="Name">
        <TextInput value={cell.name || ''} onChange={(v) => patch({ name: v })} placeholder="Node name..." />
      </Field>
      <Field label="Node Type">
        <Select value={cell.nodeType} onChange={(v) => patch({ nodeType: v as any })} options={nodeOptions} />
      </Field>
      <Field label="Description">
        <TextInput value={cell.description || ''} onChange={(v) => patch({ description: v })} placeholder="What does this node do?" multiline rows={2} />
      </Field>
      <Field label="Parameters" description="Configuration parameters for this node">
        <div>
          {Object.entries(cell.params).map(([key, value]) => (
            <div key={key} style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
              <input
                value={key}
                onChange={(e) => {
                  const newParams = { ...cell.params }
                  const oldVal = newParams[key]
                  delete newParams[key]
                  newParams[e.target.value] = oldVal
                  patch({ params: newParams })
                }}
                placeholder="Parameter name"
                style={{ flex: 1, fontSize: 13, padding: '8px 10px', border: '1px solid #E5E7EB', borderRadius: 8 }}
              />
              <input
                value={typeof value === 'string' ? value : JSON.stringify(value)}
                onChange={(e) => {
                  try {
                    const parsed = JSON.parse(e.target.value)
                    patch({ params: { ...cell.params, [key]: parsed } })
                  } catch {
                    patch({ params: { ...cell.params, [key]: e.target.value } })
                  }
                }}
                placeholder="Value"
                style={{ flex: 1, fontSize: 13, padding: '8px 10px', border: '1px solid #E5E7EB', borderRadius: 8 }}
              />
              <button
                onClick={() => {
                  const newParams = { ...cell.params }
                  delete newParams[key]
                  patch({ params: newParams })
                }}
                style={{ ...actionButton }}
                title="Remove"
              >
                <X size={14} />
              </button>
            </div>
          ))}
          <button
            onClick={() => patch({ params: { ...cell.params, '': '' } })}
            style={{
              width: '100%',
              padding: '8px 10px',
              borderRadius: 8,
              border: '1px solid #E5E7EB',
              background: '#FFFFFF',
              cursor: 'pointer',
              fontSize: 13,
              fontWeight: 500
            }}
          >
            Add Parameter
          </button>
        </div>
      </Field>
      <Field label="Notes">
        <TextInput value={cell.note || ''} onChange={(v) => patch({ note: v })} placeholder="Additional notes..." multiline rows={2} />
      </Field>
    </div>
  )
}

export function RightInspector() {
  const selectedCell = useSelectedCell()
  const { selectCell, deleteCell, duplicateCell } = useAgentStore()

  if (!selectedCell) {
    return (
      <div style={{ width: 320, borderLeft: '1px solid #E5E7EB', background: '#F9FAFB', display: 'flex', flexDirection: 'column', borderTopLeftRadius: '8px', borderBottomLeftRadius: '8px' }}>
        <div style={{ padding: 16, borderBottom: '1px solid #E5E7EB' }}>
          <h2 style={{ fontWeight: 600, color: '#0F172A', margin: 0, fontSize: '16px' }}>Inspector</h2>
        </div>
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 32 }}>
          <div style={{ textAlign: 'center', color: '#64748B' }}>
            <Settings size={48} style={{ margin: '0 auto 12px', opacity: 0.5 }} />
            <p style={{ fontSize: 14 }}>Select a cell to edit its properties</p>
          </div>
        </div>
      </div>
    )
  }

  const getCellIcon = (cell: Cell) => {
    if (cell.kind === 'prompt') return FileText
    if (cell.kind === 'connector') return connectorIcons[cell.connector] || Settings
    if (cell.kind === 'node') return nodeIcons[cell.nodeType] || Zap
    return Settings
  }

  const IconComponent = getCellIcon(selectedCell)

  return (
    <div style={{ width: 320, borderLeft: '1px solid #E5E7EB', background: '#F9FAFB', display: 'flex', flexDirection: 'column', borderTopLeftRadius: '8px', borderBottomLeftRadius: '8px' }}>
      {/* Header */}
      <div style={{ padding: 16, borderBottom: '1px solid #E5E7EB' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
          <h2 style={{ fontWeight: 600, color: '#0F172A', margin: 0, fontSize: '16px' }}>Inspector</h2>
          <button onClick={() => selectCell(null)} style={{ ...actionButton }}>
            <X size={16} />
          </button>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
          <div style={iconWrapper}>
            <IconComponent size={16} color="#111827" />
          </div>
          <div style={{ minWidth: 0, flex: 1 }}>
            <p style={{ fontSize: 14, fontWeight: 600, color: '#0F172A', margin: 0, textTransform: 'capitalize' }}>
              {selectedCell.kind === 'prompt' ? 'Instructions' : selectedCell.kind} Cell
            </p>
            <p style={{ fontSize: 12, color: '#64748B', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {selectedCell.name || `Untitled ${selectedCell.kind}`}
            </p>
          </div>
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', gap: 6 }}>
          <button onClick={() => duplicateCell(selectedCell.id)} style={{ ...actionButton }}>
            <Copy size={14} />
            Duplicate
          </button>
          <button
            onClick={() => deleteCell(selectedCell.id)}
            style={{ ...actionButton, color: '#B91C1C' }}
            title="Delete"
          >
            <Trash2 size={14} />
            Delete
          </button>
        </div>
      </div>

      {/* Content */}
      <div style={{ flex: 1, overflowY: 'auto', padding: 16 }}>
        {selectedCell.kind === 'prompt' && <PromptInspector cell={selectedCell} />}
        {selectedCell.kind === 'connector' && <ConnectorInspector cell={selectedCell} />}
        {selectedCell.kind === 'node' && <NodeInspector cell={selectedCell} />}
      </div>
    </div>
  )
}
