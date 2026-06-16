export type LayerType =
  | "conv2d"
  | "conv3d"
  | "relu"
  | "sigmoid"
  | "tanh"
  | "leaky_relu"
  | "elu"
  | "gelu"
  | "group"
  | "maxpool2d"
  | "maxpool3d"
  | "linear"
  | "flatten"
  | "dropout"
  | "batchnorm2d"
  | "batchnorm3d";

export type LayerCategory =
  | "Convolutional"
  | "Activation"
  | "Pooling"
  | "Linear & Structural"
  | "Regularization"
  | "Normalization"
  | "Structuring";

export interface ImageShape {
  c: number;
  d?: number;
  h: number;
  w: number;
}

export interface Conv2DParams {
  filters: number;
  kernelSize: number;
  stride: number;
  padding: "valid" | "same" | number;
}

export interface LayerNode {
  id: string;
  type: LayerType;
  name: string;
  params?: any; // e.g. Conv2DParams
  children?: LayerNode[]; // For group nodes
  isExpanded?: boolean; // For tracking UI toggle of groups
}

export interface LayerDescription {
  id: LayerType;
  name: string;
  category: LayerCategory;
  concept: string;
  keyTakeaways: string[];
  proTips: string;
  forwardEquation: string;
  derivativeEquation: string;
  sizeFormulaHTML: string;
  parameterFormula: string;
  flopFormula: string;
  codePyTorch: string;
  codeTensorFlow: string;
}

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

export interface AddModalTarget {
  parentId?: string;
  index: number;
}

export interface CompatibilityResult {
  compatible: boolean;
  reason?: string;
}

export abstract class Layer {
  protected node: LayerNode;

  constructor(node: LayerNode) {
    this.node = node;
  }

  abstract calculateOutputShape(inputShape: ImageShape): ImageShape;
  abstract checkCompatibility(inputShape: ImageShape): CompatibilityResult;
  abstract getPytorchCode(shapeBefore: ImageShape, indent: string): string;
  abstract getTensorFlowCode(shapeBefore: ImageShape, indent: string): string;
  abstract computeStats(inShape: ImageShape, outShape: ImageShape): LayerStats;
}

export type LayerConstructor = new (node: LayerNode) => Layer;
