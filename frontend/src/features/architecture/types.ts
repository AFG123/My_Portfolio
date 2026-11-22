export interface ArchitectureNode {
  id: string;
  label: string;
  role: string;
  detail: string;
  tech: string[];
  x: number;
  y: number;
  group?: "primary" | "dependency";
}

export type ArchitectureSide = "left" | "right" | "top" | "bottom";

export interface ArchitectureEdge {
  id: string;
  from: string;
  to: string;
  fromSide: ArchitectureSide;
  toSide: ArchitectureSide;
  fromOffset?: number;
  toOffset?: number;
  laneY?: number;
  label?: string;
  labelAt?: { x: number; y: number };
}

export interface ArchitectureStep {
  title: string;
  plain: string;
  technical: string;
  nodes: string[];
  edges: string[];
  pin?: { x: number; y: number };
}

export interface ArchitectureConfig {
  title: string;
  description: string;
  nodes: ArchitectureNode[];
  edges: ArchitectureEdge[];
  steps: ArchitectureStep[];
  mobileHandoff?: { afterNode: string; text: string };
}
