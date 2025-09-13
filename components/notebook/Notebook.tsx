'use client'

import { useCells, useAgentStore } from "@/lib/store"
import { Plus, Sparkles } from "lucide-react"
import type { CellKind } from "@/lib/types"
import { PromptCell as PromptCellView } from "@/components/notebook/PromptCell"
import { ConnectorCellView } from "@/components/notebook/ConnectorCellView"
import { NodeCellView } from "@/components/notebook/NodeCellView"

interface AddCellButtonProps {
  onAdd: (kind: CellKind) => void
}

const buttonGhost: React.CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  fontSize: 13,
  fontWeight: 500,
  padding: '7px 14px',
  borderRadius: 20,
  border: 'none',
  background: 'rgba(255, 255, 255, 0.8)',
  cursor: 'pointer',
  transition: 'all 0.2s ease',
  color: '#475569'
}

function AddCellButton({ onAdd }: AddCellButtonProps) {
  return (
    <div style={{ 
      display: 'flex', 
      justifyContent: 'center', 
      padding: '8px 0',
      position: 'relative'
    }}>
      <div style={{
        position: 'absolute',
        left: '30%',
        right: '30%',
        top: '50%',
        height: 1,
        background: '#E5E7EB',
        transform: 'translateY(-50%)'
      }} />
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 2,
          padding: 2,
          borderRadius: 6,
          background: '#FFFFFF',
          border: '1px solid #E5E7EB',
          position: 'relative',
          zIndex: 1
        }}
      >
        <button 
          onClick={() => onAdd('prompt')} 
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            fontSize: 11,
            fontWeight: 500,
            padding: '4px 8px',
            borderRadius: 4,
            border: 'none',
            background: 'transparent',
            cursor: 'pointer',
            transition: 'all 0.15s ease',
            color: '#6B7280'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = '#F1F5F9'
            e.currentTarget.style.color = '#111827'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'transparent'
            e.currentTarget.style.color = '#6B7280'
          }}
        >
          <Plus size={10} style={{ marginRight: 4 }} />
          Prompt
        </button>
        <button 
          onClick={() => onAdd('connector')} 
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            fontSize: 11,
            fontWeight: 500,
            padding: '4px 8px',
            borderRadius: 4,
            border: 'none',
            background: 'transparent',
            cursor: 'pointer',
            transition: 'all 0.15s ease',
            color: '#6B7280'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = '#F1F5F9'
            e.currentTarget.style.color = '#111827'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'transparent'
            e.currentTarget.style.color = '#6B7280'
          }}
        >
          <Plus size={10} style={{ marginRight: 4 }} />
          Connector
        </button>
        <button 
          onClick={() => onAdd('node')} 
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            fontSize: 11,
            fontWeight: 500,
            padding: '4px 8px',
            borderRadius: 4,
            border: 'none',
            background: 'transparent',
            cursor: 'pointer',
            transition: 'all 0.15s ease',
            color: '#6B7280'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = '#F1F5F9'
            e.currentTarget.style.color = '#111827'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'transparent'
            e.currentTarget.style.color = '#6B7280'
          }}
        >
          <Plus size={10} style={{ marginRight: 4 }} />
          Node
        </button>
      </div>
    </div>
  )
}

