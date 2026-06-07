import React, { useState, useEffect } from 'react';
import { Sliders, RefreshCw, ArrowRight } from 'lucide-react';
import { cn } from '../lib/utils';
import { LayerDescription, ImageShape } from '../types';
import { Layer, CompatibilityResult } from '../lib/layerbase';

export const info: LayerDescription = {
  id: 'maxpool2d',
  name: '2D Max Pooling (MaxPool2D)',
  category: 'Pooling',
  concept: 'Slides a 2D window across spatial activations and keeps only the maximum value inside each patch. This downsamples the representations, reducing height and width dimensions.',
  keyTakeaways: [
    'Dramatically reduces memory footprints and calculation burden in subsequent network layers.',
    'Grants shift invariance — small movements of features do not alter the pooled outputs.',
    'Helps abstract representations, filtering out high-frequency noise and keeping dominant signals.',
    'Carries zero parameters; operates merely as a static sampling index calculation.'
  ],
  proTips: 'Recent architectures (e.g., ConvNeXt, ResNet-D) often replace maxpooling with strided convolutions. Strided convolutions let the network learn *how* to downsample instead of using a fixed max function.',
  forwardEquation: 'y_{c, i, j} = \\max_{h, w} \\{ x_{c, i \\cdot s + h, j \\cdot s + w} \\}',
  derivativeEquation: '\\frac{\\partial L}{\\partial x_{idx}} = \\frac{\\partial L}{\\partial y} \\quad (\\text{gradient goes entirely to the index of maximum value})',
  sizeFormulaHTML: 'H_{out} = \\lfloor\\frac{H_{in} - K}{S}\\rfloor + 1, \\quad W_{out} = \\lfloor\\frac{W_{in} - K}{S}\\rfloor + 1',
  parameterFormula: '\\text{Parameters} = 0',
  flopFormula: '\\text{FLOPs} = H_{out} \\cdot W_{out} \\cdot C_{in} \\cdot (K \\cdot K - 1) \\quad (\\text{Compares window cells})',
  codePyTorch: `import torch.nn as nn\n\n# Downsample by 2\nlayer = nn.MaxPool2d(kernel_size=2, stride=2)`,
  codeTensorFlow: `from tensorflow.keras import layers\n\nlayer = layers.MaxPooling2D(pool_size=2, strides=2)`
};

