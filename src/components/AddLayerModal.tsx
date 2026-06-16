import React, { useEffect } from "react";
import { useNetwork } from "../context/NetworkContext";
import { LayerType } from "../types";
import { LAYERS } from "../layers";
import { LAYER_GROUPS, LAYER_GROUP_ORDER } from "../layers/groups";
import {
  X,
  Layers,
  Activity,
  Box,
  Maximize,
  GitCommit,
  Menu,
  CircleDashed,
  Sliders,
  LucideIcon,
} from "lucide-react";

const LAYER_ICONS: Partial<Record<LayerType, LucideIcon>> = {
  conv2d: Layers,
  conv3d: Layers,
  maxpool2d: Maximize,
  maxpool3d: Maximize,
  batchnorm2d: Sliders,
  batchnorm3d: Sliders,
  relu: Activity,
  sigmoid: Activity,
  tanh: Activity,
  leaky_relu: Activity,
  elu: Activity,
  gelu: Activity,
  dropout: CircleDashed,
  flatten: Menu,
  linear: GitCommit,
  group: Box,
};

const COLOR_HOVER: Record<string, string> = {
  indigo: "hover:border-indigo-500/50 hover:bg-indigo-950/10",
  orange: "hover:border-orange-500/50 hover:bg-orange-950/10",
  cyan: "hover:border-cyan-500/50 hover:bg-cyan-950/10",
  emerald: "hover:border-emerald-500/50 hover:bg-emerald-950/10",
  red: "hover:border-red-500/50 hover:bg-red-950/10",
  purple: "hover:border-purple-500/50 hover:bg-purple-950/10",
  blue: "hover:border-blue-500/50 hover:bg-blue-950/10",
};

const COLOR_ICON: Record<string, string> = {
  indigo: "text-indigo-400",
  orange: "text-orange-400",
  cyan: "text-cyan-400",
  emerald: "text-emerald-400",
  red: "text-red-400",
  purple: "text-purple-400",
  blue: "text-blue-400",
};

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
      className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-950/80 backdrop-blur-sm p-4 animate-in fade-in duration-200"
      onClick={() => setAddModalTarget(null)}
    >
      <div
        className="bg-zinc-900 border border-zinc-800 rounded-xl shadow-2xl w-full max-w-3xl flex flex-col max-h-[85vh] overflow-hidden"
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

            const hoverClass =
              COLOR_HOVER[group.colorToken] ?? COLOR_HOVER.indigo;
            const iconClass =
              COLOR_ICON[group.colorToken] ?? COLOR_ICON.indigo;

            return (
              <div key={category} className="space-y-3">
                <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-widest pl-1">
                  {group.name}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {layers.map((layer) => {
                    const Icon = LAYER_ICONS[layer.id] ?? Layers;
                    return (
                      <button
                        key={layer.id}
                        onClick={() => handleSelectLayer(layer.id)}
                        className={`flex items-start text-left gap-3.5 p-3.5 rounded-lg border border-zinc-850 bg-zinc-900/40 hover:bg-zinc-900/80 hover:scale-[1.01] transition-all cursor-pointer ${hoverClass}`}
                      >
                        <div className="p-2 rounded-md bg-zinc-850 mt-0.5 shrink-0">
                          <Icon className={`w-4 h-4 ${iconClass}`} />
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
