import React from 'react';
import { LayerDescription, ImageShape } from '../types';
import { Layer, CompatibilityResult } from '../lib/layerbase';

export const info: LayerDescription = {
  id: 'batchnorm3d',
  name: '3D Batch Normalization',
  category: 'Normalization',
  concept: 'Extends 2D Batch Normalization to apply across volumetric datasets. Normalizes activations per channel across batch, depth, height, and width coordinates.',
  keyTakeaways: [
    'Stabilizes volumetric learning trajectories (3D volumes, video streams).',
    'Provides crucial gradient stabilization when training large spatial-temporal video blocks.',
    'Tracks moving mean and variance stats across 3D coordinates.'
  ],
  proTips: '3D Batch Normalization requires larger batch sizes to compute clean batch statistics. If you are forced to use a small batch size (e.g., 1 or 2 due to GPU memory limits), try Group Normalization (GroupNorm) instead.',
  forwardEquation: '\\hat{x}_{c} = \\frac{x_c - \\mu_{c,B}}{\\sqrt{\\sigma^2_{c,B} + \\epsilon}}, \\quad y_{c} = \\gamma_c \\hat{x}_c + \\beta_c',
  derivativeEquation: '\\text{Adapts 3D parameters by pooling volumetric local gradients}',
  sizeFormulaHTML: 'D_{out} = D_{in}, \\quad H_{out} = H_{in}, \\quad W_{out} = W_{in}',
  parameterFormula: '\\text{Parameters} = 4 \\cdot C',
  flopFormula: '\\text{FLOPs} = 4 \\cdot (C \\cdot D_{in} \\cdot H_{in} \\cdot W_{in})',
  codePyTorch: `import torch.nn as nn\n\nlayer = nn.BatchNorm3d(num_features=32)`,
  codeTensorFlow: `from tensorflow.keras import layers\n\nlayer = layers.BatchNormalization()`
};

export const InteractiveSimulator = () => {
  return (
    <div className="w-full text-center flex flex-col items-center gap-4 py-3 select-none">
      <div className="relative w-36 h-24 flex items-center justify-center">
        <div className="w-12 h-12 bg-indigo-505/10 border border-indigo-700/60 rounded-xl relative shadow-lg" />
        <div className="w-12 h-12 bg-cyan-705/10 border-l border-b border-cyan-400/80 rounded-xl absolute translate-x-3 translate-y-3" />
      </div>
      
      <p className="text-xs text-zinc-400 max-w-md antialiased leading-relaxed">
        Extends batch normalization steps over entire voxel structures or temporal blocks sequentially. Operates identical arithmetic parameters but maps statistics indices to complete multi-D channels!
      </p>
    </div>
  );
};

export class BatchNorm3DLayer extends Layer {
  calculateOutputShape(inputShape: ImageShape): ImageShape {
    return { ...inputShape };
  }

  checkCompatibility(inputShape: ImageShape): CompatibilityResult {
    if (inputShape.d === undefined) {
      return { 
        compatible: false, 
        reason: `Requires 3D input shape (has no depth/D dimension). Current input is 2D: [ ${inputShape.c}, ${inputShape.h}, ${inputShape.w} ]` 
      };
    }
    return { compatible: true };
  }

  getPytorchCode(shapeBefore: ImageShape, indent: string): string {
    return `nn.BatchNorm3d(${shapeBefore.c})`;
  }

  getTensorFlowCode(shapeBefore: ImageShape, indent: string): string {
    return `layers.BatchNormalization()`;
  }
}

