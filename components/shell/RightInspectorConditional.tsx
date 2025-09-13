'use client'

import { useSelectedCell } from "@/lib/store"
import { RightInspector } from "./RightInspector"

export function RightInspectorConditional() {
  const selectedCell = useSelectedCell()
  
  if (!selectedCell) {
    return null
  }
  
  return <RightInspector />
}
