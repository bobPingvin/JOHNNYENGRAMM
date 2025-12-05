import * as d3 from 'd3';

export enum ViewState {
  BOOT = 'BOOT',
  DASHBOARD = 'DASHBOARD',
  CONSTRUCTOR = 'CONSTRUCTOR', // The Graph
  ARCHIVE = 'ARCHIVE', // The List
  BIO = 'BIO', // Full Biography
  CHAT = 'CHAT', // Simulacrum
  BLACKWALL = 'BLACKWALL', // AI Barrier Visualizer
  BBS = 'BBS' // Darknet Feedback Channel
}

export interface MemoryNode {
  id: string;
  label: string;
  type: 'CORE' | 'FRAGMENT' | 'TRAUMA';
  integrity: number; // 0-100
  timestamp: string;
  description: string;
}

export interface MemoryLink {
  source: string;
  target: string;
  strength: number;
}

export interface SystemLog {
  id: string;
  timestamp: string;
  level: 'INFO' | 'WARN' | 'CRIT' | 'SYS';
  message: string;
}

export interface ChatMessage {
  id: string;
  sender: 'USER' | 'CONSTRUCT';
  text: string;
  timestamp: string;
}

// Graph types for D3
export interface GraphNode extends d3.SimulationNodeDatum {
  id: string;
  group: number;
  label: string;
  type: string;
  integrity: number;
  description: string;
  timestamp: string;
  // D3 properties explicitly added to satisfy strict type checking
  x?: number;
  y?: number;
  fx?: number | null;
  fy?: number | null;
  vx?: number;
  vy?: number;
}

export interface GraphLink extends d3.SimulationLinkDatum<GraphNode> {
  source: string | number | GraphNode;
  target: string | number | GraphNode;
  value: number;
}