import { LayerNode } from "../types";

export function updateNodeRecursive(
  nodes: LayerNode[],
  id: string,
  updater: (node: LayerNode) => LayerNode,
): LayerNode[] {
  return nodes.map((node) => {
    if (node.id === id) return updater(node);
    if (node.children) {
      return { ...node, children: updateNodeRecursive(node.children, id, updater) };
    }
    return node;
  });
}

export function deleteNodeRecursive(nodes: LayerNode[], id: string): LayerNode[] {
  return nodes
    .filter((node) => node.id !== id)
    .map((node) => {
      if (node.children) {
        return { ...node, children: deleteNodeRecursive(node.children, id) };
      }
      return node;
    });
}

export function findNode(nodes: LayerNode[], id: string): LayerNode | null {
  for (const n of nodes) {
    if (n.id === id) return n;
    if (n.children) {
      const found = findNode(n.children, id);
      if (found) return found;
    }
  }
  return null;
}