function EmptyState() {
  const { addCell } = useAgentStore()
  const document = useAgentStore((state) => state.document)

  return (
    <div style={{ 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center', 
      minHeight: '70vh',
      padding: '60px 20px'
    }}>
      <div style={{ maxWidth: 420, width: '100%' }}>
        {/* Simple text header */}
        <div style={{ marginBottom: 40 }}>
          <h1 style={{ 
            fontSize: 32, 
            fontWeight: 700, 
            color: '#111827', 
            margin: '0 0 16px 0',
            letterSpacing: '-0.025em',
            lineHeight: 1.1
          }}>
            {document.title}
          </h1>
          <p style={{ 
            color: '#6B7280', 
            fontSize: 16,
            lineHeight: 1.5,
            margin: 0
          }}>
            Build workflows with prompts, connectors, and nodes.
          </p>
        </div>

        {/* Clean action buttons */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <button
            onClick={() => addCell('prompt')}
            style={{
              width: '100%',
              textAlign: 'left',
              padding: '16px 20px',
              borderRadius: 8,
              border: '1px solid #E5E7EB',
              background: '#FFFFFF',
              color: '#111827',
              fontWeight: 500,
              fontSize: 15,
              cursor: 'pointer',
              transition: 'all 0.15s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = '#D1D5DB'
              e.currentTarget.style.background = '#F9FAFB'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = '#E5E7EB'
              e.currentTarget.style.background = '#FFFFFF'
            }}
          >
            Add Prompt
          </button>
          
          <button
            onClick={() => addCell('connector')}
            style={{
              width: '100%',
              textAlign: 'left',
              padding: '16px 20px',
              borderRadius: 8,
              border: '1px solid #E5E7EB',
              background: '#FFFFFF',
              color: '#111827',
              fontWeight: 500,
              fontSize: 15,
              cursor: 'pointer',
              transition: 'all 0.15s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = '#D1D5DB'
              e.currentTarget.style.background = '#F9FAFB'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = '#E5E7EB'
              e.currentTarget.style.background = '#FFFFFF'
            }}
          >
            Add Connector
          </button>
          
          <button
            onClick={() => addCell('node')}
            style={{
              width: '100%',
              textAlign: 'left',
              padding: '16px 20px',
              borderRadius: 8,
              border: '1px solid #E5E7EB',
              background: '#FFFFFF',
              color: '#111827',
              fontWeight: 500,
              fontSize: 15,
              cursor: 'pointer',
              transition: 'all 0.15s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = '#D1D5DB'
              e.currentTarget.style.background = '#F9FAFB'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = '#E5E7EB'
              e.currentTarget.style.background = '#FFFFFF'
            }}
          >
            Add Node
          </button>
        </div>
      </div>
    </div>
  )
}

function CellPlaceholder({ cellId }: { cellId: string }) {
  const { selectCell, selectedCellId } = useAgentStore()
  const isSelected = selectedCellId === cellId

  return (
    <div
      onClick={() => selectCell(cellId)}
      style={{
        padding: 32,
        borderRadius: 16,
        border: `2px solid ${isSelected ? '#111827' : 'transparent'}`,
        background: isSelected 
          ? 'linear-gradient(135deg, #F8FAFC 0%, #EEF2F7 100%)' 
          : '#FFFFFF',
        cursor: 'pointer',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        boxShadow: isSelected 
          ? '0 8px 24px rgba(0, 0, 0, 0.08), 0 2px 8px rgba(0, 0, 0, 0.05)'
          : '0 2px 8px rgba(0, 0, 0, 0.03), 0 1px 2px rgba(0, 0, 0, 0.02)',
        transform: isSelected ? 'scale(1.01)' : 'scale(1)'
      }}
      onMouseEnter={(e) => {
        if (!isSelected) {
          e.currentTarget.style.boxShadow = '0 4px 16px rgba(0, 0, 0, 0.08), 0 2px 4px rgba(0, 0, 0, 0.04)'
          e.currentTarget.style.transform = 'scale(1.005)'
        }
      }}
      onMouseLeave={(e) => {
        if (!isSelected) {
          e.currentTarget.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.04), 0 1px 2px rgba(0, 0, 0, 0.02)'
          e.currentTarget.style.transform = 'scale(1)'
        }
      }}
    >
      <div style={{ textAlign: 'center' }}>
        <div
          style={{
            width: 56,
            height: 56,
            margin: '0 auto 12px',
            borderRadius: 14,
            background: isSelected 
              ? 'linear-gradient(135deg, #111827 0%, #0B1220 100%)'
              : 'linear-gradient(135deg, #F1F5F9 0%, #E5E7EB 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.12)',
            transition: 'all 0.3s ease'
          }}
        >
          <Plus size={24} color={isSelected ? 'white' : '#111827'} />
        </div>
        <div style={{ 
          fontWeight: 600, 
          fontSize: 16,
          color: isSelected ? '#0F172A' : '#475569',
          marginBottom: 4
        }}>
          Cell Placeholder
        </div>
        <div style={{ 
          fontSize: 13, 
          color: isSelected ? '#64748B' : '#94A3B8'
        }}>
          Click to configure this cell
        </div>
      </div>
    </div>
  )
}

export function Notebook() {
  const cells = useCells()
  const { addCell, selectCell, selectedCellId } = useAgentStore()

  const handleAddCell = (kind: CellKind, atIndex?: number) => {
    addCell(kind, atIndex)
  }

  if (cells.length === 0) {
    return (
      <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
        <div style={{ flex: 1, overflow: 'auto' }}>
          <div style={{ maxWidth: 920, margin: '0 auto', padding: '8px 24px' }}>
            <EmptyState />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <div style={{ flex: 1, overflow: 'auto' }}>
        <div style={{ maxWidth: 920, margin: '0 auto', padding: 24 }}>
          {/* Add cell button at the top */}
          <AddCellButton onAdd={(kind) => handleAddCell(kind, 0)} />

          {/* Render cells */}
          {cells.map((cell, index) => {
            const isSelected = selectedCellId === cell.id
            return (
              <div key={cell.id} style={{ marginBottom: 4 }}>
                {cell.kind === 'prompt' && (
                  <PromptCellView
                    // @ts-ignore - component expects PromptCell which this is when kind==='prompt'
                    cell={cell as any}
                    isSelected={isSelected}
                    onSelect={() => selectCell(cell.id)}
                  />
                )}
                {cell.kind === 'connector' && (
                  <ConnectorCellView
                    // @ts-ignore - narrow by kind
                    cell={cell as any}
                    isSelected={isSelected}
                    onSelect={() => selectCell(cell.id)}
                  />
                )}
                {cell.kind === 'node' && (
                  <NodeCellView
                    // @ts-ignore - narrow by kind
                    cell={cell as any}
                    isSelected={isSelected}
                    onSelect={() => selectCell(cell.id)}
                  />
                )}
                {/* Add cell button between cells */}
                <AddCellButton onAdd={(kind) => handleAddCell(kind, index + 1)} />
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
