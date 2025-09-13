'use client'

import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Placeholder from '@tiptap/extension-placeholder'
import { useEffect } from 'react'
import { useAgentStore } from '@/lib/store'
import { MessageCircle } from 'lucide-react'
import type { PromptCell as PromptCellType } from '@/lib/types'

interface PromptCellProps {
  cell: PromptCellType
  isSelected: boolean
  onSelect: () => void
}

export function PromptCell({ cell, isSelected, onSelect }: PromptCellProps) {
  const { updateCell } = useAgentStore()

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit,
      Placeholder.configure({
        placeholder: 'Describe what you want your agent to do...',
      }),
    ],
    content: cell.content,
    onUpdate: ({ editor }) => {
      const content = editor.getText()
      updateCell(cell.id, { content })
    },
    editorProps: {
      attributes: {
        class: 'focus:outline-none',
      },
    },
  })

  useEffect(() => {
    if (editor && editor.getHTML() !== cell.content) {
      editor.commands.setContent(cell.content)
    }
  }, [cell.content, editor])

  return (
    <div
      onClick={onSelect}
      style={{
        padding: 12,
        borderRadius: 4,
        border: `1px solid ${isSelected ? '#8B5CF6' : '#E5E7EB'}`,
        background: '#FFFFFF',
        transition: 'all .15s ease',
        boxShadow: isSelected
          ? '0 0 0 3px rgba(139, 92, 246, 0.1)'
          : 'none',
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
          <MessageCircle size={12} color="#111827" />
        </div>
        <div style={{ minWidth: 0 }}>
          <div style={{ fontWeight: 500, color: '#0F172A', lineHeight: 1.2, fontSize: 14 }}>
            {cell.name?.trim() || 'Prompt'}
          </div>
        </div>
        {cell.tags && cell.tags.length > 0 ? (
          <div style={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}>
            {cell.tags.slice(0, 2).map((tag) => (
              <span
                key={tag}
                style={{
                  fontSize: 9,
                  padding: '1px 3px',
                  borderRadius: 2,
                  border: '1px solid #E5E7EB',
                  background: '#FFFFFF',
                  color: '#6B7280',
                  fontFamily: 'JetBrains Mono, ui-monospace, SFMono-Regular, Menlo, monospace',
                  textTransform: 'lowercase'
                }}
              >
                {tag.toLowerCase()}
              </span>
            ))}
          </div>
        ) : null}
      </div>

      {/* Editor */}
      <div
        style={{
          minHeight: 120,
          border: '1px solid #E5E7EB',
          borderRadius: 8,
          background: '#FFFFFF',
          padding: 10,
        }}
      >
        <EditorContent editor={editor} />
      </div>

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
