import React, { useState } from "react";
import { Sliders, Dice5 } from "lucide-react";
import { cn } from "../lib/utils";
import {
  LayerDescription,
  ImageShape,
  LayerStats,
  Layer,
  CompatibilityResult,
} from "../types";

const description: LayerDescription = {
  id: "dropout",
  name: "Dropout",
  category: "Regularization",
  concept:
    "Randomly sets a fraction of activations to zero during training. This forces the network to learn redundant representations, preventing reliance on any single fragile neuron configuration.",
  keyTakeaways: [
    "A powerful regularization technique that prevents co-adaptation among neurons.",
    "Operates exclusively during training. During testing/evaluation, all neurons are kept active, and outputs are scaled.",
    "Acts as an efficient approximation of training a massive ensemble of slightly different networks.",
  ],
  proTips:
    'For convolutional features, standard Dropout can be weak because adjacent pixels are highly correlated. Try "Spatial Dropout" (Dropout2d) instead, which drops complete activation channels instead of isolated pixels.',
  forwardEquation:
    "y = \\frac{1}{1-p} \\cdot \\mathbf{M} \\odot x, \\quad M_i \\sim \\text{Bernoulli}(1-p)",
  derivativeEquation:
    "\\frac{\\partial L}{\\partial x} = \\frac{1}{1-p} \\cdot \\mathbf{M} \\odot \\frac{\\partial L}{\\partial y}",
  sizeFormulaHTML:
    "H_{out} = H_{in}, \\quad W_{out} = W_{in}, \\quad C_{out} = C_{in}",
  parameterFormula: "\\text{Parameters} = 0",
  flopFormula:
    "\\text{FLOPs} = C_{in} \\cdot H_{in} \\cdot W_{in} \\quad (\\text{Bernoulli mask selection})",
  codePyTorch: `import torch.nn as nn\n\n# Drop 50% of the activations randomly\nlayer = nn.Dropout(p=0.5)`,
  codeTensorFlow: `from tensorflow.keras import layers\n\nlayer = layers.Dropout(rate=0.5)`,
};

const DropoutDemo: React.FC = () => {
  const [dropoutTrigger, setDropoutTrigger] = useState<number>(0);

  const getDropoutMask = () => {
    const results: boolean[] = [];
    for (let i = 0; i < 9; i++) {
      const val = Math.sin((dropoutTrigger + i) * 123.45);
      results.push(val > 0.1);
    }
    return results;
  };

  const activeDropoutMask = getDropoutMask();

  return (
    <div className="w-full flex flex-col lg:flex-row gap-8 items-center">
      <div className="flex-1 flex flex-col gap-4">
        <div className="flex items-center gap-2">
          <Sliders className="w-4.5 h-4.5 text-cyan-400" />
          <span className="text-[11px] font-mono text-zinc-400 uppercase tracking-widest">
            Co-adaptation Regularizer
          </span>
        </div>

        <p className="text-[11.5px] leading-relaxed text-zinc-400">
          Disabling individual parameters forcing other backup neuronal routes
          to strengthen weights. Sample randomized masks:
        </p>

        <button
          onClick={() => setDropoutTrigger((p) => p + 1)}
          className="px-4 py-2 bg-red-955/40 border border-red-800 text-red-400 w-full hover:bg-red-900/20 rounded-xl font-semibold text-xs cursor-pointer select-none transition-all flex items-center justify-center gap-1.5"
        >
          <Dice5 className="w-4 h-4 text-red-500" /> Sample Random Dropout Mask
        </button>
      </div>

      <div className="w-48 h-40 border border-zinc-850 p-4 rounded-xl bg-zinc-950 flex flex-col items-center justify-center gap-3 shrink-0 select-none">
        <span className="text-[9px] text-zinc-500 font-mono uppercase tracking-widest">
          Neuron Grid Status
        </span>

        <div className="grid grid-cols-3 gap-2.5">
          {activeDropoutMask.map((isKept, mIdx) => (
            <div
              key={mIdx}
              className={cn(
                "w-8.5 h-8.5 rounded-full flex items-center justify-center border font-mono text-[9px] font-bold transition-all duration-300",
                isKept
                  ? "bg-emerald-500/10 border-emerald-500 text-emerald-400 scale-102"
                  : "bg-red-500/10 border-red-900/50 text-red-500/40 line-through opacity-45",
              )}
              title={isKept ? "Active" : "Dropped to 0!"}
            >
              {isKept ? "ON" : "OFF"}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export class DropoutLayer extends Layer {
  static description: LayerDescription = description;
  static demos: React.ComponentType[] = [DropoutDemo];

  calculateOutputShape(inputShape: ImageShape): ImageShape {
    return { ...inputShape };
  }

  checkCompatibility(_inputShape: ImageShape): CompatibilityResult {
    return { compatible: true };
  }

  computeStats(inShape: ImageShape, outShape: ImageShape): LayerStats {
    const rate = this.node.params?.rate ?? 0.5;
    const elements = inShape.c * (inShape.d ?? 1) * inShape.h * inShape.w;
    const { h: hout, w: wout } = outShape;
    const dimensionFormulaD =
      inShape.d !== undefined ? `D_out = D_in = ${outShape.d}` : undefined;

    return {
      parameterCount: 0,
      flopCount: elements,
      parameterFormula: `0 (Regularization logic has no parameters)`,
      flopFormula: `${elements.toLocaleString()} random drop checks = ${elements.toLocaleString()} FLOPs`,
      dimensionFormulaH: `H_out = H_in = ${hout}`,
      dimensionFormulaW: `W_out = W_in = ${wout}`,
      dimensionFormulaD,
      explanation: `Randomly shuts down a fraction of ${rate * 100}% input activations during training. Severe anti-overfitting technique forcing redundant network representations.`,
    };
  }

  getPytorchCode(_shapeBefore: ImageShape, _indent: string): string {
    const p = this.node.params || {};
    return `nn.Dropout(p=${p.rate || 0.5})`;
  }

  getTensorFlowCode(_shapeBefore: ImageShape, _indent: string): string {
    const p = this.node.params || {};
    return `layers.Dropout(rate=${p.rate || 0.5})`;
  }
}
