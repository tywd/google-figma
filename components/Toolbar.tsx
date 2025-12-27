import React from 'react';
import { Square, Circle as CircleIcon, Type, MousePointer, Undo, Redo } from 'lucide-react';
import { commandManager } from '../core/CommandManager';
import { sceneGraph } from '../core/SceneGraph';
import { AddNodeCommand } from '../core/commands';
import { NodeType } from '../core/types';
import { generateId } from '../utils/id';

export const Toolbar: React.FC = () => {
  
  const handleAdd = (type: NodeType) => {
    const id = generateId();
    const center = { x: 400, y: 300 }; // Ideally use Viewport center
    
    let node: any = {
      id,
      type,
      x: center.x,
      y: center.y,
      fill: '#3b82f6',
    };

    if (type === NodeType.RECTANGLE) {
      node = { ...node, width: 100, height: 100 };
    } else if (type === NodeType.CIRCLE) {
      node = { ...node, radius: 50 };
    } else if (type === NodeType.TEXT) {
      node = { ...node, text: 'Hello', fontSize: 24, fill: '#000000' };
    }

    commandManager.execute(new AddNodeCommand(node));
  };

  return (
    <div className="h-14 bg-white border-b border-gray-200 flex items-center px-4 justify-between shadow-sm z-10">
      <div className="flex items-center space-x-2">
        <button className="p-2 hover:bg-gray-100 rounded text-gray-700">
          <MousePointer size={18} />
        </button>
        <div className="w-px h-6 bg-gray-300 mx-2" />
        <button onClick={() => handleAdd(NodeType.RECTANGLE)} className="p-2 hover:bg-gray-100 rounded text-gray-700" title="Rectangle">
          <Square size={18} />
        </button>
        <button onClick={() => handleAdd(NodeType.CIRCLE)} className="p-2 hover:bg-gray-100 rounded text-gray-700" title="Circle">
          <CircleIcon size={18} />
        </button>
        <button onClick={() => handleAdd(NodeType.TEXT)} className="p-2 hover:bg-gray-100 rounded text-gray-700" title="Text">
          <Type size={18} />
        </button>
      </div>

      <div className="flex items-center space-x-2">
        <button onClick={() => commandManager.undo()} className="p-2 hover:bg-gray-100 rounded text-gray-700" title="Undo (Ctrl+Z)">
          <Undo size={18} />
        </button>
        <button onClick={() => commandManager.redo()} className="p-2 hover:bg-gray-100 rounded text-gray-700" title="Redo (Ctrl+Y)">
          <Redo size={18} />
        </button>
      </div>
    </div>
  );
};