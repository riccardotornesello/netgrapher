import React from "react";
import { useNetwork } from "../context/NetworkContext";
import { LayerNode } from "../types";

export function Inspector() {
  const { layers, inputShape, setInputShape, selectedNodeId, updateLayer } =
    useNetwork();

  const findNode = (nodes: LayerNode[], id: string): LayerNode | null => {
    for (const n of nodes) {
      if (n.id === id) return n;
      if (n.children) {
        const found = findNode(n.children, id);
        if (found) return found;
      }
    }
    return null;
  };

  const selectedNode = selectedNodeId ? findNode(layers, selectedNodeId) : null;

  const handleParamChange = (key: string, value: any) => {
    if (!selectedNodeId) return;
    updateLayer(selectedNodeId, (n) => ({
      ...n,
      params: { ...n.params, [key]: value },
    }));
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!selectedNodeId) return;
    updateLayer(selectedNodeId, (n) => ({
      ...n,
      name: e.target.value,
    }));
  };

  if (selectedNodeId === "input") {
    return (
      <div className="p-6 h-full flex flex-col overflow-y-auto">
        <h2 className="text-[10px] font-bold tracking-widest text-cyan-500 uppercase mb-6">
          Configure Dimensions
        </h2>

        <div className="space-y-6">
          <div>
            <label className="flex items-center justify-between cursor-pointer select-none border-b border-zinc-800 pb-3 mb-4">
              <span className="text-xs font-semibold text-zinc-300">
                Dimension Type
              </span>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={inputShape.d !== undefined}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setInputShape({ ...inputShape, d: 32 });
                    } else {
                      const next = { ...inputShape };
                      delete next.d;
                      setInputShape(next);
                    }
                  }}
                  className="rounded border-zinc-800 bg-zinc-950 text-cyan-500 focus:ring-0 focus:ring-offset-0 w-3.5 h-3.5 cursor-pointer"
                />
                <span className="text-xs text-zinc-400">3D Volume</span>
              </div>
            </label>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-zinc-500 mb-1.5 font-mono">
                Channels (C)
              </label>
              <input
                type="number"
                value={inputShape.c}
                onChange={(e) =>
                  setInputShape({
                    ...inputShape,
                    c: Math.max(1, parseInt(e.target.value) || 1),
                  })
                }
                className="w-full bg-zinc-900 border border-zinc-800 focus:border-cyan-500 rounded-lg px-2.5 py-1.5 text-xs text-zinc-200 font-semibold outline-none"
              />
            </div>

            {inputShape.d !== undefined ? (
              <div>
                <label className="block text-xs font-medium text-zinc-500 mb-1.5 font-mono">
                  Depth (D)
                </label>
                <input
                  type="number"
                  value={inputShape.d}
                  onChange={(e) =>
                    setInputShape({
                      ...inputShape,
                      d: Math.max(1, parseInt(e.target.value) || 1),
                    })
                  }
                  className="w-full bg-zinc-900 border border-zinc-800 focus:border-cyan-500 rounded-lg px-2.5 py-1.5 text-xs text-zinc-200 font-semibold outline-none"
                />
              </div>
            ) : (
              <div className="opacity-30 pointer-events-none">
                <label className="block text-xs font-medium text-zinc-600 mb-1.5 font-mono">
                  Depth (N/A)
                </label>
                <div className="w-full bg-zinc-900/40 border border-zinc-800/20 rounded-lg px-2.5 py-1.5 text-xs text-zinc-600 outline-none font-mono">
                  —
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-medium text-zinc-500 mb-1.5 font-mono">
                Height (H)
              </label>
              <input
                type="number"
                value={inputShape.h}
                onChange={(e) =>
                  setInputShape({
                    ...inputShape,
                    h: Math.max(1, parseInt(e.target.value) || 1),
                  })
                }
                className="w-full bg-zinc-900 border border-zinc-800 focus:border-cyan-500 rounded-lg px-2.5 py-1.5 text-xs text-zinc-200 font-semibold outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-zinc-500 mb-1.5 font-mono">
                Width (W)
              </label>
              <input
                type="number"
                value={inputShape.w}
                onChange={(e) =>
                  setInputShape({
                    ...inputShape,
                    w: Math.max(1, parseInt(e.target.value) || 1),
                  })
                }
                className="w-full bg-zinc-900 border border-zinc-800 focus:border-cyan-500 rounded-lg px-2.5 py-1.5 text-xs text-zinc-200 font-semibold outline-none"
              />
            </div>
          </div>

          <div className="pt-4 border-t border-zinc-800/60">
            <div className="text-[10px] font-semibold text-zinc-500 uppercase tracking-widest mb-3">
              Quick Presets
            </div>
            <div className="grid grid-cols-1 gap-2">
              <button
                type="button"
                onClick={() => setInputShape({ c: 3, h: 224, w: 224 })}
                className="px-2.5 py-2 text-left text-xs font-medium text-zinc-400 hover:text-cyan-400 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 rounded-lg transition-all"
              >
                ImageNet{" "}
                <span className="text-[10px] text-zinc-500 font-mono ml-1.5">
                  (3 × 224 × 224)
                </span>
              </button>
              <button
                type="button"
                onClick={() => setInputShape({ c: 1, h: 28, w: 28 })}
                className="px-2.5 py-2 text-left text-xs font-medium text-zinc-400 hover:text-cyan-400 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 rounded-lg transition-all"
              >
                MNIST/Fashion{" "}
                <span className="text-[10px] text-zinc-500 font-mono ml-1.5">
                  (1 × 28 × 28)
                </span>
              </button>
              <button
                type="button"
                onClick={() => setInputShape({ c: 1, h: 128, w: 256 })}
                className="px-2.5 py-2 text-left text-xs font-medium text-zinc-400 hover:text-cyan-400 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 rounded-lg transition-all"
              >
                Spectrogram{" "}
                <span className="text-[10px] text-zinc-500 font-mono ml-1.5">
                  (1 × 128 × 256)
                </span>
              </button>
              <button
                type="button"
                onClick={() => setInputShape({ c: 3, d: 32, h: 64, w: 64 })}
                className="px-2.5 py-2 text-left text-xs font-medium text-zinc-400 hover:text-cyan-400 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 rounded-lg transition-all"
              >
                3D Imaging{" "}
                <span className="text-[10px] text-zinc-500 font-mono ml-1.5">
                  (3 × 32 × 64 × 64)
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!selectedNodeId || !selectedNode) {
    return null;
  }

  return (
    <div className="p-6 h-full flex flex-col overflow-y-auto">
      <h2 className="text-[10px] font-bold tracking-widest text-zinc-500 uppercase mb-6">
        Inspect Layer
      </h2>

      <div className="space-y-6">
        <div>
          <label className="block text-xs text-zinc-500 mb-1.5 font-medium">
            Layer Name
          </label>
          <input
            type="text"
            value={selectedNode.name}
            onChange={handleNameChange}
            className="w-full bg-zinc-900 border border-zinc-800 focus:border-cyan-500 rounded-md px-3 py-2 text-sm text-zinc-200 outline-none transition-colors"
          />
        </div>

        {(selectedNode.type === "conv2d" || selectedNode.type === "conv3d") && (
          <div className="space-y-4">
            <h3 className="text-xs font-semibold text-zinc-300 border-b border-zinc-800 pb-2 mb-4">
              Convolution Parameters
            </h3>

            <div>
              <label className="flex items-center justify-between text-xs text-zinc-400 mb-1.5">
                <span>Filters (Out Channels)</span>
              </label>
              <input
                type="number"
                value={selectedNode.params?.filters || 32}
                onChange={(e) =>
                  handleParamChange("filters", parseInt(e.target.value) || 1)
                }
                className="w-full bg-zinc-900 border border-zinc-800 focus:border-indigo-500 rounded-md px-3 py-2 text-sm text-zinc-200 outline-none transition-colors"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-zinc-400 mb-1.5">
                  Kernel Size
                </label>
                <input
                  type="number"
                  value={selectedNode.params?.kernelSize || 3}
                  onChange={(e) =>
                    handleParamChange(
                      "kernelSize",
                      parseInt(e.target.value) || 1,
                    )
                  }
                  className="w-full bg-zinc-900 border border-zinc-800 focus:border-indigo-500 rounded-md px-3 py-2 text-sm text-zinc-200 outline-none transition-colors"
                />
              </div>
              <div>
                <label className="block text-xs text-zinc-400 mb-1.5">
                  Stride
                </label>
                <input
                  type="number"
                  value={selectedNode.params?.stride || 1}
                  onChange={(e) =>
                    handleParamChange("stride", parseInt(e.target.value) || 1)
                  }
                  className="w-full bg-zinc-900 border border-zinc-800 focus:border-indigo-500 rounded-md px-3 py-2 text-sm text-zinc-200 outline-none transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs text-zinc-400 mb-1.5">
                Padding
              </label>
              <div className="flex flex-col gap-2">
                <div className="flex bg-zinc-900 rounded-md p-1 border border-zinc-800">
                  <button
                    className={`flex-1 text-xs py-1.5 rounded outline-none transition-colors ${selectedNode.params?.padding === "valid" ? "bg-zinc-800 text-zinc-200 shadow-sm" : "text-zinc-500 hover:text-zinc-400"}`}
                    onClick={() => handleParamChange("padding", "valid")}
                  >
                    Valid
                  </button>
                  <button
                    className={`flex-1 text-xs py-1.5 rounded outline-none transition-colors ${selectedNode.params?.padding === "same" ? "bg-zinc-800 text-zinc-200 shadow-sm" : "text-zinc-500 hover:text-zinc-400"}`}
                    onClick={() => handleParamChange("padding", "same")}
                  >
                    Same
                  </button>
                  <button
                    className={`flex-1 text-xs py-1.5 rounded outline-none transition-colors ${typeof selectedNode.params?.padding === "number" ? "bg-zinc-800 text-zinc-200 shadow-sm" : "text-zinc-500 hover:text-zinc-400"}`}
                    onClick={() => handleParamChange("padding", 1)}
                  >
                    Custom
                  </button>
                </div>
                {typeof selectedNode.params?.padding === "number" && (
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs text-zinc-500">Value:</span>
                    <input
                      type="number"
                      value={selectedNode.params?.padding}
                      onChange={(e) =>
                        handleParamChange(
                          "padding",
                          parseInt(e.target.value) || 0,
                        )
                      }
                      className="flex-1 bg-zinc-900 border border-zinc-800 focus:border-indigo-500 rounded-md px-2 py-1.5 text-sm text-zinc-200 outline-none transition-colors"
                    />
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {(selectedNode.type === "relu" ||
          selectedNode.type === "flatten" ||
          selectedNode.type === "batchnorm2d" ||
          selectedNode.type === "batchnorm3d" ||
          selectedNode.type === "group") && (
          <div className="pt-4 text-center">
            <span className="text-xs text-zinc-500">
              {selectedNode.type === "group"
                ? "No configurable parameters for this group."
                : "No configurable parameters for this layer."}
            </span>
          </div>
        )}

        {(selectedNode.type === "maxpool2d" ||
          selectedNode.type === "maxpool3d") && (
          <div className="space-y-4">
            <h3 className="text-xs font-semibold text-zinc-300 border-b border-zinc-800 pb-2 mb-4">
              Pooling Parameters
            </h3>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-zinc-400 mb-1.5">
                  Pool Size
                </label>
                <input
                  type="number"
                  value={selectedNode.params?.poolSize || 2}
                  onChange={(e) =>
                    handleParamChange("poolSize", parseInt(e.target.value) || 1)
                  }
                  className="w-full bg-zinc-900 border border-zinc-800 focus:border-indigo-500 rounded-md px-3 py-2 text-sm text-zinc-200 outline-none transition-colors"
                />
              </div>
              <div>
                <label className="block text-xs text-zinc-400 mb-1.5">
                  Stride
                </label>
                <input
                  type="number"
                  value={selectedNode.params?.stride || 2}
                  onChange={(e) =>
                    handleParamChange("stride", parseInt(e.target.value) || 1)
                  }
                  className="w-full bg-zinc-900 border border-zinc-800 focus:border-indigo-500 rounded-md px-3 py-2 text-sm text-zinc-200 outline-none transition-colors"
                />
              </div>
            </div>
          </div>
        )}

        {selectedNode.type === "linear" && (
          <div className="space-y-4">
            <h3 className="text-xs font-semibold text-zinc-300 border-b border-zinc-800 pb-2 mb-4">
              Linear/Dense Parameters
            </h3>
            <div>
              <label className="block text-xs text-zinc-400 mb-1.5">
                Out Features (Units)
              </label>
              <input
                type="number"
                value={selectedNode.params?.outFeatures || 128}
                onChange={(e) =>
                  handleParamChange(
                    "outFeatures",
                    parseInt(e.target.value) || 1,
                  )
                }
                className="w-full bg-zinc-900 border border-zinc-800 focus:border-indigo-500 rounded-md px-3 py-2 text-sm text-zinc-200 outline-none transition-colors"
              />
            </div>
          </div>
        )}

        {selectedNode.type === "dropout" && (
          <div className="space-y-4">
            <h3 className="text-xs font-semibold text-zinc-300 border-b border-zinc-800 pb-2 mb-4">
              Dropout Parameters
            </h3>
            <div>
              <label className="block text-xs text-zinc-400 mb-1.5">
                Rate (Probability)
              </label>
              <input
                type="number"
                step="0.1"
                min="0"
                max="1"
                value={selectedNode.params?.rate || 0.5}
                onChange={(e) =>
                  handleParamChange("rate", parseFloat(e.target.value) || 0)
                }
                className="w-full bg-zinc-900 border border-zinc-800 focus:border-indigo-500 rounded-md px-3 py-2 text-sm text-zinc-200 outline-none transition-colors"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
