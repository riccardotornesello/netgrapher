import React, { createContext, useContext, useState, ReactNode } from "react";
import { ImageShape, LayerNode, LayerType, AddModalTarget } from "../types";
import { generateId } from "../lib/networkUtils";
import { updateNodeRecursive, deleteNodeRecursive } from "../lib/treeUtils";
import { LAYER_LABELS } from "../lib/layerRegistry";

interface NetworkContextType {
  layers: LayerNode[];
  inputShape: ImageShape;
  selectedNodeId: string | null;
  setInputShape: (s: ImageShape) => void;
  setSelectedNodeId: (id: string | null) => void;
  addLayer: (type: LayerType, parentId?: string, index?: number) => void;
  updateLayer: (id: string, updater: (node: LayerNode) => LayerNode) => void;
  deleteLayer: (id: string) => void;
  addModalTarget: AddModalTarget | null;
  setAddModalTarget: (target: AddModalTarget | null) => void;
  importModel: (layers: LayerNode[], inputShape: ImageShape) => void;
}

const NetworkContext = createContext<NetworkContextType | undefined>(undefined);

export function NetworkProvider({ children }: { children: ReactNode }) {
  const [layers, setLayers] = useState<LayerNode[]>([]);
  const [inputShape, setInputShape] = useState<ImageShape>({
    c: 3,
    h: 224,
    w: 224,
  });
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [addModalTarget, setAddModalTarget] = useState<AddModalTarget | null>(
    null,
  );

  const defaultParams: Record<LayerType, any> = {
    conv2d: { filters: 64, kernelSize: 3, stride: 1, padding: "same" },
    conv3d: { filters: 64, kernelSize: 3, stride: 1, padding: "same" },
    relu: {},
    sigmoid: {},
    tanh: {},
    leaky_relu: {},
    elu: {},
    gelu: {},
    group: {},
    maxpool2d: { poolSize: 2, stride: 2 },
    maxpool3d: { poolSize: 2, stride: 2 },
    linear: { outFeatures: 128 },
    flatten: {},
    dropout: { rate: 0.5 },
    batchnorm2d: {},
    batchnorm3d: {},
  };

  const addLayer = (type: LayerType, parentId?: string, index?: number) => {
    const newNode: LayerNode = {
      id: generateId(),
      type,
      name: LAYER_LABELS[type] ?? type,
      params: { ...defaultParams[type] },
      ...(type === "group" ? { children: [], isExpanded: true } : {}),
    };

    if (!parentId) {
      setLayers((prev) => {
        if (index !== undefined) {
          const updated = [...prev];
          updated.splice(index, 0, newNode);
          return updated;
        }
        return [...prev, newNode];
      });
      setSelectedNodeId(newNode.id);
    } else {
      updateLayer(parentId, (p) => {
        const children = p.children || [];
        if (index !== undefined) {
          const updated = [...children];
          updated.splice(index, 0, newNode);
          return { ...p, children: updated };
        }
        return { ...p, children: [...children, newNode] };
      });
      setSelectedNodeId(newNode.id);
    }
  };

  const updateLayer = (id: string, updater: (node: LayerNode) => LayerNode) => {
    setLayers((prev) => updateNodeRecursive(prev, id, updater));
  };

  const deleteLayer = (id: string) => {
    setLayers((prev) => deleteNodeRecursive(prev, id));
    if (selectedNodeId === id) {
      setSelectedNodeId(null);
    }
  };

  const importModel = (
    importedLayers: LayerNode[],
    importedInputShape: ImageShape,
  ) => {
    setLayers(importedLayers);
    setInputShape(importedInputShape);
    setSelectedNodeId(null);
  };

  return (
    <NetworkContext.Provider
      value={{
        layers,
        inputShape,
        selectedNodeId,
        setInputShape,
        setSelectedNodeId,
        addLayer,
        updateLayer,
        deleteLayer,
        addModalTarget,
        setAddModalTarget,
        importModel,
      }}
    >
      {children}
    </NetworkContext.Provider>
  );
}

export const useNetwork = () => {
  const context = useContext(NetworkContext);
  if (!context)
    throw new Error("useNetwork must be used within NetworkProvider");
  return context;
};
