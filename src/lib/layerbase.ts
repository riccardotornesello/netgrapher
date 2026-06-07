import { ImageShape, LayerNode } from '../types';

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
}
