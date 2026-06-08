import { ImageShape, LayerNode } from "../types";
import { getLayerInstance } from "../layers";

export const generateId = () => Math.random().toString(36).substring(2, 9);

export interface CompatibilityResult {
  compatible: boolean;
  reason?: string;
}

export function calculateOutputShape(
  inputShape: ImageShape,
  layer: LayerNode,
): ImageShape {
  try {
    const layerInstance = getLayerInstance(layer);
    return layerInstance.calculateOutputShape(inputShape);
  } catch (e) {
    return inputShape; // Fallback
  }
}

export function checkLayerCompatibility(
  inputShape: ImageShape,
  layer: LayerNode,
): CompatibilityResult {
  try {
    const layerInstance = getLayerInstance(layer);
    return layerInstance.checkCompatibility(inputShape);
  } catch (e: any) {
    return { compatible: false, reason: e.message || "Unknown error" };
  }
}
