import React from "react";
import { motion } from "motion/react";
import { Database } from "lucide-react";
import { useNetwork } from "../context/NetworkContext";
import { cn } from "../lib/utils";

export function InputBlock() {
  const { inputShape, selectedNodeId, setSelectedNodeId } = useNetwork();

  const isSelected = selectedNodeId === "input";
  const is3D = inputShape.d !== undefined;

  const c = inputShape.c;
  const h = inputShape.h;
  const w = inputShape.w;
  const d = inputShape.d;

  const formattedShape = is3D
    ? `[ ${c}, ${d}, ${h}, ${w} ]`
    : `[ ${c}, ${h}, ${w} ]`;

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedNodeId("input");
  };

  return (
    <div className="w-full max-w-xl self-center">
      <motion.div
        layout
        onClick={handleClick}
        className={cn(
          "group/input border rounded-xl overflow-hidden transition-all duration-200 cursor-pointer shadow-lg",
          isSelected
            ? "border-cyan-500 bg-zinc-900 ring-2 ring-cyan-500/20"
            : "border-zinc-800 bg-zinc-900/60 hover:bg-zinc-900/95 hover:border-zinc-700",
        )}
      >
        {/* Input Header Panel */}
        <div className="flex flex-wrap items-start sm:items-center sm:justify-between gap-3 p-4 select-none">
          <div className="flex items-center gap-3">
            <div
              className={cn(
                "p-1.5 rounded-md bg-zinc-800 shrink-0 transition-colors",
                isSelected
                  ? "text-cyan-400"
                  : "text-zinc-400 group-hover/input:text-zinc-200",
              )}
            >
              <Database
                className={cn("w-4 h-4", isSelected && "animate-pulse")}
              />
            </div>
            <div>
              <div className="font-semibold text-sm text-zinc-100 flex items-center gap-1.5">
                Input Data
                <span className="text-[10px] text-zinc-500 font-normal">
                  (Click to customize dimensions)
                </span>
              </div>
              <div className="text-[11px] text-zinc-500 mt-0.5">
                Starting tensor dimensions for state computation
              </div>
            </div>
          </div>

          <div className="flex w-full sm:w-auto items-center justify-between sm:justify-end gap-2">
            {!isSelected && (
              <span className="text-xs text-zinc-400 shrink-0 group-hover/input:text-zinc-200 transition-colors">
                Configure
              </span>
            )}
            <div
              className={cn(
                "px-3 py-1.5 rounded-lg border text-xs font-mono font-semibold shadow-inner leading-none transition-all",
                isSelected
                  ? "bg-cyan-950/40 border-cyan-500 text-cyan-400"
                  : "bg-zinc-950/80 border-cyan-500/10 text-cyan-500/70 group-hover/input:border-cyan-500/30 group-hover/input:text-cyan-400",
              )}
            >
              {formattedShape}
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
