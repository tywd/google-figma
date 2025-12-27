export enum NodeType {
  RECTANGLE = 'RECTANGLE',
  CIRCLE = 'CIRCLE',
  TEXT = 'TEXT'
}

export interface NodeSchema {
  id: string;
  type: NodeType;
  x: number;
  y: number;
  width?: number;
  height?: number;
  radius?: number;
  fill: string;
  text?: string;
  fontSize?: number;
  rotation?: number;
}

export interface ICommand {
  execute(): void;
  undo(): void;
}

export interface IRenderer {
  init(container: HTMLDivElement): void;
  render(nodes: NodeSchema[], selectionIds: string[]): void;
  destroy(): void;
  on(event: string, callback: (data: any) => void): void;
  off(event: string, callback: (data: any) => void): void;
  updateSelection(ids: string[]): void;
}

export type RenderEvent = {
  type: 'select' | 'transform' | 'dragend';
  payload: any;
};