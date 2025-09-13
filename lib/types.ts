// Base cell interface
export interface BaseCell {
  id: string;
  kind: CellKind;
  name?: string;
  note?: string;
  createdAt: Date;
  updatedAt: Date;
}

// Cell types
export type CellKind = 'prompt' | 'connector' | 'node';

// Prompt cell for natural language instructions
export interface PromptCell extends BaseCell {
  kind: 'prompt';
  content: string;
  tags?: string[];
}

// Connector cell for external integrations
export interface ConnectorCell extends BaseCell {
  kind: 'connector';
  connector: ConnectorType;
  config: Record<string, string>;
  description?: string;
}

export type ConnectorType = 
  | 'gmail' 
  | 'slack' 
  | 'notion' 
  | 'sheets' 
  | 'http' 
  | 'files'
  | 'agent-api'
  | 'payment'
  | 'marketplace'
  | 'webhook'
  | 'custom';

// Node cell for graph operations
export interface NodeCell extends BaseCell {
  kind: 'node';
  nodeType: NodeType;
  params: Record<string, any>;
  description?: string;
}

export type NodeType = 
  | 'llm'
  | 'tool' 
  | 'router' 
  | 'loop' 
  | 'memory' 
  | 'retrieve' 
  | 'output'
  | 'input'
  | 'payment'
  | 'agent-call'
  | 'escrow'
  | 'validate';

// Union type for all cells
export type Cell = PromptCell | ConnectorCell | NodeCell;

// Agent document structure
export interface AgentDoc {
  id: string;
  title: string;
  description?: string;
  cells: Cell[];
  createdAt: Date;
  updatedAt: Date;
  version: string;
}

// Graph visualization types
export interface GraphNode {
  id: string;
  type: string;
  label: string;
  data: {
    cellId: string;
    cellKind: CellKind;
    nodeType?: NodeType;
    connector?: ConnectorType;
  };
  position: { x: number; y: number };
}

export interface GraphEdge {
  id: string;
  source: string;
  target: string;
  label?: string;
  type?: 'default' | 'conditional' | 'loop';
}

// Palette item types
export interface PaletteItem {
  id: string;
  type: 'connector' | 'node' | 'prompt';
  label: string;
  description: string;
  icon: string;
  category?: string;
  data?: Partial<ConnectorCell | NodeCell | PromptCell>;
}

// Store state interface
export interface AgentStore {
  // Current document
  document: AgentDoc;
  
  // UI state
  selectedCellId: string | null;
  isGraphViewOpen: boolean;
  leftPanelCollapsed: boolean;
  rightPanelCollapsed: boolean;
  
  // Actions
  addCell: (kind: CellKind, atIndex?: number, initialData?: Partial<Cell>) => void;
  updateCell: (id: string, updates: Partial<Cell>) => void;
  deleteCell: (id: string) => void;
  moveCell: (id: string, toIndex: number) => void;
  duplicateCell: (id: string) => void;
  
  // Selection
  selectCell: (id: string | null) => void;
  
  // Document operations
  updateDocument: (updates: Partial<AgentDoc>) => void;
  exportDocument: () => string;
  importDocument: (json: string) => void;
  resetDocument: () => void;
  
  // UI actions
  toggleGraphView: () => void;
  toggleLeftPanel: () => void;
  toggleRightPanel: () => void;
}

// Connector configurations
export interface ConnectorConfig {
  [key: string]: {
    label: string;
    description: string;
    icon: string;
    fields: ConnectorField[];
  };
}

export interface ConnectorField {
  key: string;
  label: string;
  type: 'text' | 'password' | 'url' | 'select' | 'textarea';
  required?: boolean;
  placeholder?: string;
  options?: { value: string; label: string; }[];
  description?: string;
}

// Node configurations
export interface NodeConfig {
  [key: string]: {
    label: string;
    description: string;
    icon: string;
    color: string;
    fields: NodeField[];
  };
}

export interface NodeField {
  key: string;
  label: string;
  type: 'text' | 'textarea' | 'number' | 'boolean' | 'select' | 'json';
  required?: boolean;
  placeholder?: string;
  options?: { value: string; label: string; }[];
  description?: string;
  defaultValue?: any;
}

// Drag and drop types
export interface DragItem {
  type: 'cell' | 'palette-item';
  id: string;
  cellKind?: CellKind;
  paletteItem?: PaletteItem;
}

export interface DropResult {
  targetIndex: number;
  action: 'move' | 'insert';
}
