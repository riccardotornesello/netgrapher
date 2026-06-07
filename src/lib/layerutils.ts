import { ImageShape, LayerNode } from '../types';
import { Layer } from './layerbase';
import type { CompatibilityResult } from './layerbase';
export { Layer };
export type { CompatibilityResult };

import { Conv2DLayer } from '../layers/Conv2D';
import { Conv3DLayer } from '../layers/Conv3D';
import { ReLULayer } from '../layers/ReLU';
import { SigmoidLayer } from '../layers/Sigmoid';
import { TanhLayer } from '../layers/Tanh';
import { LeakyReLULayer } from '../layers/LeakyReLU';
import { ELULayer } from '../layers/ELU';
import { GELULayer } from '../layers/GELU';
import { MaxPool2DLayer } from '../layers/MaxPool2D';
import { MaxPool3DLayer } from '../layers/MaxPool3D';
import { LinearLayer } from '../layers/Linear';
import { FlattenLayer } from '../layers/Flatten';
import { DropoutLayer } from '../layers/Dropout';
import { BatchNorm2DLayer } from '../layers/BatchNorm2D';
import { BatchNorm3DLayer } from '../layers/BatchNorm3D';


export class GroupLayer extends Layer {
  calculateOutputShape(inputShape: ImageShape): ImageShape {
    if (!this.node.children || this.node.children.length === 0) {
      return inputShape;
    }
    let currentShape = inputShape;
    for (const child of this.node.children) {
      currentShape = getLayerInstance(child).calculateOutputShape(currentShape);
    }
    return currentShape;
  }

  checkCompatibility(inputShape: ImageShape): CompatibilityResult {
    if (!this.node.children || this.node.children.length === 0) {
      return { compatible: true };
    }
    let currentShape = inputShape;
    for (const child of this.node.children) {
      const inst = getLayerInstance(child);
      const res = inst.checkCompatibility(currentShape);
      if (!res.compatible) {
        return {
          compatible: false,
          reason: `Incompatibility inside group "${this.node.name}" -> child "${child.name}": ${res.reason}`
        };
      }
      currentShape = inst.calculateOutputShape(currentShape);
    }
    return { compatible: true };
  }

  getPytorchCode(shapeBefore: ImageShape, indent: string): string {
    if (!this.node.children || this.node.children.length === 0) {
      return `nn.Sequential()`;
    }
    let childStrs: string[] = [];
    let tempShape = { ...shapeBefore };
    for (const child of this.node.children) {
      const inst = getLayerInstance(child);
      const childStr = inst.getPytorchCode(tempShape, indent + '    ');
      if (childStr) {
        childStrs.push(childStr);
      }
      tempShape = inst.calculateOutputShape(tempShape);
    }
    return `nn.Sequential(\n${indent}    ` + childStrs.join(`,\n${indent}    `) + `\n${indent})`;
  }

  getTensorFlowCode(shapeBefore: ImageShape, indent: string): string {
    if (!this.node.children || this.node.children.length === 0) {
      return `tf.keras.Sequential()`;
    }
    let childStrs: string[] = [];
    let tempShape = { ...shapeBefore };
    for (const child of this.node.children) {
      const inst = getLayerInstance(child);
      const childStr = inst.getTensorFlowCode(tempShape, indent + '    ');
      if (childStr) {
        childStrs.push(childStr);
      }
      tempShape = inst.calculateOutputShape(tempShape);
    }
    return `tf.keras.Sequential([\n${indent}    ` + childStrs.join(`,\n${indent}    `) + `\n${indent}])`;
  }
}

export function getLayerInstance(node: LayerNode): Layer {
  switch (node.type) {
    case 'conv2d':
      return new Conv2DLayer(node);
    case 'conv3d':
      return new Conv3DLayer(node);
    case 'relu':
      return new ReLULayer(node);
    case 'sigmoid':
      return new SigmoidLayer(node);
    case 'tanh':
      return new TanhLayer(node);
    case 'leaky_relu':
      return new LeakyReLULayer(node);
    case 'elu':
      return new ELULayer(node);
    case 'gelu':
      return new GELULayer(node);
    case 'maxpool2d':
      return new MaxPool2DLayer(node);
    case 'maxpool3d':
      return new MaxPool3DLayer(node);
    case 'linear':
      return new LinearLayer(node);
    case 'flatten':
      return new FlattenLayer(node);
    case 'dropout':
      return new DropoutLayer(node);
    case 'batchnorm2d':
      return new BatchNorm2DLayer(node);
    case 'batchnorm3d':
      return new BatchNorm3DLayer(node);
    case 'group':
      return new GroupLayer(node);
    default:
      throw new Error(`Unknown layer type: ${node.type}`);
  }
}
