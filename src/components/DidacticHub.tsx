import React, { useState } from 'react';
import { 
  GraduationCap, 
  BookOpen, 
  Sigma, 
  Code, 
  Play, 
  ChevronRight, 
  Sparkles, 
  Info, 
  Calculator,
  Copy,
  Check
} from 'lucide-react';
import { cn } from '../lib/utils';
import { Latex } from './Latex';
import { LAYERS } from '../layers';

export function DidacticHub() {
  const [selectedLayerId, setSelectedLayerId] = useState<string>('conv2d');
  const [copiedCodeTab, setCopiedCodeTab] = useState<'pytorch' | 'tensorflow'>('pytorch');
  const [isCopied, setIsCopied] = useState<boolean>(false);

  const activeLayer = LAYERS[selectedLayerId]?.info || LAYERS.conv2d.info;
  const InteractiveSimulator = LAYERS[selectedLayerId]?.InteractiveSimulator;

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  return (
    <div className="flex flex-col xl:flex-row gap-6 mx-auto max-w-7xl animate-fade-in relative">
      
      {/* Category Sidebar Navigation Selector */}
      <div className="w-full xl:w-72 shrink-0 flex flex-col gap-3">
        <div className="bg-zinc-900/40 p-4 rounded-xl border border-zinc-800/40 backdrop-blur-md">
          <div className="flex items-center gap-2 mb-3">
            <GraduationCap className="w-5 h-5 text-cyan-400" />
            <h3 className="text-sm font-bold tracking-wider text-zinc-100 uppercase">Educational Hub</h3>
          </div>
          <p className="text-[11px] leading-relaxed text-zinc-400">
            Dive deep into the structural math, real-time sliding visualizations, interactive playgrounds, and copyable snippets of neural layers.
          </p>
        </div>

        {/* Navigation Layers Panel */}
        <div className="bg-zinc-900/30 border border-zinc-855 rounded-2xl p-2.5 flex flex-col gap-1 overflow-hidden">
          {(['Convolutional', 'Activation', 'Pooling', 'Linear & Structural', 'Regularization', 'Normalization'] as const).map(category => (
            <div key={category} className="mb-2">
              <span className="text-[9.5px] uppercase tracking-widest text-zinc-500 font-bold px-3 py-1 block">
                {category}
              </span>
              <div className="flex flex-col gap-0.5 mt-1">
                {Object.values(LAYERS)
                  .map(m => m.info)
                  .filter(l => l.category === category)
                  .map(layer => (
                    <button
                      key={layer.id}
                      onClick={() => setSelectedLayerId(layer.id)}
                      className={cn(
                        "w-full px-3 py-2 rounded-xl text-left text-[11.5px] font-medium transition-all cursor-pointer flex items-center justify-between group",
                        selectedLayerId === layer.id
                          ? "bg-cyan-955/40 border border-cyan-800/50 text-cyan-300"
                          : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/40 border border-transparent"
                      )}
                    >
                      <div className="flex items-center gap-2">
                        <span className={cn(
                          "w-1.5 h-1.5 rounded-full",
                          selectedLayerId === layer.id ? "bg-cyan-400 animate-pulse" : "bg-zinc-700 group-hover:bg-zinc-400"
                        )} />
                        <span>{layer.name.split(' (')[0]}</span>
                      </div>
                      <ChevronRight className={cn(
                        "w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-all",
                        selectedLayerId === layer.id ? "opacity-100 text-cyan-400" : "text-zinc-500"
                      )} />
                    </button>
                  ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Main Educational Canvas content panel */}
      <div className="flex-1 flex flex-col gap-6 min-w-0">
        
        {/* Core Header info banner */}
        <div className="bg-zinc-900/40 border border-zinc-800/40 p-6 rounded-2xl backdrop-blur-md relative overflow-hidden flex flex-col gap-3">
          <div className="absolute top-0 right-0 w-48 h-48 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none" />
          
          <div className="flex flex-wrap items-center justify-between gap-3 relative z-10">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-cyan-500/10 border-cyan-500/20 text-cyan-400 rounded-xl shadow-inner">
                <BookOpen className="w-6 h-6" />
              </div>
              <div>
                <span className="text-[10px] tracking-widest uppercase font-mono text-cyan-500 font-bold">
                  {activeLayer.category} Layer
                </span>
                <h2 className="text-xl font-bold text-zinc-100 mt-0.5">{activeLayer.name}</h2>
              </div>
            </div>
            
            <span className="px-2.5 py-1 bg-zinc-950 border border-zinc-805 rounded-lg text-xs font-mono text-zinc-400">
              type: <span className="text-cyan-400 font-bold">{activeLayer.id}</span>
            </span>
          </div>

          <p className="text-zinc-300/95 leading-relaxed text-[13px] relative z-10 antialiased font-normal">
            {activeLayer.concept}
          </p>

          {/* Mathematical Formulation (Forward Pass) */}
          <div className="bg-zinc-950/60 border border-zinc-850 rounded-xl p-4 my-3.5 flex flex-col items-center justify-center gap-2 select-all relative z-10">
            <span className="text-[9px] font-mono text-cyan-400 font-bold uppercase tracking-wider self-start flex items-center gap-1.5">
              <Sigma className="w-3.5 h-3.5 text-cyan-400" /> Mathematical Formulation (Forward Pass)
            </span>
            <div className="w-full text-center overflow-x-auto py-1 text-zinc-100 text-sm font-semibold select-all scrollbar-thin">
              <Latex math={activeLayer.forwardEquation} block />
            </div>
          </div>

          <div className="flex flex-col sm:flex-row divide-y sm:divide-y-0 sm:divide-x divide-zinc-800/40 border-t border-zinc-800/30 pt-4 mt-1 relative z-10 gap-4 sm:gap-0">
            <div className="flex-1 sm:pr-4 flex gap-2.5 items-start">
              <Sparkles className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">Key Takeaways</h4>
                <ul className="list-disc pl-4 mt-1.5 space-y-1 text-[11px] text-zinc-400 leading-relaxed">
                  {activeLayer.keyTakeaways.map((takeaway, idx) => (
                    <li key={idx}>{takeaway}</li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="flex-1 sm:pl-4 pt-4 sm:pt-0 flex gap-2.5 items-start">
              <Info className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">Designer Pro Tip</h4>
                <p className="text-[11px] text-zinc-400/90 leading-relaxed mt-2 italic">
                  "{activeLayer.proTips}"
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Dynamic & Interactive Simulator Animations playground */}
        {InteractiveSimulator && (
          <div className="bg-zinc-900/40 border border-zinc-800/40 p-6 rounded-2xl backdrop-blur-md">
            <div className="flex items-center justify-between mb-5 select-none">
              <div className="flex items-center gap-2">
                <Play className="w-4.5 h-4.5 text-cyan-400" />
                <h3 className="text-zinc-205 font-semibold text-xs uppercase tracking-wide">Interactive Visualizer & Step Simulator</h3>
              </div>
              
              <span className="text-[10px] font-mono text-indigo-400 bg-indigo-505/5 px-2.5 py-1 rounded-lg border border-indigo-900/25">
                Live calculation feedback
              </span>
            </div>

            <div className="bg-zinc-950 p-5 rounded-xl border border-zinc-900 min-h-[280px] flex flex-col justify-center items-center">
              <InteractiveSimulator />
            </div>
          </div>
        )}

        {/* Detailed Mathematical equations breakdown panel */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Section: Size and Dimensional Evolution */}
          <div className="bg-zinc-900/40 border border-zinc-800/40 p-5 rounded-2xl backdrop-blur-md flex flex-col gap-4">
            <div className="flex items-center gap-2 border-b border-zinc-800/40 pb-3">
              <Calculator className="w-4.5 h-4.5 text-cyan-400" />
              <h3 className="text-zinc-200 font-semibold text-xs uppercase tracking-wide">Dimensional Equations</h3>
            </div>

            <div className="flex-1 flex flex-col gap-3 justify-center">
              <div className="p-4 bg-zinc-950 rounded-xl border border-zinc-900 flex flex-col gap-2 font-mono">
                <span className="text-[10px] text-zinc-500 uppercase font-bold tracking-wider">Spatial Output Dimensions</span>
                <div className="text-xs font-semibold text-cyan-305 bg-zinc-900 p-2.5 rounded-lg text-center mt-1 select-all overflow-x-auto border border-zinc-850">
                  <Latex math={activeLayer.sizeFormulaHTML} block />
                </div>
              </div>

              <div className="p-3.5 bg-zinc-900/20 border border-zinc-800/30 rounded-xl text-[11px] leading-relaxed text-zinc-400">
                <h4 className="font-bold text-zinc-400 uppercase text-[9px] tracking-wider mb-1">Parameters Dictionary</h4>
                <ul className="list-disc pl-4 space-y-1 mt-1 text-[10px]">
                  <li><strong className="text-zinc-300">H_in, W_in, D_in</strong>: Input dimensions (height, width, depth).</li>
                  <li><strong className="text-zinc-300">P</strong>: Padding count (zero filling boundary frames).</li>
                  <li><strong className="text-zinc-300">K</strong>: Kernel / slide window spatial sizes.</li>
                  <li><strong className="text-zinc-300">S</strong>: Stride progression step increment.</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Section: Backpropagation Derivatives path */}
          <div className="bg-zinc-900/40 border border-zinc-800/40 p-5 rounded-2xl backdrop-blur-md flex flex-col gap-4">
            <div className="flex items-center gap-2 border-b border-zinc-800/40 pb-3">
              <Sigma className="w-4.5 h-4.5 text-indigo-400" />
              <h3 className="text-zinc-200 font-semibold text-xs uppercase tracking-wide">Machine Learning Calculus</h3>
            </div>

            <div className="flex-1 flex flex-col gap-3 justify-center">
              {/* Trainable Param calculus */}
              <div className="bg-zinc-950 p-2.5 border border-zinc-900 rounded-xl font-mono text-[10px]">
                <span className="text-zinc-500 font-bold uppercase tracking-wider block">Weights Parameter Equation</span>
                <span className="text-xs font-bold text-zinc-300 mt-1 block px-2 py-1.5 bg-zinc-900/60 rounded border border-zinc-855">
                  <Latex math={activeLayer.parameterFormula} block />
                </span>
              </div>
              
              {/* Computational intensity FLOPs calculus */}
              <div className="bg-zinc-950 p-2.5 border border-zinc-900 rounded-xl font-mono text-[10px]">
                <span className="text-zinc-500 font-bold uppercase tracking-wider block">Estimated FLOPs Equation</span>
                <span className="text-xs font-bold text-zinc-300 mt-1 block px-2 py-1.5 bg-zinc-900/60 rounded border border-zinc-855">
                  <Latex math={activeLayer.flopFormula} block />
                </span>
              </div>

              {/* Gradient equation */}
              <div className="bg-zinc-950 p-2.5 border border-zinc-900 rounded-xl font-mono text-[10px]">
                <span className="text-indigo-400 font-bold uppercase tracking-wider block">Backward Path Partial derivatives</span>
                <span className="text-[10px] text-zinc-400 mt-1 leading-relaxed block px-2 py-1.5 bg-zinc-900/60 rounded border border-zinc-855 break-words">
                  <Latex math={activeLayer.derivativeEquation} block />
                </span>
              </div>
            </div>
          </div>

        </div>

        {/* Modular Framework Code Examples Copyable Tabs */}
        <div className="bg-zinc-900/40 border border-zinc-800/40 p-6 rounded-2xl backdrop-blur-md">
          <div className="flex items-center justify-between mb-4 border-b border-zinc-800/40 pb-3">
            <div className="flex items-center gap-2">
              <Code className="w-4.5 h-4.5 text-cyan-400" />
              <h3 className="text-zinc-200 font-semibold text-xs uppercase tracking-wide">Functional Framework Snippets</h3>
            </div>

            {/* Snippet segment selection bar */}
            <div className="flex items-center gap-1 bg-zinc-950 border border-zinc-800 rounded-lg p-0.5 select-none h-7">
              <button
                onClick={() => setCopiedCodeTab('pytorch')}
                className={cn(
                  "px-2 py-1 rounded text-[9.5px] font-mono font-bold cursor-pointer transition-all",
                  copiedCodeTab === 'pytorch' ? "bg-cyan-950/40 text-cyan-305 border border-cyan-800/40" : "text-zinc-500 hover:text-zinc-350 border border-transparent"
                )}
              >
                PyTorch (Python)
              </button>
              
              <button
                onClick={() => setCopiedCodeTab('tensorflow')}
                className={cn(
                  "px-2 py-1 rounded text-[9.5px] font-mono font-bold cursor-pointer transition-all",
                  copiedCodeTab === 'tensorflow' ? "bg-cyan-950/40 text-cyan-305 border border-cyan-800/40" : "text-zinc-500 hover:text-zinc-350 border border-transparent"
                )}
              >
                TensorFlow (Keras)
              </button>
            </div>
          </div>

          <div className="relative">
            {/* Copy button float right */}
            <button
              onClick={() => handleCopyCode(copiedCodeTab === 'pytorch' ? activeLayer.codePyTorch : activeLayer.codeTensorFlow)}
              className="absolute top-3 right-3 p-2 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 hover:border-zinc-700 text-zinc-400 hover:text-zinc-200 rounded-lg cursor-pointer transition-colors z-20 flex items-center gap-1.5 text-[10.5px] font-mono"
              title="Copy code to clipboard"
            >
              {isCopied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-400">Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy</span>
                </>
              )}
            </button>

            {/* Render Syntax Container code */}
            <pre className="p-5 bg-zinc-950 rounded-xl border border-zinc-900 font-mono text-xs text-indigo-200/90 leading-relaxed overflow-x-auto pr-24 max-h-56 filter drop-shadow">
              <code>
                {copiedCodeTab === 'pytorch' ? activeLayer.codePyTorch : activeLayer.codeTensorFlow}
              </code>
            </pre>
          </div>
        </div>

      </div>
    </div>
  );
}
