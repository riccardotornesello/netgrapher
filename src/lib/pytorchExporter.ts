import { LayerNode, ImageShape } from "../types";
import { getLayerInstance } from "../layers";

export function exportPytorchCode(
  nodes: LayerNode[],
  inputShape: ImageShape,
): string {
  let initLines: string[] = [];
  let forwardLines: string[] = [];

  let layerIndex = 1;
  let currentShape = { ...inputShape };

  nodes.forEach((layer) => {
    let nameStr = layer.name.replace(/[^a-zA-Z0-9_]/g, "") || layer.type;
    const attrName = `${nameStr}_${layerIndex++}`;
    try {
      const inst = getLayerInstance(layer);
      // We pass the indent context suited for class-level attributes placement in PyTorch
      const moduleStr = inst.getPytorchCode(currentShape, "        ");
      if (moduleStr) {
        initLines.push(`self.${attrName} = ${moduleStr}`);
        forwardLines.push(`x = self.${attrName}(x)`);
      }
      currentShape = inst.calculateOutputShape(currentShape);
    } catch (e) {
      // In case of any fallback/unregistered types
    }
  });

  let code = `import torch\nimport torch.nn as nn\nimport torch.nn.functional as F\n\n`;
  code += `class CustomModel(nn.Module):\n`;
  code += `    def __init__(self):\n`;
  code += `        super(CustomModel, self).__init__()\n`;

  if (initLines.length === 0) {
    code += `        pass\n`;
  } else {
    code += initLines.map((l) => `        ${l}`).join("\n") + "\n";
  }

  code += `\n    def forward(self, x):\n`;
  if (forwardLines.length === 0) {
    code += `        return x\n`;
  } else {
    code += forwardLines.map((l) => `        ${l}`).join("\n") + "\n";
    code += `        return x\n`;
  }

  code += `\n# Example usage:\n`;
  code += `# model = CustomModel()\n`;
  if (inputShape.d !== undefined) {
    code += `# x = torch.randn(1, ${inputShape.c}, ${inputShape.d}, ${inputShape.h}, ${inputShape.w})\n`;
  } else {
    code += `# x = torch.randn(1, ${inputShape.c}, ${inputShape.h}, ${inputShape.w})\n`;
  }
  code += `# output = model(x)\n`;
  code += `# print("Output shape:", output.shape)\n`;

  return code;
}
