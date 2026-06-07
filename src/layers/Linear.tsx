import React, { useState } from "react";
import { Sliders } from "lucide-react";
import { LayerDescription, ImageShape } from "../types";
import { Layer, CompatibilityResult } from "../lib/layerbase";

export const info: LayerDescription = {
  id: "linear",
  name: "Linear (Dense / Fully Connected)",
  category: "Linear & Structural",
  concept:
    "Connects every single input node to every single output node. Performs a matrix multiplication of inputs by a learnable weight matrix, then adds a bias vector.",
  keyTakeaways: [
    "Typically placed at the end of deep convolutional networks to aggregate local high-level features for class predictions.",
    "Enables complex global combinations across all spatial coordinate zones.",
    "Highly parameter-dense; requires a flattened 1D feature vector as its input.",
  ],
  proTips:
    "Because fully connected layers contain so many parameters, they are highly prone to overfitting. Guard them with Dropout or replace them with Global Average Pooling (GAP) before classifier projections.",
  forwardEquation: "\\mathbf{y} = \\mathbf{W} \\mathbf{x} + \\mathbf{b}",
  derivativeEquation:
    "\\frac{\\partial L}{\\partial \\mathbf{x}} = \\mathbf{W}^T \\frac{\\partial L}{\\partial \\mathbf{y}}, \\quad \\frac{\\partial L}{\\partial \\mathbf{W}} = \\frac{\\partial L}{\\partial \\mathbf{y}} \\mathbf{x}^T",
  sizeFormulaHTML:
    "\\text{Shape}_{out} = [\\text{Batch}, \\text{Out\\_Features}]",
  parameterFormula:
    "\\text{Parameters} = \\text{In\\_Features} \\cdot \\text{Out\\_Features} + \\text{Out\\_Features}",
  flopFormula:
    "\\text{FLOPs} = 2 \\cdot \\text{In\\_Features} \\cdot \\text{Out\\_Features}",
  codePyTorch: `import torch.nn as nn\n\n# 512 input channels mapped to 10 class logits\nlayer = nn.Linear(in_features=512, out_features=10)`,
  codeTensorFlow: `from tensorflow.keras import layers\n\nlayer = layers.Dense(units=10)`,
};

export const InteractiveSimulator = () => {
  const [linInputWeights, setLinInputWeights] = useState<number[]>([
    0.5, -0.8, 1.2, -0.3,
  ]);

  return (
    <div className="w-full flex flex-col lg:flex-row gap-8 items-center">
      <div className="flex-1 flex flex-col gap-4">
        <div className="flex items-center gap-2">
          <Sliders className="w-4.5 h-4.5 text-cyan-400" />
          <span className="text-[11px] font-mono text-zinc-400 uppercase tracking-widest">
            Neuron Connection Playground
          </span>
        </div>

        <p className="text-[11.5px] leading-relaxed text-zinc-400">
          Calculates a global dot product for every neuron. Adjust the weights
          index representing connections from the input vector to the target
          layer node unit:
        </p>

        <div className="grid grid-cols-4 gap-2 text-center">
          {linInputWeights.map((w, wIdx) => (
            <div
              key={wIdx}
              className="bg-zinc-900/50 p-2 rounded-xl border border-zinc-850"
            >
              <span className="text-[8.5px] text-zinc-500 block font-mono">
                Weight {wIdx}
              </span>
              <input
                type="number"
                step="0.1"
                value={w}
                onChange={(e) => {
                  const newW = [...linInputWeights];
                  newW[wIdx] = Number(e.target.value);
                  setLinInputWeights(newW);
                }}
                className="w-14 bg-zinc-950 border border-zinc-800 text-xs font-mono text-cyan-400 font-bold text-center rounded p-1 mt-1 shrink-0"
              />
            </div>
          ))}
        </div>

        <div className="bg-zinc-900/60 p-3.5 rounded-xl border border-zinc-850 font-mono text-xs text-zinc-300">
          <div className="text-[9.5px] text-zinc-500 uppercase font-bold tracking-wide">
            Interactive Formula outcome
          </div>
          <div className="mt-2 text-[10.5px] flex justify-between items-center text-zinc-350 flex-wrap gap-1.5">
            <span>
              Log: (1.0×{linInputWeights[0]}) + (2.0×{linInputWeights[1]}) +
              (-1.0×{linInputWeights[2]}) + (3.0×{linInputWeights[3]}) + 0.5
              [bias]
            </span>
            <span className="text-emerald-400 font-bold">
              Result:{" "}
              {(
                1.0 * linInputWeights[0] +
                2.0 * linInputWeights[1] -
                1.0 * linInputWeights[2] +
                3.0 * linInputWeights[3] +
                0.5
              ).toFixed(2)}
            </span>
          </div>
        </div>
      </div>

      <svg className="w-48 h-40 border border-zinc-855 rounded-xl bg-zinc-950 pointer-events-none p-2 shrink-0">
        <g transform="translate(10, 10)">
          {[20, 50, 80, 110].map((coordY, idx) => (
            <circle
              key={`n1-${idx}`}
              cx="20"
              cy={coordY}
              r="6"
              fill="#4f46e5"
            />
          ))}
          {[25, 65, 105].map((coordYOut, outIdx) =>
            [20, 50, 80, 110].map((coordYIn, inIdx) => (
              <line
                key={`l-${inIdx}-${outIdx}`}
                x1="26"
                y1={coordYIn}
                x2="114"
                y2={coordYOut}
                stroke="#3f3f46"
                strokeWidth="0.8"
                opacity="0.4"
                className="hover:stroke-cyan-500 transition-colors"
              />
            )),
          )}
          {[25, 65, 105].map((coordYOut, idx) => (
            <circle
              key={`n2-${idx}`}
              cx="120"
              cy={coordYOut}
              r="6"
              fill="#06b6d4"
              className="animate-pulse"
            />
          ))}
        </g>
      </svg>
    </div>
  );
};

export class LinearLayer extends Layer {
  calculateOutputShape(inputShape: ImageShape): ImageShape {
    return { c: this.node.params?.outFeatures || 128, h: 1, w: 1 };
  }

  checkCompatibility(inputShape: ImageShape): CompatibilityResult {
    if (inputShape.h > 1 || inputShape.w > 1 || inputShape.d !== undefined) {
      const dims =
        inputShape.d !== undefined
          ? `${inputShape.c} × ${inputShape.d} × ${inputShape.h} × ${inputShape.w}`
          : `${inputShape.c} × ${inputShape.h} × ${inputShape.w}`;
      return {
        compatible: false,
        reason: `Linear layer expects a 1D flat tensor shape. Received: [ ${dims} ]. Add a Flatten layer first.`,
      };
    }
    return { compatible: true };
  }

  getPytorchCode(shapeBefore: ImageShape, indent: string): string {
    const p = this.node.params || {};
    const outF = p.outFeatures || 128;
    const inF = shapeBefore.c * shapeBefore.h * shapeBefore.w;
    return `nn.Linear(in_features=${inF}, out_features=${outF})`;
  }

  getTensorFlowCode(shapeBefore: ImageShape, indent: string): string {
    const p = this.node.params || {};
    const outF = p.outFeatures || 128;
    return `layers.Dense(units=${outF})`;
  }
}
