import React, { useState } from 'react';
import { useNetwork } from '../context/NetworkContext';
import { exportPytorchCode } from '../lib/pytorchExporter';
import { exportTensorFlowCode } from '../lib/tensorflowExporter';
import { X, Copy, Check } from 'lucide-react';

interface ExportModalProps {
  onClose: () => void;
}

export function ExportModal({ onClose }: ExportModalProps) {
  const { layers, inputShape } = useNetwork();
  const [copied, setCopied] = useState(false);
  const [framework, setFramework] = useState<'pytorch' | 'tensorflow'>('pytorch');
  
  const code = framework === 'pytorch' 
    ? exportPytorchCode(layers, inputShape) 
    : exportTensorFlowCode(layers, inputShape);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-950/80 backdrop-blur-sm p-4">
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl shadow-2xl w-full max-w-2xl flex flex-col max-h-[85vh] overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-800">
          <div className="flex gap-4">
            <button 
              className={`text-sm tracking-wide font-semibold uppercase pb-1 transition-colors ${framework === 'pytorch' ? 'text-indigo-400 border-b-2 border-indigo-400' : 'text-zinc-500 hover:text-zinc-300'}`}
              onClick={() => setFramework('pytorch')}
            >
              PyTorch
            </button>
            <button 
              className={`text-sm tracking-wide font-semibold uppercase pb-1 transition-colors ${framework === 'tensorflow' ? 'text-[#ff6f00] border-b-2 border-[#ff6f00]' : 'text-zinc-500 hover:text-zinc-300'}`}
              onClick={() => setFramework('tensorflow')}
            >
              TensorFlow
            </button>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800 rounded-md transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="p-5 flex-1 overflow-y-auto custom-scrollbar bg-[#0d0d10] relative">
          <button
            onClick={handleCopy}
            className="absolute top-7 right-7 p-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-md transition-colors shadow-sm flex items-center justify-center border border-zinc-700/50"
            title="Copy code"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
          </button>
          
          <pre className="text-xs font-mono text-zinc-300 leading-relaxed overflow-x-auto selection:bg-indigo-500/30">
            <code>{code}</code>
          </pre>
        </div>
      </div>
    </div>
  );
}
