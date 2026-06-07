import React, { useState, useEffect } from 'react';
import { Sliders, ArrowRight } from 'lucide-react';
import { cn } from '../lib/utils';
import { LayerDescription, ImageShape } from '../types';
import { Layer, CompatibilityResult } from '../lib/layerbase';

export const info: LayerDescription = {
  id: 'conv2d',
  name: '2D Convolution (Conv2D)',
  category: 'Convolutional',
  concept: 'Slides a set of learnable spectral filters across the width and height of a 2D spatial input map. Each filter computes a localized dot product (MAC) to produce a 2D activation grid featuring extracted local characteristics, such as edges, textures, or composite object shapes.',
  keyTakeaways: [
    'Preserves spatial locality by considering neighboring pixels together rather than treating pixels independently.',
    'Enables parameter sharing, which dramatically decreases the number of weights compared to fully-connected layers.',
    'Provides translation equivariance (if a feature shifts in the source, its activation shifts accordingly in the output).',
    'The receptive field increases as layers are stacked, letting deeper layers perceive broader semantic objects.'
  ],
  proTips: 'Choose smaller filters (e.g., 3x3) over larger filters (e.g., 7x7 or 11x11). Stacking multiple 3x3 convolutional layers provides the same effective receptive field with fewer parameters and inserts more non-linear activations.',
  forwardEquation: 'y_{c, i, j} = b_c + \\sum_{m=0}^{C_{in}-1} \\sum_{h=0}^{K-1} \\sum_{w=0}^{K-1} w_{c, m, h, w} \\cdot x_{m, i \\cdot s + h, j \\cdot s + w}',
  derivativeEquation: '\\frac{\\partial L}{\\partial w} = \\sum_{patches} x \\circ \\frac{\\partial L}{\\partial y}, \\quad \\frac{\\partial L}{\\partial x} = \\text{transposed\\_conv}(w, \\frac{\\partial L}{\\partial y})',
  sizeFormulaHTML: 'H_{out} = \\lfloor\\frac{H_{in} + 2P - K}{S}\\rfloor + 1, \\quad W_{out} = \\lfloor\\frac{W_{in} + 2P - K}{S}\\rfloor + 1',
  parameterFormula: '\\text{Parameters} = (K \\cdot K \\cdot C_{in}) \\cdot C_{out} + C_{out}',
  flopFormula: '\\text{FLOPs} = 2 \\cdot H_{out} \\cdot W_{out} \\cdot C_{out} \\cdot (K \\cdot K \\cdot C_{in})',
  codePyTorch: `import torch.nn as nn\n\n# Input tensor shape: [Batch, In_Channels, Height, Width]\nlayer = nn.Conv2d(\n    in_channels=3, \n    out_channels=32, \n    kernel_size=3, \n    stride=1, \n    padding='same'  # or padding=1\n)`,
  codeTensorFlow: `from tensorflow.keras import layers\n\n# Input tensor layout: (Batch, Height, Width, In_Channels)\nlayer = layers.Conv2D(\n    filters=32,\n    kernel_size=3,\n    strides=1,\n    padding='same' # 'same' pads zeroes to keep dimensions\n)`
};

