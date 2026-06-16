import React from "react";
import {
  LayerDescription,
  ImageShape,
  LayerStats,
  Layer,
  CompatibilityResult,
} from "../types";

import { ActivationSimulator, computeActivationStats } from "./ActivationHelper";

const description: LayerDescription = {
  id: "relu",
  name: "Rectified Linear Unit (ReLU)",
  category: "Activation",
  concept:
    "An element-wise threshold function that maps all negative values to zero while keeping positive values untouched. This injects essential non-linearity into standard linear operations.",
  keyTakeaways: [
    "Empowers the network to approximate complex non-linear functions (Universal Approximation Theorem).",
    "Does not saturate for positive values, mitigating the vanishing gradient challenge during training.",
    "Promotes sparse activation—only a subset of neurons fire actively for specific inputs.",
    "Computationally trivial to evaluate, speeding up feedforward and backpropagation cycles.",
  ],
  proTips:
    'Watch out for "Dying ReLU"! If massive gradients push biases highly negative, neurons can lock into returning 0.0 permanently. Try Leaky ReLU (f(x) = max(0.01x, x)) or GELU if this becomes an issue.',
  forwardEquation: "f(x) = \\max(0, x)",
  derivativeEquation:
    "f'(x) = \\begin{cases} 1 & x > 0 \\\\ 0 & x \\le 0 \\end{cases}",
  sizeFormulaHTML:
    "H_{out} = H_{in}, \\quad W_{out} = W_{in}, \\quad C_{out} = C_{in}",
  parameterFormula:
    "\\text{Parameters} = 0 \\quad (\\text{ReLU has no learnable weights})",
  flopFormula:
    "\\text{FLOPs} = C_{in} \\cdot H_{in} \\cdot W_{in} \\quad (\\text{One comparison per unit})",
  codePyTorch: `import torch.nn as nn\n\nlayer = nn.ReLU(inplace=True)`,
  codeTensorFlow: `from tensorflow.keras import layers\n\nlayer = layers.ReLU()`,
};

const ReLUDemo: React.FC = () => (
  <ActivationSimulator type="relu" name="ReLU" />
);

export class ReLULayer extends Layer {
  static description: LayerDescription = description;
  static demos: React.ComponentType[] = [ReLUDemo];

  calculateOutputShape(inputShape: ImageShape): ImageShape {
    return { ...inputShape };
  }

  checkCompatibility(_inputShape: ImageShape): CompatibilityResult {
    return { compatible: true };
  }

  computeStats(inShape: ImageShape, outShape: ImageShape): LayerStats {
    return computeActivationStats(inShape, outShape, 1, "f(x) = max(0, x)", "Element-wise rectified linear activation function. Thresholds all negative signals to zero, introducing mandatory non-linear decision scope to the neural network.");
  }

  getPytorchCode(_shapeBefore: ImageShape, _indent: string): string {
    return `nn.ReLU()`;
  }

  getTensorFlowCode(_shapeBefore: ImageShape, _indent: string): string {
    return `layers.ReLU()`;
  }
}
