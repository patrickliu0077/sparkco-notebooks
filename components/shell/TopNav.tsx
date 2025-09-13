'use client'

import { Button } from "@/components/ui/button"
import { useAgentStore, useDocument } from "@/lib/store"
import { downloadJSON } from "@/lib/utils"
import { 
  Share2, 
  Download, 
  GitBranch, 
  Sparkles,
  Menu,
  X
} from "lucide-react"

export function TopNav() {
  const document = useDocument()
  const { 
    toggleGraphView, 
    toggleLeftPanel, 
    leftPanelCollapsed,
    isGraphViewOpen,
    exportDocument 
  } = useAgentStore()

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
            <div style={{
              width: '32px',
              height: '32px',
              borderRadius: '8px',
              background: '#F1F5F9',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Sparkles size={16} color="#111827" />
            </div>
            <div>
              <input
                value={document.title}
                onChange={(e) => {
                  const { updateDocument } = useAgentStore.getState()
                  updateDocument({ title: e.target.value })
                }}
                style={{
                  fontWeight: 600,
                  color: '#0F172A',
                  fontSize: '18px',
                  margin: 0,
                  background: 'transparent',
                  border: 'none',
                  outline: 'none',
                  padding: '2px 0',
                  width: '200px'
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
              <p style={{
                fontSize: '12px',
                color: '#475569',
                margin: 0
              }}>
                {document.cells.length} cells
              </p>
            </div>
          </div>
        </div>

        {/* Right section */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <button
            onClick={toggleGraphView}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 12px',
              borderRadius: '6px',
              border: '1px solid #E5E7EB',
              background: 'white',
              cursor: 'pointer',
              fontSize: '13px',
              fontWeight: 500
            }}
          >
            <GitBranch size={14} />
            {isGraphViewOpen ? 'Hide Graph' : 'View Graph'}
          </button>
          
          <button
            onClick={handleExport}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 12px',
              borderRadius: '6px',
              border: '1px solid #E5E7EB',
              background: 'white',
              cursor: 'pointer',
              fontSize: '13px',
              fontWeight: 500
            }}
          >
            <Download size={14} />
            Export
          </button>
          
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
