import React, { useState } from 'react';
import { Sliders } from 'lucide-react';
import { cn } from '../lib/utils';

export function evalActivation(type: string, x: number): number {
  switch (type) {
    case 'relu':
      return Math.max(0, x);
    case 'sigmoid':
      return 1 / (1 + Math.exp(-x));
    case 'tanh':
      return Math.tanh(x);
    case 'leaky_relu':
      return x >= 0 ? x : 0.01 * x;
    case 'elu':
      return x >= 0 ? x : 1.0 * (Math.exp(x) - 1);
    case 'gelu': {
      const c = Math.sqrt(2 / Math.PI);
      const tanhArg = c * (x + 0.044715 * Math.pow(x, 3));
      return 0.5 * x * (1 + Math.tanh(tanhArg));
    }
    default:
      return x;
  }
}

export const generateSvgPath = (type: string) => {
  let points: string[] = [];
  for (let i = -10; i <= 10; i += 0.5) {
    const outVal = evalActivation(type, i);
    const px = 96 + (i / 10) * 96;
    let py = 64; 
    if (type === 'sigmoid') {
      py = 120 - outVal * 100;
    } else if (type === 'tanh') {
      py = 64 - outVal * 48;
    } else {
      py = 64 - outVal * 5.4;
    }
    const pyClamped = Math.max(-10, Math.min(138, py));
    points.push(`${px},${pyClamped}`);
  }
  return `M ${points.join(' L ')}`;
};

export const ActivationSimulator = ({ type, name }: { type: string; name: string }) => {
  const [reluInputValue, setReluInputValue] = useState<number>(-3);

  return (
    <div className="w-full flex flex-col lg:flex-row gap-8 items-center animate-in fade-in duration-300">
      <div className="flex-1 flex flex-col gap-4">
        <div className="flex items-center gap-2">
          <Sliders className="w-4.5 h-4.5 text-cyan-400" />
          <span className="text-[11px] font-mono text-zinc-400 uppercase tracking-widest">{name} Visualization</span>
        </div>

        <p className="text-[11.5px] leading-relaxed text-zinc-400">
          Input raw values entering neural connections fluctuate randomly between negative and positive territory. Drag the slider to observe how the {name} curve transforms values:
        </p>

        <div className="flex items-center gap-3 bg-zinc-900/75 p-3.5 rounded-xl border border-zinc-850">
          <span className="text-xs font-mono text-zinc-500">-10.0</span>
          <input 
            type="range" 
            min="-10" 
            max="10" 
            step="0.1"
            value={reluInputValue} 
            onChange={(e) => setReluInputValue(Number(e.target.value))} 
            className="flex-1 h-1.5 bg-zinc-850 rounded-lg appearance-none cursor-pointer accent-cyan-400"
          />
          <span className="text-xs font-mono text-zinc-500">+10.0</span>
        </div>

        <div className="grid grid-cols-2 gap-3 text-center">
          <div className="bg-zinc-900/50 p-2.5 rounded-xl border border-zinc-855">
            <span className="text-[9px] text-zinc-500 font-bold uppercase tracking-wide block">Raw Input (x)</span>
            <span className={cn(
              "text-lg font-bold font-mono mt-1 block",
              reluInputValue < 0 ? "text-red-400/80" : "text-emerald-400"
            )}>
              {reluInputValue.toFixed(2)}
            </span>
          </div>

          <div className="bg-zinc-900/50 p-2.5 rounded-xl border border-zinc-855 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-8 h-8 bg-cyan-400/5 rounded-full blur-md" />
            <span className="text-[9px] text-cyan-400 font-bold uppercase tracking-wide block">Output f(x)</span>
            <span className="text-lg font-bold text-cyan-300 font-mono mt-1 block">
              {evalActivation(type, reluInputValue).toFixed(4)}
            </span>
          </div>
        </div>
      </div>

      <div className="w-64 h-52 border border-zinc-850 p-4 rounded-xl bg-zinc-950 flex flex-col items-center justify-between shrink-0 font-mono">
        <span className="text-[9px] text-zinc-500 uppercase tracking-wide text-center">
          {type === 'relu' && 'Graph: y = max(0, x)'}
          {type === 'sigmoid' && 'Graph: y = 1 / (1 + e^-x)'}
          {type === 'tanh' && 'Graph: y = Tanh(x)'}
          {type === 'leaky_relu' && 'Graph: y = max(0.01x, x)'}
          {type === 'elu' && 'Graph: y = ELU(x)'}
          {type === 'gelu' && 'Graph: y = GELU(x)'}
        </span>
        <div className="w-full h-32 relative border-b border-l border-zinc-800">
          <div className="absolute bottom-0 left-[50%] top-0 w-[0.5px] bg-zinc-800/40" />
          <div className="absolute left-0 right-0 top-[50%] h-[0.5px] bg-zinc-800/40" />

          <svg className="w-full h-full overflow-visible">
            <path
              d={generateSvgPath(type)}
              fill="none"
              stroke="#06b6d4"
              strokeWidth="3"
              strokeLinecap="round"
            />
            
            {(() => {
              const outVal = evalActivation(type, reluInputValue);
              const px = 96 + (reluInputValue / 10) * 96;
              let py = 64;
              if (type === 'sigmoid') {
                py = 120 - outVal * 100;
              } else if (type === 'tanh') {
                py = 64 - outVal * 48;
              } else {
                py = 64 - outVal * 5.4;
              }
              return (
                <circle
                  cx={px}
                  cy={Math.max(-10, Math.min(138, py))}
                  r="5.5"
                  fill="#22d3ee"
                  stroke="#0891b2"
                  strokeWidth="1.5"
                  className="animate-pulse shadow-xl"
                />
              );
            })()}
          </svg>
        </div>
        <div className="w-full flex justify-between text-[8px] text-zinc-650 shrink-0 text-center">
          <span>Negative Inputs</span>
          <span className="text-cyan-400">Positive Inputs</span>
        </div>
      </div>
    </div>
  );
};
