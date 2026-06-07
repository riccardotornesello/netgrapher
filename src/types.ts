import React from 'react';

export type LayerType = 'conv2d' | 'conv3d' | 'relu' | 'sigmoid' | 'tanh' | 'leaky_relu' | 'elu' | 'gelu' | 'group' | 'maxpool2d' | 'maxpool3d' | 'linear' | 'flatten' | 'dropout' | 'batchnorm2d' | 'batchnorm3d';

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
  padding: 'valid' | 'same' | number;
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
  id: string;
  name: string;
  category: 'Convolutional' | 'Activation' | 'Pooling' | 'Linear & Structural' | 'Regularization' | 'Normalization';
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

export interface LayerModule {
  info: LayerDescription;
  InteractiveSimulator?: React.ComponentType | null;
}

export interface AddModalTarget {
  parentId?: string;
  index: number;
}

