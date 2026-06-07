import React, { useState } from 'react';
import { Sliders } from 'lucide-react';
import { cn } from '../lib/utils';
import { LayerDescription, ImageShape } from '../types';
import { Layer, CompatibilityResult } from '../lib/layerbase';

export const info: LayerDescription = {
  id: 'flatten',
  name: 'Tensor Flattening (Flatten)',
  category: 'Linear & Structural',
  concept: 'Reshapes multi-dimensional tensors (e.g., channels × height × width) into unified, linear 1D dense vectors. This establishes compatibility between convolutional and fully-connected layer inputs.',
  keyTakeaways: [
    'Strictly structural; does not modify values or execute arithmetic operations.',
    'Typically bridges the exit of spatial feature extraction blocks and the entry of fully-connected classification blocks.',
    'Flattens from index 1 (channel/spatial dimensions) to preserve batch indices.'
  ],
  proTips: 'Always make sure you compute the flat dimension correctly. For a feature map of shape (C, H, W) entering Flatten, the output vector length is C × H × W.',
  forwardEquation: 'y_{\\text{index}} = x_{c, h, w} \\quad \\text{where } \\text{index} = c \\cdot (H \\cdot W) + h \\cdot W + w',
  derivativeEquation: '\\frac{\\partial L}{\\partial x_{c,h,w}} = \\frac{\\partial L}{\\partial y_{\\text{index}}} \\quad (\\text{Direct identity derivative forwarding})',
  sizeFormulaHTML: '\\text{Vector Length} = C \\cdot D \\cdot H \\cdot W',
  parameterFormula: '\\text{Parameters} = 0',
  flopFormula: '\\text{FLOPs} = 0 \\quad (\\text{Only modifies memory indexing view})',
  codePyTorch: `import torch.nn as nn\n\nlayer = nn.Flatten()`,
  codeTensorFlow: `from tensorflow.keras import layers\n\nlayer = layers.Flatten()`
};

export const InteractiveSimulator = () => {
  const [isFlattened, setIsFlattened] = useState<boolean>(false);

  const flattenSourceMap = [
    { val: 12, pos: 'R:0 C:0', color: 'text-indigo-400 bg-indigo-500/10' },
    { val: 8, pos: 'R:0 C:1', color: 'text-cyan-400 bg-cyan-500/10' },
    { val: 15, pos: 'R:0 C:2', color: 'text-teal-400 bg-teal-500/10' },
    { val: 4, pos: 'R:1 C:0', color: 'text-yellow-400 bg-yellow-500/10' },
    { val: 92, pos: 'R:1 C:1', color: 'text-pink-400 bg-pink-500/10' },
    { val: 3, pos: 'R:1 C:2', color: 'text-emerald-400 bg-emerald-500/10' }
  ];

  return (
    <div className="w-full flex flex-col lg:flex-row gap-8 items-center">
      <div className="flex-1 flex flex-col gap-4">
        <div className="flex items-center gap-2">
          <Sliders className="w-4.5 h-4.5 text-cyan-400" />
          <span className="text-[11px] font-mono text-zinc-400 uppercase tracking-widest">Dimension Reshaping</span>
        </div>

        <p className="text-[11.5px] leading-relaxed text-zinc-400">
          Collapses multi-dimensional configurations (like heights, widths, coordinate planes) into a unified contiguous sequence. Click below to experience matrix flattening:
        </p>

        <button
          onClick={() => setIsFlattened(!isFlattened)}
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-505 rounded-xl font-semibold text-xs text-white cursor-pointer select-none transition-all flex items-center justify-center gap-1.5"
        >
          {isFlattened ? 'Reset Structure to 2D Output' : 'Fold Layer: Flatten into 1D Vector'}
        </button>
      </div>

      <div className="w-56 h-48 border border-zinc-850 p-4 rounded-xl bg-zinc-950 flex flex-col items-center justify-center gap-4 shrink-0 font-mono text-[9px]">
        {!isFlattened ? (
          <div className="flex flex-col items-center gap-2.5">
            <span className="text-zinc-500 font-bold uppercase tracking-wider">Spatial 2D Tensor Map</span>
            <div className="grid grid-cols-3 gap-1 p-1.5 border border-zinc-800 rounded bg-zinc-900">
              {flattenSourceMap.map((cell, idx) => (
                <div key={idx} className={cn("w-7.5 h-7.5 rounded flex items-center justify-center font-bold text-[10px]", cell.color)}>
                  {cell.val}
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2.5 w-full">
            <span className="text-cyan-400 font-bold uppercase tracking-wider">Continuous Linearized Vector</span>
            <div className="flex flex-wrap gap-1 p-1 px-2 border border-cyan-800/40 rounded bg-cyan-950/10 justify-center">
              {flattenSourceMap.map((cell, idx) => (
                <div key={idx} className={cn("w-6 h-6 rounded flex items-center justify-center font-bold text-[9px] animate-scale-in", cell.color)}>
                  {cell.val}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export class FlattenLayer extends Layer {
  calculateOutputShape(inputShape: ImageShape): ImageShape {
    const dStr = inputShape.d ? inputShape.d : 1;
    return { c: inputShape.c * dStr * inputShape.h * inputShape.w, h: 1, w: 1 };
  }

  checkCompatibility(inputShape: ImageShape): CompatibilityResult {
    return { compatible: true };
  }

  getPytorchCode(shapeBefore: ImageShape, indent: string): string {
    return `nn.Flatten()`;
  }

  getTensorFlowCode(shapeBefore: ImageShape, indent: string): string {
    return `layers.Flatten()`;
  }
}

