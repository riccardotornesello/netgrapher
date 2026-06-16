import React, { useEffect } from "react";
import { useNetwork } from "../context/NetworkContext";
import { LayerType } from "../types";
import { LAYERS } from "../layers";
import { LAYER_GROUPS, LAYER_GROUP_ORDER } from "../layers/groups";
import { LAYER_ICONS } from "../lib/layerRegistry";
import { X } from "lucide-react";

export function AddLayerModal() {
  const { addModalTarget, setAddModalTarget, addLayer } = useNetwork();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setAddModalTarget(null);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [setAddModalTarget]);

  if (!addModalTarget) return null;

  const handleSelectLayer = (type: LayerType) => {
    addLayer(type, addModalTarget.parentId, addModalTarget.index);
    setAddModalTarget(null);
  };

  const allDescriptions = Object.values(LAYERS).map((L) => L.description);

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-zinc-950/80 backdrop-blur-sm sm:p-4 animate-in fade-in duration-200"
      onClick={() => setAddModalTarget(null)}
    >
      <div
        className="bg-zinc-900 border border-zinc-800 sm:rounded-xl rounded-t-2xl shadow-2xl w-full sm:max-w-3xl flex flex-col h-[90vh] sm:h-auto sm:max-h-[85vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800/80">
          <div>
            <h2 className="text-sm font-semibold tracking-wider text-zinc-100 uppercase">
              Select Layer to Add
            </h2>
            <p className="text-xs text-zinc-500 mt-1">
              Insert at the desired position of the neural architecture
            </p>
          </div>
          <button
            onClick={() => setAddModalTarget(null)}
            className="p-1.5 text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800 rounded-md transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 flex-1 overflow-y-auto space-y-6 bg-[#0c0d10] custom-scrollbar">
          {LAYER_GROUP_ORDER.map((category) => {
            const group = LAYER_GROUPS[category];
            const layers = allDescriptions.filter(
              (d) => d.category === category,
            );
            if (layers.length === 0) return null;

            return (
              <div key={category} className="space-y-3">
                <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-widest pl-1">
                  {group.name}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {layers.map((layer) => {
                    const Icon = LAYER_ICONS[layer.id] ?? LAYER_ICONS.conv2d;
                    return (
                      <button
                        key={layer.id}
                        onClick={() => handleSelectLayer(layer.id)}
                        className={`flex items-start text-left gap-3.5 p-3.5 rounded-lg border border-zinc-850 bg-zinc-900/40 hover:bg-zinc-900/80 hover:scale-[1.01] transition-all cursor-pointer ${group.hoverColorClass}`}
                      >
                        <div className="p-2 rounded-md bg-zinc-850 mt-0.5 shrink-0">
                          <Icon className={`w-4 h-4 ${group.iconColorClass}`} />
                        </div>
                        <div className="space-y-1">
                          <h4 className="text-xs font-semibold text-zinc-200">
                            {layer.name.split(" (")[0]}
                          </h4>
                          {layer.concept && (
                            <p className="text-[11px] text-zinc-400 leading-normal font-sans">
                              {layer.concept.split(".")[0]}.
                            </p>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
