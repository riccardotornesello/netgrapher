import React from 'react';
import { LayerDescription, ImageShape } from '../types';
import { Layer, CompatibilityResult } from '../lib/layerbase';

export const info: LayerDescription = {
  id: 'conv3d',
  name: '3D Convolution (Conv3D)',
  category: 'Convolutional',
  concept: 'Extends 2D convolutions by adding a depth dimension. Moves a 3D filter volume along three axes (width, height, and depth/time) to detect voxel patterns or temporal progression cues.',
  keyTakeaways: [
    'Crucial for video processing (Height × Width × Frames) to capture motion features across successive frames.',
    'Spatially analyzes volumetric biological signals (e.g., MRI scans, CT voxels, fluid dynamics simulations).',
    'Filters are four-dimensional tensors matching depth, height, width, and input channel spaces.'
  ],
  proTips: '3D convolutions are computationally intensive! Consider using "Pseudo-3D" convolutions (Conv 2D + Conv 1D) to decouple spatial parsing from temporal scanning, reducing parameters by up to 50%.',
  forwardEquation: 'y_{c, d, i, j} = b_c + \\sum_{m} \\sum_{z,h,w} w_{c, m, z, h, w} \\cdot x_{m, d \\cdot s + z, i \\cdot s + h, j \\cdot s + w}',
  derivativeEquation: '\\text{Gradients are computed via 3D spatial convolutions on } \\partial L / \\partial y',
  sizeFormulaHTML: 'D_{out} = \\lfloor\\frac{D_{in} + 2P - K}{S}\\rfloor + 1, \\quad H_{out} = \\lfloor\\frac{H_{in} + 2P - K}{S}\\rfloor + 1, \\quad W_{out} = \\lfloor\\frac{W_{in} + 2P - K}{S}\\rfloor + 1',
  parameterFormula: '\\text{Parameters} = (K \\cdot K \\cdot K \\cdot C_{in}) \\cdot C_{out} + C_{out}',
  flopFormula: '\\text{FLOPs} = 2 \\cdot D_{out} \\cdot H_{out} \\cdot W_{out} \\cdot C_{out} \\cdot (K \\cdot K \\cdot K \\cdot C_{in})',
  codePyTorch: `import torch.nn as nn\n\n# Shape layout: [Batch, Channels, Depth, Height, Width]\nlayer = nn.Conv3d(\n    in_channels=16, \n    out_channels=64, \n    kernel_size=3, \n    stride=1, \n    padding=1\n)`,
  codeTensorFlow: `from tensorflow.keras import layers\n\n# Shape layout: (Batch, Depth, Height, Width, Channels)\nlayer = layers.Conv3D(\n    filters=64,\n    kernel_size=3,\n    strides=1,\n    padding='same'\n)`
};

export const InteractiveSimulator = () => {
  return (
    <div className="w-full text-center flex flex-col items-center gap-4 py-3 select-none">
      <div className="relative w-40 h-28 flex justify-center items-center">
        <div className="absolute top-0 flex border border-cyan-500/20 rounded bg-cyan-900/10 p-2 w-28 h-20 -rotate-3 hover:translate-x-1.5 transition-transform">
          <span className="text-[9px] text-zinc-500 font-mono">Frame 1</span>
        </div>
        <div className="absolute top-2 flex border border-cyan-500/30 rounded bg-cyan-950/20 p-2 w-28 h-20 rotate-3 translate-x-2 translate-y-2 hover:translate-x-4 transition-transform z-10">
          <span className="text-[9px] text-cyan-400 font-mono font-bold">Frame 2 [Scanning...]</span>
        </div>
        <div className="absolute top-4 flex border border-cyan-500/20 rounded bg-cyan-900/10 p-2 w-28 h-20 rotate-6 translate-x-4 translate-y-4 hover:translate-x-5.5 transition-transform z-20">
          <span className="text-[9px] text-zinc-500 font-mono">Frame 3</span>
        </div>
      </div>
      
      <p className="text-xs text-zinc-400 max-w-md antialiased leading-relaxed">
        3D convolutions slice across chronological stacks or coordinate voxel indices simultaneously. Explore the 3D Space parameters in the 3D tab to inspect visual volumetric volume rendering of the neural connections!
      </p>
    </div>
  );
};

export class Conv3DLayer extends Layer {
  calculateOutputShape(inputShape: ImageShape): ImageShape {
    const { filters, kernelSize, stride, padding } = this.node.params || {};
    const k = kernelSize || 3;
    const s = stride || 1;
    const p = padding ?? 'valid';

    let inD = inputShape.d || 1;
    let outD = inD;
    let outH = inputShape.h;
    let outW = inputShape.w;

    if (p === 'same') {
      outD = Math.ceil(inD / s);
      outH = Math.ceil(inputShape.h / s);
      outW = Math.ceil(inputShape.w / s);
    } else if (p === 'valid') {
      outD = Math.floor((inD - k) / s) + 1;
      outH = Math.floor((inputShape.h - k) / s) + 1;
      outW = Math.floor((inputShape.w - k) / s) + 1;
    } else if (typeof p === 'number') {
      outD = Math.floor((inD + 2 * p - k) / s) + 1;
      outH = Math.floor((inputShape.h + 2 * p - k) / s) + 1;
      outW = Math.floor((inputShape.w + 2 * p - k) / s) + 1;
    }

    return { 
      c: filters || 32, 
      d: Math.max(1, outD),
      h: Math.max(1, outH), 
      w: Math.max(1, outW) 
    };
  }

  checkCompatibility(inputShape: ImageShape): CompatibilityResult {
    if (inputShape.d === undefined) {
      return { 
        compatible: false, 
        reason: `Requires 3D input shape (has no depth/D dimension). Current input is 2D: [ ${inputShape.c}, ${inputShape.h}, ${inputShape.w} ]` 
      };
    }
    const { kernelSize, stride, padding } = this.node.params || {};
    const k = kernelSize || 3;
    const s = stride || 1;
    const p = padding ?? 'valid';
    const inD = inputShape.d || 1;

    if (p !== 'same') {
      const pad = typeof p === 'number' ? p : 0;
      const outD = Math.floor((inD + 2 * pad - k) / s) + 1;
      const outH = Math.floor((inputShape.h + 2 * pad - k) / s) + 1;
      const outW = Math.floor((inputShape.w + 2 * pad - k) / s) + 1;
      if (outD <= 0 || outH <= 0 || outW <= 0) {
        return {
          compatible: false,
          reason: `Input shape [ ${inD} × ${inputShape.h} × ${inputShape.w} ] is too small for kernel size ${k} and stride ${s}.`
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
    return `nn.Conv3d(in_channels=${shapeBefore.c}, out_channels=${outC}, kernel_size=${k}, stride=${s}, padding=${padStr})`;
  }

  getTensorFlowCode(shapeBefore: ImageShape, indent: string): string {
    const p = this.node.params || {};
    const outC = p.filters || 32;
    const k = p.kernelSize || 3;
    const s = p.stride || 1;
    const pad = p.padding ?? 'valid';
    
    const padStr = typeof pad === 'number' ? `'valid'` : `'${pad}'`;
    let res = `layers.Conv3D(filters=${outC}, kernel_size=${k}, strides=${s}, padding=${padStr})`;
    
    if (typeof pad === 'number' && pad > 0) {
      res = `tf.keras.Sequential([\n${indent}    layers.ZeroPadding3D(padding=(${p.padding}, ${p.padding}, ${p.padding})),\n${indent}    ${res}\n${indent}])`;
    }
    return res;
  }
}

