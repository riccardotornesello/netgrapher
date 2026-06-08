import React from "react";
import {
  ImageShape,
  LayerDescription,
  LayerStats,
  Layer,
  CompatibilityResult,
} from "../types";
import { getLayerInstance } from "./index";

const description: LayerDescription = {
  id: "group",
  name: "Group",
  category: "Linear & Structural",
  concept: "",
  keyTakeaways: [],
  proTips: "",
  forwardEquation: "",
  derivativeEquation: "",
  sizeFormulaHTML: "",
  parameterFormula: "",
  flopFormula: "",
  codePyTorch: "",
  codeTensorFlow: "",
};

export class GroupLayer extends Layer {
  static description: LayerDescription = description;
  static demos: React.ComponentType[] = [];

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
          reason: `Incompatibility inside group "${this.node.name}" -> child "${child.name}": ${res.reason}`,
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
    const childStrs: string[] = [];
    let tempShape = { ...shapeBefore };
    for (const child of this.node.children) {
      const inst = getLayerInstance(child);
      const childStr = inst.getPytorchCode(tempShape, indent + "    ");
      if (childStr) childStrs.push(childStr);
      tempShape = inst.calculateOutputShape(tempShape);
    }
    return (
      `nn.Sequential(\n${indent}    ` +
      childStrs.join(`,\n${indent}    `) +
      `\n${indent})`
    );
  }

  computeStats(_inShape: ImageShape, _outShape: ImageShape): LayerStats {
    return {
      parameterCount: 0,
      flopCount: 0,
      parameterFormula: `Calculated in sub-modules`,
      flopFormula: `Calculated in sub-modules`,
      dimensionFormulaH: `Depends on sub-layers`,
      dimensionFormulaW: `Depends on sub-layers`,
      explanation: `A sequential group nesting multiple sub-layers. Isolates reusable architectural blocks like residual columns, bottlenecks, or inception patterns.`,
    };
  }

  getTensorFlowCode(shapeBefore: ImageShape, indent: string): string {
    if (!this.node.children || this.node.children.length === 0) {
      return `tf.keras.Sequential()`;
    }
    const childStrs: string[] = [];
    let tempShape = { ...shapeBefore };
    for (const child of this.node.children) {
      const inst = getLayerInstance(child);
      const childStr = inst.getTensorFlowCode(tempShape, indent + "    ");
      if (childStr) childStrs.push(childStr);
      tempShape = inst.calculateOutputShape(tempShape);
    }
    return (
      `tf.keras.Sequential([\n${indent}    ` +
      childStrs.join(`,\n${indent}    `) +
      `\n${indent}])`
    );
  }
}
