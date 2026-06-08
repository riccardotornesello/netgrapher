import React from "react";
import {
  LayerNode,
  LayerDescription,
  Layer,
  CompatibilityResult,
  LayerType,
} from "../types";

export { Layer };
export type { CompatibilityResult };

import { Conv2DLayer } from "./Conv2D";
import { Conv3DLayer } from "./Conv3D";
import { ReLULayer } from "./ReLU";
import { SigmoidLayer } from "./Sigmoid";
import { TanhLayer } from "./Tanh";
import { LeakyReLULayer } from "./LeakyReLU";
import { ELULayer } from "./ELU";
import { GELULayer } from "./GELU";
import { MaxPool2DLayer } from "./MaxPool2D";
import { MaxPool3DLayer } from "./MaxPool3D";
import { LinearLayer } from "./Linear";
import { FlattenLayer } from "./Flatten";
import { DropoutLayer } from "./Dropout";
import { BatchNorm2DLayer } from "./BatchNorm2D";
import { BatchNorm3DLayer } from "./BatchNorm3D";
import { GroupLayer } from "./Group";

export interface LayerClass {
  new (node: LayerNode): Layer;
  description: LayerDescription;
  demos: React.ComponentType[];
}

export const LAYERS: Record<LayerType, LayerClass> = {
  group: GroupLayer,
  conv2d: Conv2DLayer,
  conv3d: Conv3DLayer,
  relu: ReLULayer,
  sigmoid: SigmoidLayer,
  tanh: TanhLayer,
  leaky_relu: LeakyReLULayer,
  elu: ELULayer,
  gelu: GELULayer,
  maxpool2d: MaxPool2DLayer,
  maxpool3d: MaxPool3DLayer,
  linear: LinearLayer,
  flatten: FlattenLayer,
  dropout: DropoutLayer,
  batchnorm2d: BatchNorm2DLayer,
  batchnorm3d: BatchNorm3DLayer,
};

export function getLayerInstance(node: LayerNode): Layer {
  const LayerClass = LAYERS[node.type];
  if (!LayerClass) throw new Error(`Unknown layer type: ${node.type}`);
  return new LayerClass(node);
}
