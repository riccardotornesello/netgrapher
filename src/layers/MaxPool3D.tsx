import React from "react";
import {
  LayerDescription,
  ImageShape,
  LayerStats,
  Layer,
  CompatibilityResult,
} from "../types";

const description: LayerDescription = {
  id: "maxpool3d",
  name: "3D Max Pooling (MaxPool3D)",
  category: "Pooling",
  concept:
    "Slides a spatial-temporal 3D cube window across volumes and returns the peak maximum value. Downsamples width, height, and depth simultaneously.",
  keyTakeaways: [
    "Performs aggressive structural downsampling in voxel systems.",
    "Reduces temporal framerates or video resolutions to capture long-range interactions.",
    "Carries zero parameters and keeps only peak features across the volumetric patch.",
  ],
  proTips:
    "Be careful when pooling extensively along the depth axis for videos. Pooling fast temporal signals too early can destroy essential high-frequency action details needed to decode motion classes.",
  forwardEquation:
    "y_{c, d, i, j} = \\max_{z, h, w} \\{ x_{c, d \\cdot s + z, i \\cdot s + h, j \\cdot s + w} \\}",
  derivativeEquation:
    "\\text{Propagates target derivative exclusively to peak voxels indices}",
  sizeFormulaHTML:
    "D_{out} = \\lfloor\\frac{D_{in} - K}{S}\\rfloor + 1, \\quad H_{out} = \\lfloor\\frac{H_{in} - K}{S}\\rfloor + 1, \\quad W_{out} = \\lfloor\\frac{W_{in} - K}{S}\\rfloor + 1",
  parameterFormula: "\\text{Parameters} = 0",
  flopFormula:
    "\\text{FLOPs} = D_{out} \\cdot H_{out} \\cdot W_{out} \\cdot C_{in} \\cdot (K \\cdot K \\cdot K - 1)",
  codePyTorch: `import torch.nn as nn\n\nlayer = nn.MaxPool3d(kernel_size=2, stride=2)`,
  codeTensorFlow: `from tensorflow.keras import layers\n\nlayer = layers.MaxPooling3D(pool_size=2, strides=2)`,
};

const MaxPool3DDemo: React.FC = () => (
  <div className="w-full text-center flex flex-col items-center gap-4 py-3 select-none">
    <div className="relative w-36 h-24 flex items-center justify-center">
      <div className="w-14 h-14 bg-cyan-500/10 border border-cyan-800 rounded-lg -rotate-12 absolute shadow-lg" />
      <div className="w-10 h-10 bg-indigo-500/20 border-l border-b border-indigo-400/80 rounded absolute translate-x-4 translate-y-4" />
    </div>

    <p className="text-xs text-zinc-400 max-w-md antialiased leading-relaxed">
      Analogous to 2D max pooling but aggregates maximum spatial pixels across
      3D blocks ($K \times K \times K$). Essential to scale down large
      volumetric files cleanly without adding training weight cost!
    </p>
  </div>
);

export class MaxPool3DLayer extends Layer {
  static description: LayerDescription = description;
  static demos: React.ComponentType[] = [MaxPool3DDemo];

  calculateOutputShape(inputShape: ImageShape): ImageShape {
    const p = this.node.params || {};
    const k = p.poolSize || 2;
    const s = p.stride || 2;
    const inD = inputShape.d || 1;
    const outD = Math.floor((inD - k) / s) + 1;
    const outH = Math.floor((inputShape.h - k) / s) + 1;
    const outW = Math.floor((inputShape.w - k) / s) + 1;
    return {
      c: inputShape.c,
      d: Math.max(1, outD),
      h: Math.max(1, outH),
      w: Math.max(1, outW),
    };
  }

  checkCompatibility(inputShape: ImageShape): CompatibilityResult {
    if (inputShape.d === undefined) {
      return {
        compatible: false,
        reason: `Requires 3D input shape (has no depth/D dimension). Current input is 2D: [ ${inputShape.c}, ${inputShape.h}, ${inputShape.w} ]`,
      };
    }
    const p = this.node.params || {};
    const k = p.poolSize || 2;
    const s = p.stride || 2;
    const inD = inputShape.d || 1;
    const outD = Math.floor((inD - k) / s) + 1;
    const outH = Math.floor((inputShape.h - k) / s) + 1;
    const outW = Math.floor((inputShape.w - k) / s) + 1;
    if (outD <= 0 || outH <= 0 || outW <= 0) {
      return {
        compatible: false,
        reason: `Input shape [ ${inD} × ${inputShape.h} × ${inputShape.w} ] is too small for pooling size ${k} and stride ${s}.`,
      };
    }
    return { compatible: true };
  }

  computeStats(inShape: ImageShape, outShape: ImageShape): LayerStats {
    const p = this.node.params || {};
    const k = p.poolSize ?? 2;
    const s = p.stride ?? 2;
    const { c: cout, h: hout, w: wout } = outShape;
    const dout = outShape.d ?? 1;
    const din = inShape.d ?? 1;

    const flopCount = cout * dout * hout * wout * (k * k * k - 1);

    return {
      parameterCount: 0,
      flopCount,
      parameterFormula: `0 (Pooling layers carry no learnable parameters)`,
      flopFormula: `${(cout * dout * hout * wout).toLocaleString()} sub-elements × (${k}³ - 1) = ${flopCount.toLocaleString()} FLOPs`,
      dimensionFormulaH: `H_out = ⌊(${inShape.h} - ${k}) / ${s}⌋ + 1 = ${hout}`,
      dimensionFormulaW: `W_out = ⌊(${inShape.w} - ${k}) / ${s}⌋ + 1 = ${wout}`,
      dimensionFormulaD: `D_out = ⌊(${din} - ${k}) / ${s}⌋ + 1 = ${dout}`,
      explanation: `Performs max-pooling along 3D volumetric dimensions (${k}×${k}×${k}) to reduce data dimensionality across depth, width, and height.`,
    };
  }

  getPytorchCode(_shapeBefore: ImageShape, _indent: string): string {
    const p = this.node.params || {};
    const k = p.poolSize || 2;
    const s = p.stride || 2;
    return `nn.MaxPool3d(kernel_size=${k}, stride=${s})`;
  }

  getTensorFlowCode(_shapeBefore: ImageShape, _indent: string): string {
    const p = this.node.params || {};
    const k = p.poolSize || 2;
    const s = p.stride || 2;
    return `layers.MaxPooling3D(pool_size=${k}, strides=${s})`;
  }
}
