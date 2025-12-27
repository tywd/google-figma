import React, { useEffect, useState } from 'react';
import { sceneGraph } from '../core/SceneGraph';
import { commandManager } from '../core/CommandManager';
import { UpdatePropertyCommand } from '../core/commands';
import { NodeSchema } from '../core/types';

export const PropertiesPanel: React.FC = () => {
  const [selection, setSelection] = useState<string[]>([]);
  const [selectedNode, setSelectedNode] = useState<NodeSchema | null>(null);

  useEffect(() => {
    // Subscribe to selection changes
    const unsubSel = sceneGraph.subscribeSelection((ids) => {
      setSelection(ids);
      if (ids.length === 1) {
        setSelectedNode(sceneGraph.getNodes().find(n => n.id === ids[0]) || null);
      } else {
        setSelectedNode(null);
      }
    });

    // Also need to subscribe to node changes to update panel when dragging
    const unsubNodes = sceneGraph.subscribe((nodes) => {
      if (sceneGraph.getSelection().length === 1) {
         const id = sceneGraph.getSelection()[0];
         setSelectedNode(nodes.find(n => n.id === id) || null);
      }
    });

    return () => {
      unsubSel();
      unsubNodes();
    };
  }, []);

  const handleChange = (prop: keyof NodeSchema, value: any) => {
    if (!selectedNode) return;
    // For numeric inputs
    if (['x', 'y', 'width', 'height', 'radius', 'fontSize'].includes(prop)) {
      value = Number(value);
    }
    
    commandManager.execute(new UpdatePropertyCommand(selectedNode.id, prop, selectedNode[prop], value));
  };

  if (!selectedNode) {
    return (
      <div className="w-64 bg-white border-l border-gray-200 p-4 flex flex-col">
        <p className="text-gray-400 text-sm text-center mt-10">Select an object to edit properties</p>
      </div>
    );
  }

  return (
    <div className="w-64 bg-white border-l border-gray-200 flex flex-col shadow-sm z-10 overflow-y-auto">
      <div className="p-4 border-b border-gray-100">
        <h2 className="font-semibold text-sm text-gray-800 uppercase tracking-wider mb-4">Properties</h2>
        
        <div className="space-y-4">
          {/* Position */}
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-xs text-gray-500 mb-1">X</label>
              <input 
                type="number" 
                value={Math.round(selectedNode.x)} 
                onChange={(e) => handleChange('x', e.target.value)}
                className="w-full text-sm border border-gray-300 rounded px-2 py-1"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Y</label>
              <input 
                type="number" 
                value={Math.round(selectedNode.y)} 
                onChange={(e) => handleChange('y', e.target.value)}
                className="w-full text-sm border border-gray-300 rounded px-2 py-1"
              />
            </div>
          </div>

          {/* Size */}
          {selectedNode.type !== 'TEXT' && (
             <div className="grid grid-cols-2 gap-2">
               {selectedNode.width !== undefined && (
                 <div>
                   <label className="block text-xs text-gray-500 mb-1">W</label>
                   <input 
                     type="number" 
                     value={Math.round(selectedNode.width)} 
                     onChange={(e) => handleChange('width', e.target.value)}
                     className="w-full text-sm border border-gray-300 rounded px-2 py-1"
                   />
                 </div>
               )}
               {selectedNode.height !== undefined && (
                 <div>
                    <label className="block text-xs text-gray-500 mb-1">H</label>
                    <input 
                      type="number" 
                      value={Math.round(selectedNode.height)} 
                      onChange={(e) => handleChange('height', e.target.value)}
                      className="w-full text-sm border border-gray-300 rounded px-2 py-1"
                    />
                 </div>
               )}
               {selectedNode.radius !== undefined && (
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Radius</label>
                    <input 
                      type="number" 
                      value={Math.round(selectedNode.radius)} 
                      onChange={(e) => handleChange('radius', e.target.value)}
                      className="w-full text-sm border border-gray-300 rounded px-2 py-1"
                    />
                  </div>
               )}
             </div>
          )}

          {/* Appearance */}
          <div>
            <label className="block text-xs text-gray-500 mb-1">Fill Color</label>
            <div className="flex items-center space-x-2">
               <input 
                type="color" 
                value={selectedNode.fill} 
                onChange={(e) => handleChange('fill', e.target.value)}
                className="w-8 h-8 rounded border border-gray-200 p-0 overflow-hidden"
              />
              <input 
                type="text" 
                value={selectedNode.fill} 
                onChange={(e) => handleChange('fill', e.target.value)}
                className="flex-1 text-sm border border-gray-300 rounded px-2 py-1 uppercase"
              />
            </div>
          </div>

          {/* Text Properties */}
          {selectedNode.type === 'TEXT' && (
            <div>
              <label className="block text-xs text-gray-500 mb-1">Content</label>
              <textarea 
                value={selectedNode.text} 
                onChange={(e) => handleChange('text', e.target.value)}
                className="w-full text-sm border border-gray-300 rounded px-2 py-1"
                rows={2}
              />
               <label className="block text-xs text-gray-500 mb-1 mt-2">Font Size</label>
               <input 
                type="number" 
                value={selectedNode.fontSize} 
                onChange={(e) => handleChange('fontSize', e.target.value)}
                className="w-full text-sm border border-gray-300 rounded px-2 py-1"
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};