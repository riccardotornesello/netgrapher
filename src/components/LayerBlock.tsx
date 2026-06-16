import React, { useState, useEffect, useRef } from "react";
import { motion } from "motion/react";
import { ChevronDown, ChevronRight, Trash2, Pencil } from "lucide-react";
import { ImageShape, LayerNode } from "../types";
import { cn } from "../lib/utils";
import { useNetwork } from "../context/NetworkContext";
import { LayerList } from "./LayerList";
import { LAYER_ICONS, LAYER_LABELS, LAYER_COLOR_CLASS } from "../lib/layerRegistry";

interface LayerBlockProps {
  node: LayerNode;
  inShape: ImageShape;
  outShape: ImageShape | null;
  compatibility?: { compatible: boolean; reason?: string };
}

export function LayerBlock({
  node,
  inShape,
  outShape,
  compatibility,
}: LayerBlockProps) {
  const { selectedNodeId, setSelectedNodeId, updateLayer, deleteLayer } =
    useNetwork();
  const [isEditing, setIsEditing] = useState(false);
  const [tempName, setTempName] = useState(node.name);
  const inputRef = useRef<HTMLInputElement>(null);

  const isSelected = selectedNodeId === node.id;
  const isGroup = node.type === "group";

  useEffect(() => {
    setTempName(node.name);
  }, [node.name]);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedNodeId(node.id);
  };

  const handleToggleExpand = (e: React.MouseEvent) => {
    e.stopPropagation();
    updateLayer(node.id, (n) => ({ ...n, isExpanded: !n.isExpanded }));
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    deleteLayer(node.id);
  };

  const startRename = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsEditing(true);
  };

  const handleSaveRename = () => {
    setIsEditing(false);
    const trimmed = tempName.trim();
    if (trimmed && trimmed !== node.name) {
      updateLayer(node.id, (n) => ({ ...n, name: trimmed }));
    } else {
      setTempName(node.name);
    }
  };

  const handleCancelRename = () => {
    setIsEditing(false);
    setTempName(node.name);
  };

  const isCompatible = compatibility?.compatible !== false;

  const baseClasses =
    "group/block relative w-full rounded-xl transition-all duration-200 cursor-pointer";
  let borderClasses = "";
  if (isSelected) {
    borderClasses = isCompatible
      ? "ring-2 ring-cyan-500 border-transparent shadow-lg shadow-cyan-900/20"
      : "ring-2 ring-red-500 border-transparent shadow-lg shadow-red-900/20";
  } else {
    borderClasses = isCompatible
      ? "border border-zinc-700 hover:border-zinc-500 scale-100"
      : "border border-red-900/40 hover:border-red-800 scale-100";
  }

  let bgClasses = "";
  if (node.type === "group") {
    bgClasses = isCompatible
      ? "bg-zinc-950/80 border-dashed backdrop-blur-md"
      : "bg-red-950/10 border border-dashed border-red-900/30 backdrop-blur-md";
  } else {
    bgClasses = isCompatible
      ? "bg-zinc-900 shadow-xl overflow-hidden"
      : "bg-red-950/15 shadow-xl overflow-hidden";
  }

  const iconColor = isCompatible ? (LAYER_COLOR_CLASS[node.type] ?? "text-zinc-400") : "text-red-400";

  return (
    <motion.div
      layout="position"
      initial={{ opacity: 0, y: 10, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      className={cn(baseClasses, borderClasses, bgClasses)}
      onClick={handleClick}
    >
      <div className="flex items-center justify-between p-3 select-none gap-3">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          {isGroup && (
            <button
              className="p-1 -ml-1 text-zinc-400 hover:text-zinc-200 rounded"
              onClick={handleToggleExpand}
            >
              {node.isExpanded ? (
                <ChevronDown className="w-4 h-4" />
              ) : (
                <ChevronRight className="w-4 h-4" />
              )}
            </button>
          )}

          <div
            className={cn("p-1.5 rounded-md bg-zinc-800 shrink-0", iconColor)}
          >
            {React.createElement(LAYER_ICONS[node.type], { className: "w-4 h-4" })}
          </div>

          <div className="flex-1 min-w-0">
            {isEditing ? (
              <input
                ref={inputRef}
                type="text"
                value={tempName}
                onChange={(e) => setTempName(e.target.value)}
                onBlur={handleSaveRename}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleSaveRename();
                  if (e.key === "Escape") handleCancelRename();
                }}
                onClick={(e) => e.stopPropagation()}
                className="bg-zinc-800 border border-zinc-700 rounded px-1.5 py-0.5 text-xs text-zinc-100 font-semibold w-full outline-none focus:border-indigo-500"
              />
            ) : (
              <div
                className="flex items-center gap-1.5 cursor-pointer min-w-0"
                onDoubleClick={startRename}
                title="Double click to rename"
              >
                <div className="font-semibold text-sm text-zinc-100 truncate">
                  {node.name}
                </div>
                <button
                  onClick={startRename}
                  className="p-0.5 text-zinc-600 hover:text-zinc-400 rounded opacity-0 group-hover/block:opacity-100 transition-opacity shrink-0 flex-shrink-0"
                  title="Rename"
                >
                  <Pencil className="w-3 h-3" />
                </button>
              </div>
            )}

            {(node.type === "conv2d" || node.type === "conv3d") &&
              node.params && (
                <div className="text-[11px] text-zinc-500 mt-0.5">
                  {node.params.filters} filters • {node.params.kernelSize}x
                  {node.params.kernelSize} • stride {node.params.stride}
                </div>
              )}
            {(node.type === "maxpool2d" || node.type === "maxpool3d") &&
              node.params && (
                <div className="text-[11px] text-zinc-500 mt-0.5">
                  pool {node.params.poolSize}x{node.params.poolSize} • stride{" "}
                  {node.params.stride}
                </div>
              )}
            {node.type === "linear" && node.params && (
              <div className="text-[11px] text-zinc-500 mt-0.5">
                {node.params.outFeatures} units
              </div>
            )}
            {node.type === "dropout" && node.params && (
              <div className="text-[11px] text-zinc-500 mt-0.5">
                rate {node.params.rate}
              </div>
            )}

            {!isCompatible && compatibility?.reason && (
              <div className="text-[10.5px] text-red-400 font-medium mt-1.5 flex items-start gap-1 px-2 py-1 rounded-md bg-red-950/50 border border-red-900/30">
                <span className="shrink-0 mt-1 animate-pulse bg-red-500 w-1.5 h-1.5 rounded-full inline-block" />
                <span>{compatibility.reason}</span>
              </div>
            )}
          </div>
        </div>

        <span className="text-[9px] text-zinc-400 font-mono bg-zinc-800/80 px-1.5 py-0.5 rounded border border-zinc-700/50 shrink-0 uppercase tracking-wide inline-flex items-center justify-center leading-none h-fit">
          {LAYER_LABELS[node.type]}
        </span>

        <button
          className={cn(
            "p-1.5 text-zinc-600 hover:text-red-400 hover:bg-red-950/30 rounded-md transition-colors shrink-0",
            isSelected
              ? "opacity-100"
              : "opacity-0 group-hover/block:opacity-100",
          )}
          onClick={handleDelete}
          title="Delete"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

      {isGroup && node.isExpanded && (
        <div className="px-4 pb-4 pt-1">
          <LayerList
            nodes={node.children || []}
            initialShape={isCompatible ? inShape : null}
            parentId={node.id}
          />
        </div>
      )}
    </motion.div>
  );
}