export const InteractiveSimulator = () => {
  const [poolSimStep, setPoolSimStep] = useState<number>(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setPoolSimStep(prev => (prev + 1) % 4);
    }, 1800);
    return () => clearInterval(interval);
  }, []);

  const poolInputGrid = [
    [12, 20, 30, 0],
    [8, 12, 2, 15],
    [34, 45, 11, 8],
    [1, 9, 21, 13]
  ];

  const poolCoord = [
    { r: 0, c: 0, color: 'border-cyan-400 bg-cyan-950/20' },
    { r: 0, c: 2, color: 'border-indigo-400 bg-indigo-950/20' },
    { r: 2, c: 0, color: 'border-teal-400 bg-teal-950/20' },
    { r: 2, c: 2, color: 'border-yellow-400 bg-yellow-950/20' }
  ];

  const getPoolSubMax = (step: number) => {
    const coord = poolCoord[step];
    const vals = [
      poolInputGrid[coord.r][coord.c],
      poolInputGrid[coord.r][coord.c+1],
      poolInputGrid[coord.r+1][coord.c],
      poolInputGrid[coord.r+1][coord.c+1]
    ];
    return Math.max(...vals);
  };

  const poolOutputGrid = [
    [getPoolSubMax(0), getPoolSubMax(1)],
    [getPoolSubMax(2), getPoolSubMax(3)]
  ];

  return (
    <div className="w-full flex flex-col lg:flex-row gap-8 items-center">
      <div className="flex-1 flex flex-col gap-4">
        <div className="flex items-center gap-2">
          <Sliders className="w-4.5 h-4.5 text-cyan-400" />
          <span className="text-[11px] font-mono text-zinc-400 uppercase tracking-widest">Downsampling Window</span>
        </div>

        <p className="text-[11.5px] leading-relaxed text-zinc-400">
          Selects exclusively the absolute peak (Maximum) from the current localized window coordinate. Observe the reduction in frame dimension:
        </p>

        <div className="bg-zinc-900/60 p-3.5 rounded-xl border border-zinc-850 font-mono text-xs text-zinc-300">
          <div className="text-[9.5px] text-zinc-500 uppercase font-bold tracking-wide flex justify-between">
            <span>Interactive Step: {poolSimStep + 1} of 4</span>
            <span className="text-cyan-400">Selected values: max([values])</span>
          </div>

          <div className="mt-2.5 bg-zinc-950 p-2 rounded-lg border border-zinc-900 text-[10.5px]">
            {(() => {
              const coord = poolCoord[poolSimStep];
              const vals = [
                poolInputGrid[coord.r][coord.c],
                poolInputGrid[coord.r][coord.c+1],
                poolInputGrid[coord.r+1][coord.c],
                poolInputGrid[coord.r+1][coord.c+1]
              ];
              return (
                <div className="flex items-center justify-between">
                  <span>Scanning patch {"->"} [ {vals.join(', ')} ]</span>
                  <span className="text-cyan-400 font-bold ml-1">Max value found: {Math.max(...vals)}</span>
                </div>
              );
            })()}
          </div>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => setPoolSimStep(p => (p + 1) % 4)}
            className="px-3 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-805 border border-zinc-800 hover:border-zinc-700 text-[10.5px] font-mono text-zinc-300 cursor-pointer flex items-center gap-1.5 transition-all w-full justify-center"
          >
            <RefreshCw className="w-3.5 h-3.5" /> Advance sampling frame
          </button>
        </div>
      </div>

      <div className="flex items-center gap-5 select-none shrink-0 border border-zinc-900/40 p-3.5 rounded-2xl bg-zinc-900/10">
        <div className="flex flex-col items-center gap-1">
          <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest font-mono">INPUT (4x4)</span>
          <div className="grid grid-cols-4 gap-0.5 border border-zinc-800 p-1 rounded-lg bg-zinc-950 relative">
            {poolInputGrid.map((row, r) => 
              row.map((val, c) => {
                const activeCoord = poolCoord[poolSimStep];
                const isActivePatch = 
                  r >= activeCoord.r && r < activeCoord.r + 2 &&
                  c >= activeCoord.c && c < activeCoord.c + 2;
                
                const patchVals = isActivePatch ? [
                  poolInputGrid[activeCoord.r][activeCoord.c],
                  poolInputGrid[activeCoord.r][activeCoord.c+1],
                  poolInputGrid[activeCoord.r+1][activeCoord.c],
                  poolInputGrid[activeCoord.r+1][activeCoord.c+1]
                ] : [];
                const isMaxInPatch = isActivePatch && val === Math.max(...patchVals);

                return (
                  <div
                    key={`p-${r}-${c}`}
                    className={cn(
                      "w-6.5 h-6.5 rounded flex items-center justify-center text-[10.5px] font-mono font-semibold transition-all border",
                      isActivePatch 
                        ? (isMaxInPatch 
                            ? "bg-cyan-500/20 text-cyan-300 border-cyan-400 scale-102 font-bold" 
                            : "bg-cyan-500/5 text-cyan-600 border-dashed border-cyan-805/40")
                        : "text-zinc-650 border-transparent"
                    )}
                  >
                    {val}
                  </div>
                );
              })
            )}
          </div>
        </div>

        <ArrowRight className="w-4 h-4 text-zinc-650" />

        <div className="flex flex-col items-center gap-1">
          <span className="text-[9px] font-bold text-cyan-400 uppercase tracking-widest font-mono">SAMPLING (2x2)</span>
          <div className="grid grid-cols-2 gap-0.5 border border-cyan-800/40 p-1 rounded-lg bg-cyan-950/20 shadow-md">
            {poolOutputGrid.map((row, r) => 
              row.map((v, c) => {
                const indexStep = r * 2 + c;
                const isCurrentActive = indexStep === poolSimStep;
                const isFilled = indexStep <= poolSimStep;
                return (
                  <div
                    key={`po-${r}-${c}`}
                    className={cn(
                      "w-6.5 h-6.5 rounded flex items-center justify-center text-[10.5px] font-mono font-bold border",
                      isCurrentActive 
                        ? "bg-cyan-500/25 text-cyan-205 border-cyan-400 scale-108 shadow-lg"
                        : isFilled
                          ? "bg-zinc-900 border-zinc-805 text-zinc-350"
                          : "bg-zinc-950 border-zinc-950 text-zinc-800/30"
                    )}
                  >
                    {isFilled ? v : '?'}
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export class MaxPool2DLayer extends Layer {
  calculateOutputShape(inputShape: ImageShape): ImageShape {
    const p = this.node.params || {};
    const k = p.poolSize || 2;
    const s = p.stride || 2;
    const outH = Math.floor((inputShape.h - k) / s) + 1;
    const outW = Math.floor((inputShape.w - k) / s) + 1;
    return { c: inputShape.c, h: Math.max(1, outH), w: Math.max(1, outW) };
  }

  checkCompatibility(inputShape: ImageShape): CompatibilityResult {
    if (inputShape.d !== undefined) {
      return { 
        compatible: false, 
        reason: `Requires 2D input shape (2D layers are incompatible with 3D volume tensors). Add a transition layer first.` 
      };
    }
    const p = this.node.params || {};
    const k = p.poolSize || 2;
    const s = p.stride || 2;
    const outH = Math.floor((inputShape.h - k) / s) + 1;
    const outW = Math.floor((inputShape.w - k) / s) + 1;
    if (outH <= 0 || outW <= 0) {
      return {
        compatible: false,
        reason: `Input shape [ ${inputShape.h} × ${inputShape.w} ] is too small for pooling size ${k} and stride ${s}.`
      };
    }
    return { compatible: true };
  }

  getPytorchCode(shapeBefore: ImageShape, indent: string): string {
    const p = this.node.params || {};
    const k = p.poolSize || 2;
    const s = p.stride || 2;
    return `nn.MaxPool2d(kernel_size=${k}, stride=${s})`;
  }

  getTensorFlowCode(shapeBefore: ImageShape, indent: string): string {
    const p = this.node.params || {};
    const k = p.poolSize || 2;
    const s = p.stride || 2;
    return `layers.MaxPooling2D(pool_size=${k}, strides=${s})`;
  }
}

