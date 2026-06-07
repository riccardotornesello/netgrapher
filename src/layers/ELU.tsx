import React from 'react';
import { LayerDescription, ImageShape } from '../types';
import { Layer, CompatibilityResult } from '../lib/layerbase';
import { ActivationSimulator } from './ActivationHelper';

export const info: LayerDescription = {
  id: 'elu',
  name: 'Exponential Linear Unit (ELU)',
  category: 'Activation',
  concept: 'Fuses the benefits of ReLU and Tanh. ELU handles negative values using a smooth exponential curve that converges to -alpha. This zero-centers the average activation value, speeding up learning and reducing noise.',
  keyTakeaways: [
    'Avoids vanishing gradients in positive axes and prevents dying units in negative regions.',
    'Produces smoother activations than ReLU for negative regions, reducing high-frequency noise gradients.',
    'Pushes mean activations closer to zero, which helps stabilize variance tracking and batch convergence.',
    'Slightly more expensive to run due to negative exponential computation tasks.'
  ],
  proTips: 'ELU works exceptionally well when combined with self-normalizing networks (SELU) or deep networks without Batch Normalization, since ELU can regulate the mean and variance of hidden layer activations on its own.',
  forwardEquation: 'f(x) = \\begin{cases} x & x > 0 \\\\ \\alpha(e^x - 1) & x \\le 0 \\end{cases}',
  derivativeEquation: 'f\'(x) = \\begin{cases} 1 & x > 0 \\\\ f(x) + \\alpha & x \\le 0 \\end{cases}',
  sizeFormulaHTML: 'H_{out} = H_{in}, \\quad W_{out} = W_{in}, \\quad C_{out} = C_{in}',
  parameterFormula: '\\text{Parameters} = 0',
  flopFormula: '\\text{FLOPs} = 3 \\cdot C_{in} \\cdot H_{in} \\cdot W_{in}',
  codePyTorch: `import torch.nn as nn\n\nlayer = nn.ELU(alpha=1.0)`,
  codeTensorFlow: `from tensorflow.keras import layers\n\nlayer = layers.ELU(alpha=1.0)`
};

export const InteractiveSimulator = () => {
  return <ActivationSimulator type="elu" name="ELU" />;
};

export class ELULayer extends Layer {
  calculateOutputShape(inputShape: ImageShape): ImageShape {
    return { ...inputShape };
  }

  checkCompatibility(inputShape: ImageShape): CompatibilityResult {
    return { compatible: true };
  }

  getPytorchCode(shapeBefore: ImageShape, indent: string): string {
    return `nn.ELU()`;
  }

  getTensorFlowCode(shapeBefore: ImageShape, indent: string): string {
    return `layers.ELU()`;
  }
}

