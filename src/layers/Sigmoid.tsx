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
  id: "sigmoid",
  name: "Sigmoid Activation (Sigmoid)",
  category: "Activation",
  concept:
    "An element-wise activation function that squashes real-valued inputs into a smooth, probability-like range between 0 and 1. Heavily used as the final layer for binary classification tasks.",
  keyTakeaways: [
    "Constrains outputs strictly between 0 and 1, facilitating clear probabilistic status evaluation.",
    "Suffers from severe gradient saturation: extreme high or low inputs result in near-zero derivatives, triggering vanishing gradients.",
    "Outputs are non-zero-centered, which can cause systematic zig-zag directions during parameter updates.",
    "Requires evaluating exponents, introducing high floating-point computational overhead relative to simple ReLU thresholds.",
  ],
  proTips:
    "Avoid Sigmoid in hidden layers of deep networks. The gradient vanishes rapidly after just a few layers. Prefer ReLU, Leaky ReLU, or GELU instead, reserving Sigmoid strictly for final binary output units.",
  forwardEquation: "f(x) = \\frac{1}{1 + e^{-x}}",
  derivativeEquation: "f'(x) = f(x) \\cdot (1 - f(x))",
  sizeFormulaHTML:
    "H_{out} = H_{in}, \\quad W_{out} = W_{in}, \\quad C_{out} = C_{in}",
  parameterFormula: "\\text{Parameters} = 0",
  flopFormula:
    "\\text{FLOPs} = 4 \\cdot C_{in} \\cdot H_{in} \\cdot W_{in} \\quad (\\text{Exponential arithmetic operations per element})",
  codePyTorch: `import torch.nn as nn\n\nlayer = nn.Sigmoid()`,
  codeTensorFlow: `from tensorflow.keras import layers\n\nlayer = layers.Activation('sigmoid')`,
};

const SigmoidDemo: React.FC = () => (
  <ActivationSimulator type="sigmoid" name="Sigmoid" />
);

export class SigmoidLayer extends Layer {
  static description: LayerDescription = description;
  static demos: React.ComponentType[] = [SigmoidDemo];

  calculateOutputShape(inputShape: ImageShape): ImageShape {
    return { ...inputShape };
  }

  checkCompatibility(_inputShape: ImageShape): CompatibilityResult {
    return { compatible: true };
  }

  computeStats(inShape: ImageShape, outShape: ImageShape): LayerStats {
    return computeActivationStats(inShape, outShape, 4, "f(x) = 1 / (1 + e^-x)", "Sigmoid activation maps input values strictly to the (0, 1) range, forming smooth, probability-like activation outputs.");
  }

  getPytorchCode(_shapeBefore: ImageShape, _indent: string): string {
    return `nn.Sigmoid()`;
  }

  getTensorFlowCode(_shapeBefore: ImageShape, _indent: string): string {
    return `layers.Activation('sigmoid')`;
  }
}
