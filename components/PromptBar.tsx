import React, { useState } from 'react';
import { Sparkles, Loader2 } from 'lucide-react';
import { generateDesign } from '../services/geminiService';
import { commandManager } from '../core/CommandManager';
import { AddNodeCommand } from '../core/commands';

export const PromptBar: React.FC = () => {
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim() || loading) return;

    setLoading(true);
    try {
      const newNodes = await generateDesign(prompt);
      // Batch add as individual commands for now, or could make a BatchCommand
      newNodes.forEach(node => {
        commandManager.execute(new AddNodeCommand(node));
      });
      setPrompt('');
    } catch (err) {
      alert("Failed to generate design. Check console or API Key.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="absolute bottom-8 left-1/2 -translate-x-1/2 w-full max-w-lg z-20">
      <form onSubmit={handleGenerate} className="relative group">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full blur opacity-25 group-hover:opacity-40 transition duration-200"></div>
        <div className="relative flex items-center bg-white rounded-full shadow-xl border border-gray-200 p-2 pl-4">
            <Sparkles className={`w-5 h-5 mr-3 ${loading ? 'text-gray-400' : 'text-purple-600'}`} />
            <input 
                type="text" 
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Describe a design (e.g., 'Three red circles arranged horizontally')"
                className="flex-1 outline-none text-gray-700 bg-transparent placeholder-gray-400"
                disabled={loading}
            />
            <button 
                type="submit"
                disabled={loading}
                className="ml-2 bg-black text-white px-4 py-2 rounded-full text-sm font-medium hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed flex items-center transition-colors"
            >
                {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                Generate
            </button>
        </div>
      </form>
    </div>
  );
};