export const InteractiveSimulator = () => {
  const [convSimStep, setConvSimStep] = useState<number>(0);
  const [isConvSimRunning, setIsConvSimRunning] = useState<boolean>(true);

  useEffect(() => {
    let convInterval: any;
    if (isConvSimRunning) {
      convInterval = setInterval(() => {
        setConvSimStep(prev => (prev + 1) % 9);
      }, 1800);
    }
    return () => clearInterval(convInterval);
  }, [isConvSimRunning]);

  const convInputGrid = [
    [1, 1, 1, 0, 0],
    [0, 1, 1, 1, 0],
    [0, 0, 1, 1, 1],
    [0, 0, 0, 1, 1],
    [2, 1, 0, 0, 1]
  ];

  const convKernel = [
    [1, 0, -1],
    [1, 0, -1],
    [1, 0, -1]
  ];

  const stepToCoord = (step: number) => {
    const row = Math.floor(step / 3);
    const col = step % 3;
    return { r: row, c: col };
  };

  const currentConvCoord = stepToCoord(convSimStep);

  let convSumSteps: string[] = [];
  let convTotalValue = 1;
  for (let kr = 0; kr < 3; kr++) {
    for (let kc = 0; kc < 3; kc++) {
      const inVal = convInputGrid[currentConvCoord.r + kr][currentConvCoord.c + kc];
      const wVal = convKernel[kr][kc];
      const prod = inVal * wVal;
      convTotalValue += prod;
      convSumSteps.push(`(${inVal} × ${wVal})`);
    }
  }

  return (
    <div className="w-full flex flex-col lg:flex-row gap-8 items-center">
      <div className="flex-1 flex flex-col gap-4">
        <div className="flex items-center gap-2">
          <Sliders className="w-4.5 h-4.5 text-cyan-400" />
          <span className="text-[11px] font-mono text-zinc-400 uppercase tracking-widest">Sliding Kernel Animation</span>
        </div>

        <div className="bg-zinc-900/75 p-4 rounded-xl border border-zinc-850 font-mono text-xs text-zinc-300">
          <div className="text-zinc-500 text-[10px] uppercase font-bold tracking-wide mb-1 flex justify-between">
            <span>Interactive Step Formula</span>
            <span className="text-cyan-400">Position r:{currentConvCoord.r}, c:{currentConvCoord.c}</span>
          </div>
          <div className="bg-zinc-950 p-2 text-center rounded-lg border border-zinc-900 text-[11px] truncate flex flex-wrap justify-center gap-1">
            {convSumSteps.map((s, idx) => (
              <span key={idx} className={idx === 4 ? "text-cyan-400 font-bold" : ""}>
                {s} {idx < 8 ? '+' : ''}
              </span>
            ))}
            <span className="text-emerald-400 font-bold">+ 1 [Bias]</span>
          </div>
          <div className="text-right mt-2 text-xs flex justify-between items-center pt-2 border-t border-zinc-900">
            <span className="text-zinc-500 font-sans">Accumulated dot product sum</span>
            <span className="font-bold text-sm text-emerald-400">Result: {convTotalValue}</span>
          </div>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => setIsConvSimRunning(!isConvSimRunning)}
            className="px-3 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 hover:border-zinc-700 text-[10.5px] font-mono text-zinc-300 cursor-pointer flex items-center gap-1.5 transition-all"
          >
            {isConvSimRunning ? 'Pause' : 'Play Sliding'}
          </button>
          <button
            onClick={() => setConvSimStep(p => (p + 1) % 9)}
            className="px-3 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 hover:border-zinc-700 text-[10.5px] font-mono text-zinc-300 cursor-pointer flex items-center gap-1.5 transition-all"
          >
            Step manually
          </button>
        </div>
      </div>

      <div className="flex items-center gap-4 select-none shrink-0 border border-zinc-900/40 p-3 rounded-2xl bg-zinc-900/10">
        <div className="flex flex-col items-center gap-1">
          <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest font-mono">INPUT (5x5)</span>
          <div className="grid grid-cols-5 gap-0.5 border border-zinc-800 p-1 rounded-lg bg-zinc-950 shadow-md">
            {convInputGrid.map((row, rIdx) => 
              row.map((val, cIdx) => {
                const isKernelFocussed = 
                  rIdx >= currentConvCoord.r && rIdx < currentConvCoord.r + 3 &&
                  cIdx >= currentConvCoord.c && cIdx < currentConvCoord.c + 3;
                return (
                  <div
                    key={`in-${rIdx}-${cIdx}`}
                    className={cn(
                      "w-6 h-6 rounded flex items-center justify-center text-[10px] font-mono transition-all font-semibold",
                      isKernelFocussed 
                        ? "bg-cyan-500/15 text-cyan-400 border border-cyan-500/50 scale-102" 
                        : "text-zinc-650"
                    )}
                  >
                    {val}
                  </div>
                );
              })
            )}
          </div>
        </div>

        <div className="flex flex-col items-center gap-2">
          <ArrowRight className="w-3.5 h-3.5 text-zinc-500 animate-pulse" />
          <div className="flex flex-col items-center gap-1">
            <span className="text-[9px] font-bold text-cyan-400 uppercase tracking-widest font-mono">Weights (3x3)</span>
            <div className="grid grid-cols-3 gap-0.5 border border-cyan-800/40 p-1 rounded-lg bg-cyan-950/20 shadow-md">
              {convKernel.map((row, r) => 
                row.map((v, c) => (
                  <div key={`k-${r}-${c}`} className="w-5.5 h-5.5 rounded flex items-center justify-center text-[9px] font-mono text-cyan-300 font-bold border border-cyan-950">
                    {v > 0 ? `+${v}` : v}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        <div className="flex flex-col items-center gap-1">
          <span className="text-[9px] font-bold text-emerald-400 uppercase tracking-widest font-mono">Output (3x3)</span>
          <div className="grid grid-cols-3 gap-0.5 border border-emerald-900/30 p-1 rounded-lg bg-zinc-950 shadow-md">
            {Array.from({ length: 9 }).map((_, stepIdx) => {
              const cellCoord = stepToCoord(stepIdx);
              const isCurrentActive = stepIdx === convSimStep;
              const isCalculated = stepIdx <= convSimStep;

              let score = 1;
              for (let kr=0; kr<3; kr++) {
                for (let kc=0; kc<3; kc++) {
                  score += convInputGrid[cellCoord.r+kr][cellCoord.c+kc] * convKernel[kr][kc];
                }
              }

              return (
                <div
                  key={`out-${stepIdx}`}
                  className={cn(
                    "w-6 h-6 rounded flex items-center justify-center text-[10px] font-mono transition-all font-bold border",
                    isCurrentActive
                      ? "bg-emerald-500/20 text-emerald-400 border-emerald-500 scale-110 shadow-lg"
                      : isCalculated
                        ? "bg-zinc-900 text-zinc-350 border-zinc-805"
                        : "bg-zinc-950 text-zinc-800/40 border-zinc-950"
                  )}
                >
                  {isCalculated ? score : '?'}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export class Conv2DLayer extends Layer {
  calculateOutputShape(inputShape: ImageShape): ImageShape {
    const { filters, kernelSize, stride, padding } = this.node.params || {};
    const k = kernelSize || 3;
    const s = stride || 1;
    const p = padding ?? 'valid';

    let outH = inputShape.h;
    let outW = inputShape.w;

    if (p === 'same') {
      outH = Math.ceil(inputShape.h / s);
      outW = Math.ceil(inputShape.w / s);
    } else if (p === 'valid') {
      outH = Math.floor((inputShape.h - k) / s) + 1;
      outW = Math.floor((inputShape.w - k) / s) + 1;
    } else if (typeof p === 'number') {
      outH = Math.floor((inputShape.h + 2 * p - k) / s) + 1;
      outW = Math.floor((inputShape.w + 2 * p - k) / s) + 1;
    }

    return { 
      c: filters || 32, 
      h: Math.max(1, outH), 
      w: Math.max(1, outW) 
    };
  }

  checkCompatibility(inputShape: ImageShape): CompatibilityResult {
    if (inputShape.d !== undefined) {
      return { 
        compatible: false, 
        reason: `Requires 2D input shape (2D layers are incompatible with 3D volume tensors). Add a transition layer first.` 
      };
    }
    const { kernelSize, stride, padding } = this.node.params || {};
    const k = kernelSize || 3;
    const s = stride || 1;
    const p = padding ?? 'valid';

    if (p !== 'same') {
      const pad = typeof p === 'number' ? p : 0;
      const outH = Math.floor((inputShape.h + 2 * pad - k) / s) + 1;
      const outW = Math.floor((inputShape.w + 2 * pad - k) / s) + 1;
      if (outH <= 0 || outW <= 0) {
        return {
          compatible: false,
          reason: `Input shape [ ${inputShape.h} × ${inputShape.w} ] is too small for kernel size ${k} and stride ${s}.`
        };
      }
    }
    return { compatible: true };
  }

  getPytorchCode(shapeBefore: ImageShape, indent: string): string {
    const p = this.node.params || {};
    const outC = p.filters || 32;
    const k = p.kernelSize || 3;
    const s = p.stride || 1;
    const pad = p.padding ?? 'valid';
    
    const padStr = typeof pad === 'number' ? pad.toString() : `'${pad}'`;
    return `nn.Conv2d(in_channels=${shapeBefore.c}, out_channels=${outC}, kernel_size=${k}, stride=${s}, padding=${padStr})`;
  }

  getTensorFlowCode(shapeBefore: ImageShape, indent: string): string {
    const p = this.node.params || {};
    const outC = p.filters || 32;
    const k = p.kernelSize || 3;
    const s = p.stride || 1;
    const pad = p.padding ?? 'valid';
    
    const padStr = typeof pad === 'number' ? `'valid'` : `'${pad}'`;
    let res = `layers.Conv2D(filters=${outC}, kernel_size=${k}, strides=${s}, padding=${padStr})`;
    
    if (typeof pad === 'number' && pad > 0) {
      res = `tf.keras.Sequential([\n${indent}    layers.ZeroPadding2D(padding=(${p.padding}, ${p.padding})),\n${indent}    ${res}\n${indent}])`;
    }
    return res;
  }
}

