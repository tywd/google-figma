import React from 'react';
import { Toolbar } from './components/Toolbar';
import { PropertiesPanel } from './components/PropertiesPanel';
import { CanvasArea } from './components/CanvasArea';
import { PromptBar } from './components/PromptBar';

const App: React.FC = () => {
  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden">
      <Toolbar />
      <div className="flex flex-1 overflow-hidden relative">
        <CanvasArea />
        <PropertiesPanel />
        <PromptBar />
      </div>
    </div>
  );
};

export default App;