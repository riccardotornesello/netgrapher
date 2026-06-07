import { ImageShape, LayerNode } from "../types";

export interface LayerStats {
  parameterCount: number;
  flopCount: number;
  parameterFormula: string;
  flopFormula: string;
  dimensionFormulaH: string;
  dimensionFormulaW: string;
  dimensionFormulaD?: string;
  explanation: string;
}

export function computeLayerStats(
  inShape: ImageShape,
  node: LayerNode,
  outShape: ImageShape,
): LayerStats {
  const params = node.params || {};
  let parameterCount = 0;
  let flopCount = 0;
  let parameterFormula = "0";
  let flopFormula = "0";
  let dimensionFormulaH = "H_out = H_in";
  let dimensionFormulaW = "W_out = W_in";
  let dimensionFormulaD = undefined;
  let explanation = "";

  const cin = inShape.c;
  const hin = inShape.h;
  const win = inShape.w;
  const din = inShape.d;

  const cout = outShape.c;
  const hout = outShape.h;
  const wout = outShape.w;
  const dout = outShape.d;

  switch (node.type) {
    case "conv2d": {
      const k = params.kernelSize ?? 3;
      const s = params.stride ?? 1;
      const p = params.padding ?? "same";

      const weightParams = k * k * cin * cout;
      const biasParams = cout;
      parameterCount = weightParams + biasParams;
      parameterFormula = `(${k} × ${k} × ${cin} × ${cout}) [weights] + ${cout} [biases] = ${parameterCount.toLocaleString()}`;

      // Each output pixel requires (K * K * C_in) MACs
      const macsPerPixel = k * k * cin;
      flopCount = hout * wout * cout * macsPerPixel * 2; // FLOPs = 2 * MACs
      flopFormula = `2 × (${hout} × ${wout} × ${cout}) [output size] × (${k} × ${k} × ${cin}) [MACs/pixel] = ${flopCount.toLocaleString()} FLOPs`;

      if (p === "same") {
        dimensionFormulaH = `H_out = ⌈${hin} / ${s}⌉ = ${hout}`;
        dimensionFormulaW = `W_out = ⌈${win} / ${s}⌉ = ${wout}`;
      } else if (p === "valid") {
        dimensionFormulaH = `H_out = ⌊(${hin} - ${k}) / ${s}⌋ + 1 = ⌊(${hin - k}) / ${s}⌋ + 1 = ${hout}`;
        dimensionFormulaW = `W_out = ⌊(${win} - ${k}) / ${s}⌋ + 1 = ⌊(${win - k}) / ${s}⌋ + 1 = ${wout}`;
      } else if (typeof p === "number") {
        dimensionFormulaH = `H_out = ⌊(${hin} + 2×${p} - ${k}) / ${s}⌋ + 1 = ${hout}`;
        dimensionFormulaW = `W_out = ⌊(${win} + 2×${p} - ${k}) / ${s}⌋ + 1 = ${wout}`;
      }
      explanation = `Slices an input of ${cin} activation maps with a bank of ${cout} slideable 2D filters of spatial dimension ${k}×${k}. Computes localized feature representations.`;
      break;
    }

    case "conv3d": {
      const k = params.kernelSize ?? 3;
      const s = params.stride ?? 1;
      const p = params.padding ?? "same";
      const dInReal = din ?? 1;
      const dOutReal = dout ?? 1;

      const weightParams = k * k * k * cin * cout;
      const biasParams = cout;
      parameterCount = weightParams + biasParams;
      parameterFormula = `(${k} × ${k} × ${k} × ${cin} × ${cout}) [weights] + ${cout} [biases] = ${parameterCount.toLocaleString()}`;

      const macsPerPixel = k * k * k * cin;
      flopCount = dOutReal * hout * wout * cout * macsPerPixel * 2;
      flopFormula = `2 × (${dOutReal} × ${hout} × ${wout} × ${cout}) × (${k} × ${k} × ${k} × ${cin}) = ${flopCount.toLocaleString()} FLOPs`;

      if (p === "same") {
        dimensionFormulaD = `D_out = ⌈${dInReal} / ${s}⌉ = ${dOutReal}`;
        dimensionFormulaH = `H_out = ⌈${hin} / ${s}5 = ${hout}`;
        dimensionFormulaW = `W_out = ⌈${win} / ${s}⌉ = ${wout}`;
      } else if (p === "valid") {
        dimensionFormulaD = `D_out = ⌊(${dInReal} - ${k}) / ${s}⌋ + 1 = ${dOutReal}`;
        dimensionFormulaH = `H_out = ⌊(${hin} - ${k}) / ${s}⌋ + 1 = ${hout}`;
        dimensionFormulaW = `W_out = ⌊(${win} - ${k}) / ${s}⌋ + 1 = ${wout}`;
      } else if (typeof p === "number") {
        dimensionFormulaD = `D_out = ⌊(${dInReal} + 2×${p} - ${k}) / ${s}⌋ + 1 = ${dOutReal}`;
        dimensionFormulaH = `H_out = ⌊(${hin} + 2×${p} - ${k}) / ${s}⌋ + 1 = ${hout}`;
        dimensionFormulaW = `W_out = ⌊(${win} + 2×${p} - ${k}) / ${s}⌋ + 1 = ${wout}`;
      }
      explanation = `Applies a bank of ${cout} 3D filters (${k}×${k}×${k}) over a volume tensor. Captures spatiotemporal or multi-spectral depth contexts.`;
      break;
    }

    case "relu": {
      parameterCount = 0;
      parameterFormula = `0 (Activation function has no learnable weights)`;

      const elementsCap = cin * (din ?? 1) * hin * win;
      flopCount = elementsCap;
      flopFormula = `${elementsCap.toLocaleString()} comparisons [f(x) = max(0, x)] = ${flopCount.toLocaleString()} FLOPs`;

      dimensionFormulaH = `H_out = H_in = ${hout}`;
      dimensionFormulaW = `W_out = W_in = ${wout}`;
      if (din !== undefined) dimensionFormulaD = `D_out = D_in = ${dout}`;
      explanation = `Element-wise rectified linear activation function. Thresholds all negative signals to zero, introducing mandatory non-linear decision scope to the neural network.`;
      break;
    }

    case "sigmoid": {
      parameterCount = 0;
      parameterFormula = `0 (Activation function has no learnable weights)`;

      const elementsCap = cin * (din ?? 1) * hin * win;
      flopCount = elementsCap * 4;
      flopFormula = `${elementsCap.toLocaleString()} elements × 4 operations [f(x) = 1 / (1 + e^-x)] = ${flopCount.toLocaleString()} FLOPs`;

      dimensionFormulaH = `H_out = H_in = ${hout}`;
      dimensionFormulaW = `W_out = W_in = ${wout}`;
      if (din !== undefined) dimensionFormulaD = `D_out = D_in = ${dout}`;
      explanation = `Sigmoid activation maps input values strictly to the (0, 1) range, forming smooth, probability-like activation outputs.`;
      break;
    }

    case "tanh": {
      parameterCount = 0;
      parameterFormula = `0 (Activation function has no learnable weights)`;

      const elementsCap = cin * (din ?? 1) * hin * win;
      flopCount = elementsCap * 5;
      flopFormula = `${elementsCap.toLocaleString()} elements × 5 operations [f(x) = tanh(x)] = ${flopCount.toLocaleString()} FLOPs`;

      dimensionFormulaH = `H_out = H_in = ${hout}`;
      dimensionFormulaW = `W_out = W_in = ${wout}`;
      if (din !== undefined) dimensionFormulaD = `D_out = D_in = ${dout}`;
      explanation = `Maps inputs to the (-1, 1) range around zero, keeping activations zero-centered to stabilize deep computational paths.`;
      break;
    }

    case "leaky_relu": {
      parameterCount = 0;
      parameterFormula = `0 (Activation function has no learnable weights)`;

      const elementsCap = cin * (din ?? 1) * hin * win;
      flopCount = elementsCap * 2;
      flopFormula = `${elementsCap.toLocaleString()} elements × 2 operations [f(x) = max(0.01x, x)] = ${flopCount.toLocaleString()} FLOPs`;

      dimensionFormulaH = `H_out = H_in = ${hout}`;
      dimensionFormulaW = `W_out = W_in = ${wout}`;
      if (din !== undefined) dimensionFormulaD = `D_out = D_in = ${dout}`;
      explanation = `Allows a microscopic gradient slope of 0.01 when the activation is negative, preventing the "dying ReLU" lockup.`;
      break;
    }

    case "elu": {
      parameterCount = 0;
      parameterFormula = `0 (Activation function has no learnable weights)`;

      const elementsCap = cin * (din ?? 1) * hin * win;
      flopCount = elementsCap * 3;
      flopFormula = `${elementsCap.toLocaleString()} elements × 3 operations [f(x) = x if x >= 0 else a(e^x - 1)] = ${flopCount.toLocaleString()} FLOPs`;

      dimensionFormulaH = `H_out = H_in = ${hout}`;
      dimensionFormulaW = `W_out = W_in = ${wout}`;
      if (din !== undefined) dimensionFormulaD = `D_out = D_in = ${dout}`;
      explanation = `Smoothly fits exponential scales for negative activations to speed up standard convergence curves.`;
      break;
    }

    case "gelu": {
      parameterCount = 0;
      parameterFormula = `0 (Activation function has no learnable weights)`;

      const elementsCap = cin * (din ?? 1) * hin * win;
      flopCount = elementsCap * 6;
      flopFormula = `${elementsCap.toLocaleString()} elements × 6 operations [f(x) = x × CDF(x)] = ${flopCount.toLocaleString()} FLOPs`;

      dimensionFormulaH = `H_out = H_in = ${hout}`;
      dimensionFormulaW = `W_out = W_in = ${wout}`;
      if (din !== undefined) dimensionFormulaD = `D_out = D_in = ${dout}`;
      explanation = `Applies Gaussian Error Linear activation scales. Heavily leveraged across Transformer architectures (BERT, GPTs).`;
      break;
    }

    case "maxpool2d": {
      const k = params.poolSize ?? 2;
      const s = params.stride ?? 2;

      parameterCount = 0;
      parameterFormula = `0 (Pooling layers carry no learnable parameters)`;

      const elementsOut = cout * hout * wout;
      flopCount = elementsOut * (k * k - 1); // finding max of k*k elements needs k*k-1 comparisons
      flopFormula = `${elementsOut.toLocaleString()} pixels × (${k}² - 1) comparisons = ${flopCount.toLocaleString()} FLOPs`;

      dimensionFormulaH = `H_out = ⌊(${hin} - ${k}) / ${s}⌋ + 1 = ${hout}`;
      dimensionFormulaW = `W_out = ⌊(${win} - ${k}) / ${s}⌋ + 1 = ${wout}`;
      explanation = `Downsamples the spatial map by sliding a ${k}×${k} window with stride ${s} and extracting the maximum value. Provides translational invariance & reduces memory footprints.`;
      break;
    }

    case "maxpool3d": {
      const k = params.poolSize ?? 2;
      const s = params.stride ?? 2;
      const dInReal = din ?? 1;
      const dOutReal = dout ?? 1;

      parameterCount = 0;
      parameterFormula = `0 (Pooling layers carry no learnable parameters)`;

      const elementsOut = cout * dOutReal * hout * wout;
      flopCount = elementsOut * (k * k * k - 1);
      flopFormula = `${elementsOut.toLocaleString()} sub-elements × (${k}³ - 1) = ${flopCount.toLocaleString()} FLOPs`;

      dimensionFormulaD = `D_out = ⌊(${dInReal} - ${k}) / ${s}⌋ + 1 = ${dOutReal}`;
      dimensionFormulaH = `H_out = ⌊(${hin} - ${k}) / ${s}⌋ + 1 = ${hout}`;
      dimensionFormulaW = `W_out = ⌊(${win} - ${k}) / ${s}⌋ + 1 = ${wout}`;
      explanation = `Performs max-pooling along 3D volumetric dimensions (${k}×${k}×${k}) to reduce data dimensionality across depth, width, and height.`;
      break;
    }

    case "linear": {
      const outF = params.outFeatures ?? 128;
      const inF = cin * (din ?? 1) * hin * win;

      const weightParams = inF * outF;
      const biasParams = outF;
      parameterCount = weightParams + biasParams;
      parameterFormula = `(${inF} [flat input] × ${outF} [outputs]) + ${outF} [biases] = ${parameterCount.toLocaleString()}`;

      flopCount = inF * outF * 2; // Matrix multiply
      flopFormula = `2 × (${inF} inputs) × (${outF} units) = ${flopCount.toLocaleString()} FLOPs`;

      dimensionFormulaH = `H_out = 1 (Vectorized)`;
      dimensionFormulaW = `W_out = 1 (Vectorized)`;
      explanation = `Fully connected (dense) layer. Every unit from the flattened incoming tensor is multiplied by a learnable weight matrix to yield a ${outF}-dimensional representation.`;
      break;
    }

    case "flatten": {
      parameterCount = 0;
      parameterFormula = `0 (Spatial folding has no parameter cost)`;
      flopCount = 0;
      flopFormula = `0 (Pure indexing/view operation in PyTorch/TF)`;

      const elements = cin * (din ?? 1) * hin * win;
      dimensionFormulaH = `H_out = 1`;
      dimensionFormulaW = `W_out = 1`;
      explanation = `Collapses multidimensional spatial inputs into a single continuous 1D array of size ${elements.toLocaleString()} for processing by downstream Dense/Fully connected layers.`;
      break;
    }

    case "dropout": {
      parameterCount = 0;
      parameterFormula = `0 (Regularization logic has no parameters)`;

      // Random generation/masking
      const elements = cin * (din ?? 1) * hin * win;
      flopCount = elements; // scaling elements during training
      flopFormula = `${elements.toLocaleString()} random drop checks = ${flopCount.toLocaleString()} FLOPs`;

      dimensionFormulaH = `H_out = H_in = ${hout}`;
      dimensionFormulaW = `W_out = W_in = ${wout}`;
      explanation = `Randomly shuts down a fraction of ${params.rate * 100}% input activations during training. Severe anti-overfitting technique forcing redundant networks representations.`;
      break;
    }

    case "batchnorm2d": {
      // 4 parameter arrays per channel: scale (gamma), shift (beta), rolling mean, rolling var. Mean and Variance are static (non-trainable) but still parameters
      parameterCount = cin * 4;
      parameterFormula = `${cin} channels × 4 params/channel = ${parameterCount.toLocaleString()}`;

      const elements = cin * hin * win;
      // Formula: y = (x - mean) / sqrt(var + eps) * gamma + beta => ~4 float actions per item
      flopCount = elements * 4;
      flopFormula = `${elements.toLocaleString()} elements × 4 (normalizing and scaling) = ${flopCount.toLocaleString()} FLOPs`;

      dimensionFormulaH = `H_out = H_in = ${hout}`;
      dimensionFormulaW = `W_out = W_in = ${wout}`;
      explanation = `Normalizes the active feature maps over batches per channel coordinate. Helps avoid internal covariate shift, allowing faster learning rates and robust stability.`;
      break;
    }

    case "batchnorm3d": {
      parameterCount = cin * 4;
      parameterFormula = `${cin} channels × 4 params/channel = ${parameterCount.toLocaleString()}`;

      const elements = cin * (din ?? 1) * hin * win;
      flopCount = elements * 4;
      flopFormula = `${elements.toLocaleString()} elements × 4 = ${flopCount.toLocaleString()} FLOPs`;

      dimensionFormulaH = `H_out = H_in = ${hout}`;
      dimensionFormulaW = `W_out = W_in = ${wout}`;
      if (din !== undefined) dimensionFormulaD = `D_out = D_in = ${dout}`;
      explanation = `Performs batch normalization over 3D tensor volumes per channel. Combats internal covariate shift and promotes steep gradient propagation.`;
      break;
    }

    case "group": {
      parameterCount = 0;
      parameterFormula = `Calculated in sub-modules`;
      flopCount = 0;
      flopFormula = `Calculated in sub-modules`;
      explanation = `A sequential group nesting multiple sub-layers. Isolates reusable architectural blocks like residual columns, bottlenecks, or inception patterns.`;
      break;
    }

    default:
      explanation = `General layer computation.`;
  }

  return {
    parameterCount,
    flopCount,
    parameterFormula,
    flopFormula,
    dimensionFormulaH,
    dimensionFormulaW,
    dimensionFormulaD,
    explanation,
  };
}
