import { NodeSchema } from './types';

type Listener = (nodes: NodeSchema[]) => void;

class SceneGraph {
  private nodes: NodeSchema[] = [];
  private listeners: Listener[] = [];
  private selection: string[] = [];
  private selectionListeners: ((ids: string[]) => void)[] = [];

  constructor() {
    // Initial dummy data
    this.nodes = [
      { id: '1', type: 'RECTANGLE' as any, x: 100, y: 100, width: 100, height: 100, fill: '#ef4444' },
      { id: '2', type: 'CIRCLE' as any, x: 300, y: 200, radius: 50, fill: '#3b82f6' },
    ];
  }

  getNodes() {
    return [...this.nodes];
  }

  setNodes(newNodes: NodeSchema[]) {
    this.nodes = newNodes;
    this.notify();
  }

  addNode(node: NodeSchema) {
    this.nodes.push(node);
    this.notify();
  }

  updateNode(id: string, partial: Partial<NodeSchema>) {
    const index = this.nodes.findIndex(n => n.id === id);
    if (index !== -1) {
      this.nodes[index] = { ...this.nodes[index], ...partial };
      this.notify();
    }
  }

  deleteNode(id: string) {
    this.nodes = this.nodes.filter(n => n.id !== id);
    this.selection = this.selection.filter(selId => selId !== id);
    this.notify();
    this.notifySelection();
  }

  getSelection() {
    return [...this.selection];
  }

  setSelection(ids: string[]) {
    this.selection = ids;
    this.notifySelection();
  }

  subscribe(listener: Listener) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  subscribeSelection(listener: (ids: string[]) => void) {
    this.selectionListeners.push(listener);
    return () => {
      this.selectionListeners = this.selectionListeners.filter(l => l !== listener);
    };
  }

  private notify() {
    this.listeners.forEach(l => l(this.nodes));
  }

  private notifySelection() {
    this.selectionListeners.forEach(l => l(this.selection));
  }
}

export const sceneGraph = new SceneGraph();