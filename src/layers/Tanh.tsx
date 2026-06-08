import React from "react";
import {
  LayerDescription,
  ImageShape,
  LayerStats,
  Layer,
  CompatibilityResult,
} from "../types";

import { ActivationSimulator } from "./ActivationHelper";

const description: LayerDescription = {
  id: "tanh",
  name: "Hyperbolic Tangent (Tanh)",
  category: "Activation",
  concept:
    "An element-wise non-linear function that squashes input values into a symmetric range between -1 and +1. It keeps representations zero-centered, which typically makes learning easier than with Sigmoids.",
  keyTakeaways: [
    "Squashes outputs symmetrically to (-1, 1), guaranteeing a zero-centered output profile.",
    "Zero-centered mean reduces systematic bias shifts across neural layers, speeding up optimizer gradient descent paths.",
    "Still suffers from vanishing gradients for very large/small values as the function curves flatly at both tails.",
    "Computationally relies on exponential fractions, requiring more processing operations than ReLU.",
  ],
  proTips:
    "While Tanh is generally superior to Sigmoid for hidden layers, it is still mostly outperformed by ReLU-family functions. It remains highly popular in Recurrent Neural Networks (RNNs & LSTMs) because they require bound states to prevent exploding internal vectors.",
  forwardEquation: "f(x) = \\tanh(x) = \\frac{e^x - e^{-x}}{e^x + e^{-x}}",
  derivativeEquation: "f'(x) = 1 - f(x)^2",
  sizeFormulaHTML:
    "H_{out} = H_{in}, \\quad W_{out} = W_{in}, \\quad C_{out} = C_{in}",
  parameterFormula: "\\text{Parameters} = 0",
  flopFormula: "\\text{FLOPs} = 5 \\cdot C_{in} \\cdot H_{in} \\cdot W_{in}",
  codePyTorch: `import torch.nn as nn\n\nlayer = nn.Tanh()`,
  codeTensorFlow: `from tensorflow.keras import layers\n\nlayer = layers.Activation('tanh')`,
};

const TanhDemo: React.FC = () => (
  <ActivationSimulator type="tanh" name="Tanh" />
);

export class TanhLayer extends Layer {
  static description: LayerDescription = description;
  static demos: React.ComponentType[] = [TanhDemo];

  calculateOutputShape(inputShape: ImageShape): ImageShape {
    return { ...inputShape };
  }

  checkCompatibility(_inputShape: ImageShape): CompatibilityResult {
    return { compatible: true };
  }

  computeStats(inShape: ImageShape, outShape: ImageShape): LayerStats {
    const elements = inShape.c * (inShape.d ?? 1) * inShape.h * inShape.w;
    const dim =
      inShape.d !== undefined ? `D_out = D_in = ${outShape.d}` : undefined;
    return {
      parameterCount: 0,
      flopCount: elements * 5,
      parameterFormula: `0 (Activation function has no learnable weights)`,
      flopFormula: `${elements.toLocaleString()} elements × 5 operations [f(x) = tanh(x)] = ${(elements * 5).toLocaleString()} FLOPs`,
      dimensionFormulaH: `H_out = H_in = ${outShape.h}`,
      dimensionFormulaW: `W_out = W_in = ${outShape.w}`,
      dimensionFormulaD: dim,
      explanation: `Maps inputs to the (-1, 1) range around zero, keeping activations zero-centered to stabilize deep computational paths.`,
    };
  }

  getPytorchCode(_shapeBefore: ImageShape, _indent: string): string {
    return `nn.Tanh()`;
  }

  getTensorFlowCode(_shapeBefore: ImageShape, _indent: string): string {
    return `layers.Activation('tanh')`;
  }
}
