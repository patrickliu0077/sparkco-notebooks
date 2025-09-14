'use client'

import { useState } from 'react'
import { usePathname } from 'next/navigation'
import { Button } from "@/components/ui/button"
import { useAgentStore, useDocument } from "@/lib/store"
import { downloadJSON } from "@/lib/utils"
import { 
  Share2, 
  Download, 
  GitBranch, 
  Sparkles,
  Menu,
  X,
  Zap,
  Bot,
  Rocket,
  Target,
  Crown,
  Diamond,
  Star,
  ChevronDown,
  Settings
} from "lucide-react"

export function TopNav() {
  const pathname = usePathname()
  const document = useDocument()
  const [showIconPicker, setShowIconPicker] = useState(false)
  const { 
    toggleGraphView, 
    toggleLeftPanel, 
    leftPanelCollapsed,
    isGraphViewOpen,
    exportDocument,
    updateDocument
  } = useAgentStore()

  const iconOptions = [
    { icon: Sparkles, name: 'Sparkles' },
    { icon: Zap, name: 'Zap' },
    { icon: Bot, name: 'Bot' },
    { icon: Rocket, name: 'Rocket' },
    { icon: Target, name: 'Target' },
    { icon: Crown, name: 'Crown' },
    { icon: Diamond, name: 'Diamond' },
    { icon: Star, name: 'Star' }
  ]

  const currentIcon = document.icon || 'Sparkles'
  const CurrentIconComponent = iconOptions.find(opt => opt.name === currentIcon)?.icon || Sparkles

  const handleExport = () => {
    const json = exportDocument()
    downloadJSON(JSON.parse(json), `${document.title.toLowerCase().replace(/\s+/g, '-')}.json`)
  }

  const handleShare = () => {
    const json = exportDocument()
    navigator.clipboard.writeText(json).then(() => {
      console.log('Agent copied to clipboard')
    })
  }

  return (
    <header style={{
      height: '48px',
      borderBottom: '1px solid #E5E7EB',
      backgroundColor: '#FFFFFF',
      position: 'sticky',
      top: 0,
      zIndex: 50
    }}>
      <div style={{
        height: '100%',
        padding: '0 24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        {/* Left section */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <button
            onClick={toggleLeftPanel}
            style={{
              display: 'none',
              padding: '8px',
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              borderRadius: '6px'
            }}
            className="lg-hidden"
          >
            {leftPanelCollapsed ? <Menu size={20} /> : <X size={20} />}
          </button>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div 
              onClick={() => setShowIconPicker(!showIconPicker)}
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '8px',
                background: '#F8FAFC',
                border: '1px solid rgba(229, 231, 235, 0.6)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                position: 'relative'
              }}
            >
              <CurrentIconComponent size={16} color="#111827" />
              <ChevronDown size={10} color="#6B7280" style={{ position: 'absolute', bottom: 2, right: 2 }} />
              
              {showIconPicker && (
                <div style={{
                  position: 'absolute',
                  top: '100%',
                  left: 0,
                  marginTop: 4,
                  background: '#FFFFFF',
                  border: '1px solid #E5E7EB',
                  borderRadius: 8,
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
                  padding: 8,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 4,
                  zIndex: 1000
                }}>
                  {iconOptions.map((option) => (
                    <button
                      key={option.name}
                      onClick={(e) => {
                        e.stopPropagation()
                        updateDocument({ icon: option.name })
                        setShowIconPicker(false)
                      }}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 8,
                        padding: '6px 8px',
                        borderRadius: 4,
                        border: 'none',
                        background: currentIcon === option.name ? '#F1F5F9' : 'transparent',
                        cursor: 'pointer',
                        fontSize: 12,
                        fontWeight: 500,
                        color: '#111827'
                      }}
                    >
                      <option.icon size={14} />
                      {option.name}
                    </button>
                  ))}
                </div>
              )}
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 2 }}>
                <input
                  value={document.title}
                  onChange={(e) => {
                    const { updateDocument } = useAgentStore.getState()
                    updateDocument({ title: e.target.value })
                  }}
                  style={{
                    fontWeight: 500,
                    color: '#111827',
                    fontSize: '16px',
                    margin: 0,
                    background: 'transparent',
                    border: 'none',
                    outline: 'none',
                    padding: '2px 0',
                    width: '180px',
                    fontFamily: 'Inter, system-ui, sans-serif'
                  }}
                  onFocus={(e) => {
                    e.target.style.background = '#F9FAFB'
                    e.target.style.borderRadius = '4px'
                    e.target.style.padding = '2px 6px'
                  }}
                  onBlur={(e) => {
                    e.target.style.background = 'transparent'
                    e.target.style.padding = '2px 0'
                  }}
                />
                <span style={{
                  fontSize: 10,
                  padding: '2px 6px',
                  borderRadius: 4,
                  background: '#F3F4F6',
                  color: '#6B7280',
                  fontFamily: 'JetBrains Mono, ui-monospace, SFMono-Regular, Menlo, monospace',
                  textTransform: 'lowercase'
                }}>
                  draft
                </span>
              </div>
              <p style={{
                fontSize: '12px',
                color: '#9CA3AF',
                margin: 0,
                fontFamily: 'Inter, system-ui, sans-serif'
              }}>
                {document.cells.length} cells · last edited just now
              </p>
            </div>
          </div>
        </div>

        {/* Right section */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {/* Email */}
          <a
            href="mailto:patrick@sparkco.ai"
            style={{
              fontSize: '13px',
              color: '#6B7280',
              textDecoration: 'none',
              fontWeight: 500,
              padding: '6px 12px',
              borderRadius: '6px',
              transition: 'all 0.15s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = '#F9FAFB'
              e.currentTarget.style.color = '#111827'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'transparent'
              e.currentTarget.style.color = '#6B7280'
            }}
          >
            patrick@sparkco.ai
          </a>
          
          {pathname === '/interact' ? (
            <button
              onClick={() => {
                // Navigate back to agent creation page
                window.location.href = '/'
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '6px 12px',
                borderRadius: '6px',
                border: '1px solid #3B82F6',
                background: '#3B82F6',
                color: '#FFFFFF',
                cursor: 'pointer',
                fontSize: '13px',
                fontWeight: 500
              }}
            >
              <Settings size={14} />
              Manage Agent
            </button>
          ) : null}
          
          <button
            onClick={handleShare}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 12px',
              borderRadius: '6px',
              border: '1px solid #E5E7EB',
              background: 'white',
              color: '#0F172A',
              cursor: 'pointer',
              fontSize: '13px',
              fontWeight: 500
            }}
          >
            <Share2 size={14} />
            Share
          </button>
        </div>
      </div>
      
    </header>
  )
}
