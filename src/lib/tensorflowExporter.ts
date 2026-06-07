import { LayerNode, ImageShape } from '../types';
import { getLayerInstance } from './layerutils';

export function exportTensorFlowCode(nodes: LayerNode[], inputShape: ImageShape): string {
  let initLines: string[] = [];
  let callLines: string[] = [];
  
  let layerIndex = 1;
  let currentShape = { ...inputShape };

  nodes.forEach(layer => {
    let nameStr = layer.name.replace(/[^a-zA-Z0-9_]/g, '') || layer.type;
    const attrName = `${nameStr}_${layerIndex++}`;
    try {
      const inst = getLayerInstance(layer);
      const moduleStr = inst.getTensorFlowCode(currentShape, '        ');
      if (moduleStr) {
        initLines.push(`self.${attrName} = ${moduleStr}`);
        callLines.push(`x = self.${attrName}(x)`);
      }
      currentShape = inst.calculateOutputShape(currentShape);
    } catch (e) {
      // Skip or default on error/unsupported
    }
  });

  let code = `import tensorflow as tf\nfrom tensorflow.keras import layers, Model\n\n`;
  code += `class CustomModel(Model):\n`;
  code += `    def __init__(self):\n`;
  code += `        super(CustomModel, self).__init__()\n`;
  
  if (initLines.length === 0) {
    code += `        pass\n`;
  } else {
    code += initLines.map(l => `        ${l}`).join('\n') + '\n';
  }
  
  code += `\n    def call(self, x):\n`;
  if (callLines.length === 0) {
    code += `        return x\n`;
  } else {
    code += callLines.map(l => `        ${l}`).join('\n') + '\n';
    code += `        return x\n`;
  }

  code += `\n# Example usage:\n`;
  code += `# model = CustomModel()\n`;
  code += `# In TensorFlow, the default tensor format is channels_last\n`;
  if (inputShape.d !== undefined) {
    code += `# x = tf.random.normal((1, ${inputShape.d}, ${inputShape.h}, ${inputShape.w}, ${inputShape.c}))\n`;
  } else {
    code += `# x = tf.random.normal((1, ${inputShape.h}, ${inputShape.w}, ${inputShape.c}))\n`;
  }
  code += `# output = model(x)\n`;
  code += `# print("Output shape:", output.shape)\n`;

  return code;
}
