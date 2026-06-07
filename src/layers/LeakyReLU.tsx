import React from "react";
import { LayerDescription, ImageShape } from "../types";
import { Layer, CompatibilityResult } from "../lib/layerbase";
import { ActivationSimulator } from "./ActivationHelper";

export const info: LayerDescription = {
  id: "leaky_relu",
  name: "Leaky Rectified Linear Unit (Leaky ReLU)",
  category: "Activation",
  concept:
    "A robust variation of classical ReLU. Instead of resetting all negative coordinates directly to zero, Leaky ReLU allows a very small, non-zero slope (typically 0.01) when x < 0. This keeps neurons slightly active even when negative.",
  keyTakeaways: [
    'Solves the famous "Dying ReLU" bottleneck by ensuring a constant gradient for negative parameters.',
    "Guarantees that negative signals continue learning, promoting structural robustness in high-dimensional states.",
    "Extremely lightweight to compute: involves simple multiplication and conditional selection.",
    "Replaces strict negative sparsity with tiny persistent activations, which may slightly alter feature sparsity representation.",
  ],
  proTips:
    "The negative slope parameter (alpha) is typically set to 0.01. If you want the network to learn this slope dynamically, use a Parametric ReLU (PReLU) layer instead!",
  forwardEquation:
    "f(x) = \\max(\\alpha x, x) \\quad \\text{where } \\alpha \\approx 0.01",
  derivativeEquation:
    "f'(x) = \\begin{cases} 1 & x > 0 \\\\ \\alpha & x \\le 0 \\end{cases}",
  sizeFormulaHTML:
    "H_{out} = H_{in}, \\quad W_{out} = W_{in}, \\quad C_{out} = C_{in}",
  parameterFormula: "\\text{Parameters} = 0",
  flopFormula: "\\text{FLOPs} = 2 \\cdot C_{in} \\cdot H_{in} \\cdot W_{in}",
  codePyTorch: `import torch.nn as nn\n\nlayer = nn.LeakyReLU(negative_slope=0.01)`,
  codeTensorFlow: `from tensorflow.keras import layers\n\nlayer = layers.LeakyReLU(alpha=0.01)`,
};

export const InteractiveSimulator = () => {
  return <ActivationSimulator type="leaky_relu" name="Leaky ReLU" />;
};

export class LeakyReLULayer extends Layer {
  calculateOutputShape(inputShape: ImageShape): ImageShape {
    return { ...inputShape };
  }

  checkCompatibility(inputShape: ImageShape): CompatibilityResult {
    return { compatible: true };
  }

  getPytorchCode(shapeBefore: ImageShape, indent: string): string {
    return `nn.LeakyReLU(negative_slope=0.01)`;
  }

  getTensorFlowCode(shapeBefore: ImageShape, indent: string): string {
    return `layers.LeakyReLU(negative_slope=0.01)`;
  }
}
