import React from "react";
import {
  LayerDescription,
  ImageShape,
  LayerStats,
  Layer,
  CompatibilityResult,
} from "../types";

import {
  ActivationSimulator,
  computeActivationStats,
} from "./ActivationHelper";

const description: LayerDescription = {
  id: "elu",
  name: "Exponential Linear Unit (ELU)",
  category: "Activation",
  concept:
    "Fuses the benefits of ReLU and Tanh. ELU handles negative values using a smooth exponential curve that converges to -alpha. This zero-centers the average activation value, speeding up learning and reducing noise.",
  keyTakeaways: [
    "Avoids vanishing gradients in positive axes and prevents dying units in negative regions.",
    "Produces smoother activations than ReLU for negative regions, reducing high-frequency noise gradients.",
    "Pushes mean activations closer to zero, which helps stabilize variance tracking and batch convergence.",
    "Slightly more expensive to run due to negative exponential computation tasks.",
  ],
  proTips:
    "ELU works exceptionally well when combined with self-normalizing networks (SELU) or deep networks without Batch Normalization, since ELU can regulate the mean and variance of hidden layer activations on its own.",
  forwardEquation:
    "f(x) = \\begin{cases} x & x > 0 \\\\ \\alpha(e^x - 1) & x \\le 0 \\end{cases}",
  derivativeEquation:
    "f'(x) = \\begin{cases} 1 & x > 0 \\\\ f(x) + \\alpha & x \\le 0 \\end{cases}",
  sizeFormulaHTML:
    "H_{out} = H_{in}, \\quad W_{out} = W_{in}, \\quad C_{out} = C_{in}",
  parameterFormula: "\\text{Parameters} = 0",
  flopFormula: "\\text{FLOPs} = 3 \\cdot C_{in} \\cdot H_{in} \\cdot W_{in}",
  codePyTorch: `import torch.nn as nn\n\nlayer = nn.ELU(alpha=1.0)`,
  codeTensorFlow: `from tensorflow.keras import layers\n\nlayer = layers.ELU(alpha=1.0)`,
};

const ELUDemo: React.FC = () => <ActivationSimulator type="elu" name="ELU" />;

export class ELULayer extends Layer {
  static description: LayerDescription = description;
  static demos: React.ComponentType[] = [ELUDemo];

  calculateOutputShape(inputShape: ImageShape): ImageShape {
    return { ...inputShape };
  }

  checkCompatibility(_inputShape: ImageShape): CompatibilityResult {
    return { compatible: true };
  }

  computeStats(inShape: ImageShape, outShape: ImageShape): LayerStats {
    return computeActivationStats(
      inShape,
      outShape,
      3,
      "f(x) = x if x >= 0 else a(e^x - 1)",
      "Smoothly fits exponential scales for negative activations to speed up standard convergence curves.",
    );
  }

  getPytorchCode(_shapeBefore: ImageShape, _indent: string): string {
    return `nn.ELU()`;
  }

  getTensorFlowCode(_shapeBefore: ImageShape, _indent: string): string {
    return `layers.ELU()`;
  }
}
