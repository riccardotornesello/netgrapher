import React, { useState } from "react";
import { Sliders } from "lucide-react";
import {
  LayerDescription,
  ImageShape,
  LayerStats,
  Layer,
  CompatibilityResult,
} from "../types";

const description: LayerDescription = {
  id: "batchnorm2d",
  name: "2D Batch Normalization",
  category: "Normalization",
  concept:
    "Normalizes activations across the batch dimension per channel. Subtracts the mean and divides by the standard deviation, then applies a learnable scale (gamma) and shift (beta).",
  keyTakeaways: [
    "Mitigates Internal Covariate Shift, enabling more stable, faster training.",
    "Allows for higher learning rates without risking gradient explosions.",
    "Acts as a light regularizer, reducing dependencies on precise initialization scales.",
    "Maintains rolling averages of mean and variance during training for use during model inference.",
  ],
  proTips:
    "Always place Batch Normalization *before* your activation function (like ReLU) and *after* linear operations (like Conv2D). This keeps your activation input scales healthy and predictable.",
  forwardEquation:
    "\\hat{x} = \\frac{x - \\mu_B}{\\sqrt{\\sigma_B^2 + \\epsilon}}, \\quad y = \\gamma \\widehat{x} + \\beta",
  derivativeEquation:
    "\\text{Propagates derivative through mean and variance formulas to adapt gamma and beta}",
  sizeFormulaHTML:
    "H_{out} = H_{in}, \\quad W_{out} = W_{in}, \\quad C_{out} = C_{in}",
  parameterFormula:
    "\\text{Parameters} = 4 \\cdot C \\quad (\\gamma, \\beta, \\text{static mean}, \\text{static variance})",
  flopFormula:
    "\\text{FLOPs} = 4 \\cdot (C \\cdot H_{in} \\cdot W_{in}) \\quad (\\text{Shift, scale, normalize steps})",
  codePyTorch: `import torch.nn as nn\n\n# 64 channels standard normalization\nlayer = nn.BatchNorm2d(num_features=64)`,
  codeTensorFlow: `from tensorflow.keras import layers\n\nlayer = layers.BatchNormalization()`,
};

const BatchNorm2DDemo: React.FC = () => {
  const [bnParams, setBnParams] = useState({ gamma: 1.0, beta: 0.0 });
  const [bnBatchInputs] = useState<number[]>([12, 18, 5, 25]);

  const bnMean =
    bnBatchInputs.reduce((a, b) => a + b, 0) / bnBatchInputs.length;
  const bnVariance =
    bnBatchInputs.reduce((a, b) => a + Math.pow(b - bnMean, 2), 0) /
    bnBatchInputs.length;
  const bnEps = 0.001;

  const bnNormalizeValue = (val: number) => {
    const normalized = (val - bnMean) / Math.sqrt(bnVariance + bnEps);
    return normalized * bnParams.gamma + bnParams.beta;
  };

  return (
    <div className="w-full flex flex-col lg:flex-row gap-8 items-center">
      <div className="flex-1 flex flex-col gap-3">
        <div className="flex items-center gap-2">
          <Sliders className="w-4.5 h-4.5 text-cyan-400" />
          <span className="text-[11px] font-mono text-zinc-400 uppercase tracking-widest">
            Covariate Shift Stabilizer
          </span>
        </div>

        <div className="grid grid-cols-2 gap-2 text-center text-[10.5px]">
          <div className="bg-zinc-900/30 p-2 rounded-lg border border-zinc-850">
            <span className="text-zinc-500">Scale Factor (Gamma γ)</span>
            <input
              type="number"
              step="0.1"
              value={bnParams.gamma}
              onChange={(e) =>
                setBnParams((p) => ({ ...p, gamma: Number(e.target.value) }))
              }
              className="w-16 bg-zinc-950 border border-zinc-850 rounded text-center p-0.5 mt-1 font-mono text-cyan-400 font-bold cursor-pointer"
            />
          </div>

          <div className="bg-zinc-900/30 p-2 rounded-lg border border-zinc-850">
            <span className="text-zinc-500">Shift Factor (Beta β)</span>
            <input
              type="number"
              step="0.1"
              value={bnParams.beta}
              onChange={(e) =>
                setBnParams((p) => ({ ...p, beta: Number(e.target.value) }))
              }
              className="w-16 bg-zinc-950 border border-zinc-850 rounded text-center p-0.5 mt-1 font-mono text-cyan-400 font-bold cursor-pointer"
            />
          </div>
        </div>

        <p className="text-[10.5px] leading-relaxed text-zinc-500">
          Input Batch values:{" "}
          <strong className="text-zinc-400">
            [ {bnBatchInputs.join(", ")} ]
          </strong>
          . Computes live batch parameters: Mean ={" "}
          <strong className="text-cyan-400 font-mono">
            {bnMean.toFixed(1)}
          </strong>
          , Variance ={" "}
          <strong className="text-cyan-400 font-mono">
            {bnVariance.toFixed(1)}
          </strong>
          .
        </p>
      </div>

      <div className="w-56 h-48 border border-zinc-850 p-3.5 rounded-xl bg-zinc-950 flex flex-col justify-center gap-1.5 shrink-0 font-mono text-[9px]">
        <span className="text-zinc-500 uppercase font-bold tracking-wide border-b border-zinc-900 pb-1.5 block">
          Step-By-Step Scaling Output
        </span>
        {bnBatchInputs.map((val, idx) => {
          const normalized = bnNormalizeValue(val);
          return (
            <div
              key={idx}
              className="flex justify-between items-center text-[10px] bg-zinc-900/40 p-1 px-1.5 rounded border border-zinc-900/40"
            >
              <span className="text-zinc-350 font-bold">
                Input {val} {"->"}
              </span>
              <span className="text-emerald-400 font-bold">
                Norm: {normalized.toFixed(2)}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export class BatchNorm2DLayer extends Layer {
  static description: LayerDescription = description;
  static demos: React.ComponentType[] = [BatchNorm2DDemo];

  calculateOutputShape(inputShape: ImageShape): ImageShape {
    return { ...inputShape };
  }

  checkCompatibility(inputShape: ImageShape): CompatibilityResult {
    if (inputShape.d !== undefined) {
      return {
        compatible: false,
        reason: `Requires 2D input shape (2D layers are incompatible with 3D volume tensors). Add a transition layer first.`,
      };
    }
    return { compatible: true };
  }

  computeStats(inShape: ImageShape, outShape: ImageShape): LayerStats {
    const cin = inShape.c;
    const parameterCount = cin * 4;
    const flopCount = cin * inShape.h * inShape.w * 4;

    return {
      parameterCount,
      flopCount,
      parameterFormula: `${cin} channels × 4 params/channel = ${parameterCount.toLocaleString()}`,
      flopFormula: `${(cin * inShape.h * inShape.w).toLocaleString()} elements × 4 (normalize + scale) = ${flopCount.toLocaleString()} FLOPs`,
      dimensionFormulaH: `H_out = H_in = ${outShape.h}`,
      dimensionFormulaW: `W_out = W_in = ${outShape.w}`,
      explanation: `Normalizes the active feature maps over batches per channel coordinate. Helps avoid internal covariate shift, allowing faster learning rates and robust stability.`,
    };
  }

  getPytorchCode(shapeBefore: ImageShape, _indent: string): string {
    return `nn.BatchNorm2d(${shapeBefore.c})`;
  }

  getTensorFlowCode(_shapeBefore: ImageShape, _indent: string): string {
    return `layers.BatchNormalization()`;
  }
}
