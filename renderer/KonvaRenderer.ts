import Konva from 'konva';
import { IRenderer, NodeSchema, NodeType } from '../core/types';

export class KonvaRenderer implements IRenderer {
  private stage: Konva.Stage | null = null;
  private layer: Konva.Layer | null = null;
  private tr: Konva.Transformer | null = null;
  private listeners: { [key: string]: ((data: any) => void)[] } = {};
  private nodeMap: Map<string, Konva.Shape | Konva.Group> = new Map();

  init(container: HTMLDivElement) {
    const width = container.clientWidth;
    const height = container.clientHeight;

    this.stage = new Konva.Stage({
      container: container,
      width: width,
      height: height,
      draggable: true, // Infinite canvas panning
    });

    this.layer = new Konva.Layer();
    this.stage.add(this.layer);

    // Transformer for selection
    this.tr = new Konva.Transformer({
      ignoreStroke: true,
      padding: 5,
    });
    this.layer.add(this.tr);

    // Handle background click for deselection
    this.stage.on('click tap', (e) => {
      if (e.target === this.stage) {
        this.emit('select', []);
        this.tr?.nodes([]);
      }
    });

    // Handle zoom
    const scaleBy = 1.1;
    this.stage.on('wheel', (e) => {
      e.evt.preventDefault();
      const oldScale = this.stage!.scaleX();
      const pointer = this.stage!.getPointerPosition();
      if (!pointer) return;

      const mousePointTo = {
        x: (pointer.x - this.stage!.x()) / oldScale,
        y: (pointer.y - this.stage!.y()) / oldScale,
      };

      const direction = e.evt.deltaY > 0 ? -1 : 1;
      const newScale = direction > 0 ? oldScale * scaleBy : oldScale / scaleBy;

      this.stage!.scale({ x: newScale, y: newScale });
      const newPos = {
        x: pointer.x - mousePointTo.x * newScale,
        y: pointer.y - mousePointTo.y * newScale,
      };
      this.stage!.position(newPos);
    });
  }

  render(nodes: NodeSchema[], selectionIds: string[]) {
    if (!this.layer || !this.tr) return;

    // A simple diffing strategy could go here, but for MVP we re-render or update properties
    // For MVP performance, we'll try to reuse shapes by ID
    
    // 1. Mark all existing as 'unseen'
    const seen = new Set<string>();

    nodes.forEach(node => {
      seen.add(node.id);
      let shape = this.nodeMap.get(node.id);

      if (!shape) {
        // Create new shape
        shape = this.createShape(node);
        this.layer!.add(shape);
        this.nodeMap.set(node.id, shape);
        
        // Event binding
        shape.on('click tap', (e) => {
          e.cancelBubble = true;
          this.emit('select', [node.id]);
        });

        shape.on('dragend', (e) => {
          this.emit('dragend', {
            id: node.id,
            x: e.target.x(),
            y: e.target.y()
          });
        });
        
        // Since we use a Transformer, we need to listen to transformend
        shape.on('transformend', (e) => {
           // We'll treat transform as property updates in real app
           // For MVP just handle position/scale via drag/transform
        });
      } else {
        // Update properties
        // We only update if changed to avoid Thrashing, but Konva is fast.
        shape.setAttrs({
          x: node.x,
          y: node.y,
          fill: node.fill,
          width: node.width,
          height: node.height,
          radius: node.radius,
          // Text specific
          text: node.text,
          fontSize: node.fontSize,
          rotation: node.rotation || 0
        });
      }
      // Ensure z-index is correct based on array order
      shape.zIndex(nodes.indexOf(node));
    });

    // 2. Remove deleted nodes
    this.nodeMap.forEach((shape, id) => {
      if (!seen.has(id)) {
        shape.destroy();
        this.nodeMap.delete(id);
      }
    });

    // 3. Update selection transformer
    const selectedShapes = selectionIds
      .map(id => this.nodeMap.get(id))
      .filter((s): s is Konva.Shape => !!s);
      
    this.tr.nodes(selectedShapes);
    this.tr.moveToTop(); // Always on top

    this.layer.batchDraw();
  }

  updateSelection(ids: string[]) {
     if (!this.tr) return;
     const selectedShapes = ids
      .map(id => this.nodeMap.get(id))
      .filter((s): s is Konva.Shape => !!s);
    this.tr.nodes(selectedShapes);
    this.layer?.batchDraw();
  }

  private createShape(node: NodeSchema): Konva.Shape | Konva.Group {
    if (node.type === NodeType.RECTANGLE) {
      return new Konva.Rect({
        id: node.id,
        x: node.x,
        y: node.y,
        width: node.width || 100,
        height: node.height || 100,
        fill: node.fill,
        draggable: true,
        name: 'shape'
      });
    } else if (node.type === NodeType.CIRCLE) {
      return new Konva.Circle({
        id: node.id,
        x: node.x,
        y: node.y,
        radius: node.radius || 50,
        fill: node.fill,
        draggable: true,
        name: 'shape'
      });
    } else if (node.type === NodeType.TEXT) {
      return new Konva.Text({
        id: node.id,
        x: node.x,
        y: node.y,
        text: node.text || 'Text',
        fontSize: node.fontSize || 20,
        fill: node.fill,
        draggable: true,
        name: 'shape'
      });
    }
    return new Konva.Group();
  }

  destroy() {
    this.stage?.destroy();
  }

  on(event: string, callback: (data: any) => void) {
    if (!this.listeners[event]) {
      this.listeners[event] = [];
    }
    this.listeners[event].push(callback);
  }

  off(event: string, callback: (data: any) => void) {
    if (!this.listeners[event]) return;
    this.listeners[event] = this.listeners[event].filter(cb => cb !== callback);
  }

  private emit(event: string, data: any) {
    if (this.listeners[event]) {
      this.listeners[event].forEach(cb => cb(data));
    }
  }
}