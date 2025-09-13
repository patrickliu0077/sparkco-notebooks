'use client'

import {
  Zap,
  Wrench,
  GitBranch,
  RotateCcw,
  Database,
  Search,
  ArrowRight,
} from 'lucide-react'
import type { NodeCell } from '@/lib/types'

const nodeIconMap = {
  llm: Zap,
  tool: Wrench,
  router: GitBranch,
  loop: RotateCcw,
  memory: Database,
  retrieve: Search,
  output: ArrowRight,
  input: ArrowRight,
} as const

interface Props {
  cell: NodeCell
  isSelected: boolean
  onSelect: () => void
}

export function NodeCellView({ cell, isSelected, onSelect }: Props) {
  const Icon = (nodeIconMap as any)[cell.nodeType] ?? Zap
  const entries = Object.entries(cell.params || {})

  return (
    <div
      onClick={onSelect}
      style={{
        padding: 12,
        borderRadius: 4,
        border: `2px solid ${isSelected ? '#111827' : 'transparent'}`,
        background: isSelected ? 'linear-gradient(135deg,#F8FAFC 0%,#EEF2F7 100%)' : '#FFFFFF',
        transition: 'all .2s ease',
        boxShadow: isSelected
          ? '0 8px 24px rgba(0,0,0,.08), 0 2px 8px rgba(0,0,0,.05)'
          : '0 2px 8px rgba(0,0,0,.03), 0 1px 2px rgba(0,0,0,.02)',
        cursor: 'pointer',
      }}
    >
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
        <div
          style={{
            width: 20,
            height: 20,
            borderRadius: 4,
            background: '#F1F5F9',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          <Icon size={12} color="#111827" />
        </div>
        <div style={{ minWidth: 0 }}>
          <div style={{ fontWeight: 500, color: '#0F172A', lineHeight: 1.2, fontSize: 14 }}>
            {cell.name?.trim() || 'Node'}
          </div>
        </div>
        <div style={{ fontSize: 11, color: '#6B7280', fontFamily: 'JetBrains Mono, ui-monospace, SFMono-Regular, Menlo, monospace' }}>
          {cell.nodeType}
        </div>
      </div>

      {/* Description */}
      {cell.description ? (
        <div
          style={{
            fontSize: 13,
            color: '#475569',
            marginBottom: 10,
          }}
        >
          {cell.description}
        </div>
      ) : null}

      {/* Params */}
      {entries.length > 0 ? (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: 8,
          }}
        >
          {entries.slice(0, 6).map(([k, v]) => (
            <div
              key={k}
              style={{
                border: '1px solid #E5E7EB',
                borderRadius: 8,
                padding: '8px 10px',
                background: '#FFFFFF',
              }}
            >
              <div
                style={{
                  fontSize: 11,
                  color: '#6B7280',
                  marginBottom: 2,
                  fontFamily:
                    'JetBrains Mono, ui-monospace, SFMono-Regular, Menlo, monospace',
                }}
              >
                {k}
              </div>
              <div
                style={{
                  fontSize: 12,
                  color: '#111827',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  fontFamily:
                    'JetBrains Mono, ui-monospace, SFMono-Regular, Menlo, monospace',
                }}
                title={typeof v === 'string' ? v : JSON.stringify(v)}
              >
                {typeof v === 'string' ? v : JSON.stringify(v)}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div
          style={{
            fontSize: 12,
            color: '#9CA3AF',
            border: '1px dashed #E5E7EB',
            background: '#F9FAFB',
            padding: 10,
            borderRadius: 8,
            textAlign: 'center',
          }}
        >
          No parameters yet. Add them in the Inspector →
        </div>
      )}

      {/* Note */}
      {cell.note ? (
        <div
          style={{
            marginTop: 10,
            fontSize: 12,
            color: '#64748B',
            background: '#F9FAFB',
            border: '1px solid #E5E7EB',
            borderRadius: 8,
            padding: 8,
          }}
        >
          {cell.note}
        </div>
      ) : null}
    </div>
  )
}
