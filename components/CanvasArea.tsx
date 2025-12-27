import React, { useEffect, useRef } from 'react';
import { KonvaRenderer } from '../renderer/KonvaRenderer';
import { sceneGraph } from '../core/SceneGraph';
import { commandManager } from '../core/CommandManager';
import { MoveNodeCommand } from '../core/commands';

export const CanvasArea: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<KonvaRenderer | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // P0.3 Init Renderer
    const renderer = new KonvaRenderer();
    renderer.init(containerRef.current);
    rendererRef.current = renderer;

    // Initial Render
    renderer.render(sceneGraph.getNodes(), sceneGraph.getSelection());

    // Subscribe to Model Changes (Reactive Binding)
    const unsubscribeNodes = sceneGraph.subscribe((nodes) => {
      renderer.render(nodes, sceneGraph.getSelection());
    });

    const unsubscribeSelection = sceneGraph.subscribeSelection((ids) => {
      renderer.updateSelection(ids);
    });

    // Listen to Renderer Events -> Update Logic/Command
    renderer.on('select', (ids: string[]) => {
      sceneGraph.setSelection(ids);
    });

    renderer.on('dragend', (payload: { id: string, x: number, y: number }) => {
      // Find old node to create proper undo command
      const node = sceneGraph.getNodes().find(n => n.id === payload.id);
      if (node) {
        // Execute Move Command
        // Note: For a real drag, we often defer the command to 'dragend'
        const cmd = new MoveNodeCommand(payload.id, node.x, node.y, payload.x, payload.y);
        commandManager.execute(cmd);
      }
    });

    return () => {
      unsubscribeNodes();
      unsubscribeSelection();
      renderer.destroy();
    };
  }, []);

  return (
    <div 
      ref={containerRef} 
      className="flex-1 bg-gray-100 overflow-hidden relative cursor-crosshair"
    >
      {/* Canvas Mount Point */}
    </div>
  );
};