import React from "react";
import { LayerDescription, ImageShape } from "../types";
import { Layer, CompatibilityResult } from "../lib/layerbase";
import { ActivationSimulator } from "./ActivationHelper";

export const info: LayerDescription = {
  id: "gelu",
  name: "Gaussian Error Linear Unit (GELU)",
  category: "Activation",
  concept:
    "A probabilistic activation function that weights inputs by their value cumulative probability under a normal distribution. It scales input signals smoothly and is widely used in modern language models (BERT, GPT, Transformers).",
  keyTakeaways: [
    "Determines non-linear thresholds probabilistically rather than using a hard maximum, allowing smoother curve modeling.",
    "Guarantees a smooth, differentiable profile everywhere, removing sharp gradient cliffs at zero.",
    "Performs exceptionally well in high-frequency transformer configurations where attention-based patterns dominate.",
    "Includes exponential and trigonometric approximations, making it mathematically sophisticated but computationally heavier.",
  ],
  proTips:
    "GELU is the standard choice in modern, high-performance Transformer systems (like BERT, ViT, and GPT). If you are building a Transformer or a heavy multimodal encoder, GELU is highly likely to outperform ReLU.",
  forwardEquation:
    "f(x) = x \\cdot \\Phi(x) = x \\cdot P(X \\le x) \\approx 0.5x \\left(1 + \\tanh\\left[\\sqrt{\\frac{2}{\\pi}} (x + 0.044715 x^3)\\right]\\right)",
  derivativeEquation: "f'(x) = \\Phi(x) + x \\cdot \\phi(x)",
  sizeFormulaHTML:
    "H_{out} = H_{in}, \\quad W_{out} = W_{in}, \\quad C_{out} = C_{in}",
  parameterFormula: "\\text{Parameters} = 0",
  flopFormula: "\\text{FLOPs} = 6 \\cdot C_{in} \\cdot H_{in} \\cdot W_{in}",
  codePyTorch: `import torch.nn as nn\n\nlayer = nn.GELU()`,
  codeTensorFlow: `from tensorflow.keras import layers\n\nlayer = layers.Activation('gelu')`,
};

export const InteractiveSimulator = () => {
  return <ActivationSimulator type="gelu" name="GELU" />;
};

export class GELULayer extends Layer {
  calculateOutputShape(inputShape: ImageShape): ImageShape {
    return { ...inputShape };
  }

  checkCompatibility(inputShape: ImageShape): CompatibilityResult {
    return { compatible: true };
  }

  getPytorchCode(shapeBefore: ImageShape, indent: string): string {
    return `nn.GELU()`;
  }

  getTensorFlowCode(shapeBefore: ImageShape, indent: string): string {
    return `layers.Activation('gelu')`;
  }
}
