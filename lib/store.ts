import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { nanoid } from 'nanoid';
import type { 
  AgentStore, 
  AgentDoc, 
  Cell, 
  CellKind, 
  PromptCell, 
  ConnectorCell, 
  NodeCell 
} from './types';

// Create initial empty document
const createEmptyDocument = (): AgentDoc => ({
  id: nanoid(),
  title: 'Untitled Agent',
  description: '',
  cells: [],
  createdAt: new Date(),
  updatedAt: new Date(),
  version: '1.0.0',
});

// Create a new cell with defaults
const createCell = (kind: CellKind, initialData?: Partial<Cell>): Cell => {
  const baseCell = {
    id: nanoid(),
    kind,
    name: '',
    note: '',
    createdAt: new Date(),
    updatedAt: new Date(),
    ...initialData,
  };

  switch (kind) {
    case 'prompt':
      return {
        ...baseCell,
        kind: 'prompt',
        content: '',
        tags: [],
      } as PromptCell;
    
    case 'connector':
      return {
        ...baseCell,
        kind: 'connector',
        connector: 'custom',
        config: {},
        description: '',
      } as ConnectorCell;
    
    case 'node':
      return {
        ...baseCell,
        kind: 'node',
        nodeType: 'llm',
        params: {},
        description: '',
      } as NodeCell;
    
    default:
      throw new Error(`Unknown cell kind: ${kind}`);
  }
};

export const useAgentStore = create<AgentStore>()(
  persist(
    (set, get) => ({
      // Initial state
      document: createEmptyDocument(),
      selectedCellId: null,
      isGraphViewOpen: false,
      leftPanelCollapsed: false,
      rightPanelCollapsed: false,

      // Cell operations
      addCell: (kind: CellKind, atIndex?: number, initialData?: Partial<Cell>) => {
        const newCell = createCell(kind, initialData);
        
        set((state) => {
          const cells = [...state.document.cells];
          const insertIndex = atIndex !== undefined ? atIndex : cells.length;
          cells.splice(insertIndex, 0, newCell);
          
          return {
            document: {
              ...state.document,
              cells,
              updatedAt: new Date(),
            },
            selectedCellId: newCell.id,
          };
        });
      },

      updateCell: (id: string, updates: Partial<Cell>) => {
        set((state) => {
          const cells = state.document.cells.map((cell) =>
            cell.id === id
              ? { ...cell, ...updates, updatedAt: new Date() } as Cell
              : cell
          );
          
          return {
            document: {
              ...state.document,
              cells,
              updatedAt: new Date(),
            },
          };
        });
      },

      deleteCell: (id: string) => {
        set((state) => {
          const cells = state.document.cells.filter((cell) => cell.id !== id);
          const selectedCellId = state.selectedCellId === id ? null : state.selectedCellId;
          
          return {
            document: {
              ...state.document,
              cells,
              updatedAt: new Date(),
            },
            selectedCellId,
          };
        });
      },

      moveCell: (id: string, toIndex: number) => {
        set((state) => {
          const cells = [...state.document.cells];
          const fromIndex = cells.findIndex((cell) => cell.id === id);
          
          if (fromIndex === -1) return state;
          
          const [movedCell] = cells.splice(fromIndex, 1);
          cells.splice(toIndex, 0, movedCell);
          
          return {
            document: {
              ...state.document,
              cells,
              updatedAt: new Date(),
            },
          };
        });
      },

      duplicateCell: (id: string) => {
        set((state) => {
          const originalCell = state.document.cells.find((cell) => cell.id === id);
          if (!originalCell) return state;
          
          const duplicatedCell = {
            ...originalCell,
            id: nanoid(),
            name: originalCell.name ? `${originalCell.name} (Copy)` : '',
            createdAt: new Date(),
            updatedAt: new Date(),
          };
          
          const cells = [...state.document.cells];
          const originalIndex = cells.findIndex((cell) => cell.id === id);
          cells.splice(originalIndex + 1, 0, duplicatedCell);
          
          return {
            document: {
              ...state.document,
              cells,
              updatedAt: new Date(),
            },
            selectedCellId: duplicatedCell.id,
          };
        });
      },

      // Selection
      selectCell: (id: string | null) => {
        set({ selectedCellId: id });
      },

      // Document operations
      updateDocument: (updates: Partial<AgentDoc>) => {
        set((state) => ({
          document: {
            ...state.document,
            ...updates,
            updatedAt: new Date(),
          },
        }));
      },

      exportDocument: () => {
        const { document } = get();
        return JSON.stringify(document, null, 2);
      },

      importDocument: (json: string) => {
        try {
          const importedDoc = JSON.parse(json) as AgentDoc;
          // Validate the imported document structure
          if (!importedDoc.id || !Array.isArray(importedDoc.cells)) {
            throw new Error('Invalid document format');
          }
          
          set({
            document: {
              ...importedDoc,
              updatedAt: new Date(),
            },
            selectedCellId: null,
          });
        } catch (error) {
          console.error('Failed to import document:', error);
          throw new Error('Invalid JSON format');
        }
      },

      resetDocument: () => {
        set({
          document: createEmptyDocument(),
          selectedCellId: null,
          isGraphViewOpen: false,
        });
      },

      // UI actions
      toggleGraphView: () => {
        set((state) => ({
          isGraphViewOpen: !state.isGraphViewOpen,
        }));
      },

      toggleLeftPanel: () => {
        set((state) => ({
          leftPanelCollapsed: !state.leftPanelCollapsed,
        }));
      },

      toggleRightPanel: () => {
        set((state) => ({
          rightPanelCollapsed: !state.rightPanelCollapsed,
        }));
      },
    }),
    {
      name: 'agent-notebook-storage',
      version: 1,
      // Only persist the document and UI preferences
      partialize: (state) => ({
        document: state.document,
        leftPanelCollapsed: state.leftPanelCollapsed,
        rightPanelCollapsed: state.rightPanelCollapsed,
      }),
    }
  )
);

// Utility hooks for specific parts of the store
export const useDocument = () => useAgentStore((state) => state.document);
export const useCells = () => useAgentStore((state) => state.document.cells);
export const useSelectedCell = () => {
  const selectedCellId = useAgentStore((state) => state.selectedCellId);
  const cells = useAgentStore((state) => state.document.cells);
  return selectedCellId ? cells.find((cell) => cell.id === selectedCellId) : null;
};
export const useSelectedCellId = () => useAgentStore((state) => state.selectedCellId);
export const useGraphViewOpen = () => useAgentStore((state) => state.isGraphViewOpen);
export const useLeftPanelCollapsed = () => useAgentStore((state) => state.leftPanelCollapsed);
export const useRightPanelCollapsed = () => useAgentStore((state) => state.rightPanelCollapsed);
