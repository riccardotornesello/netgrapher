import React from "react";
import { Plus } from "lucide-react";
import { useNetwork } from "../context/NetworkContext";

interface AddBetweenButtonProps {
  parentId?: string;
  index: number;
}

export function AddBetweenButton({ parentId, index }: AddBetweenButtonProps) {
  const { setAddModalTarget } = useNetwork();

  return (
    <div className="relative w-full flex items-center justify-center h-8 group/add">
      {/* Subtle guide line */}
      <div className="absolute h-full w-[1px] bg-zinc-700/50 group-hover/add:bg-indigo-500/80 transition-colors z-0" />

      <button
        onClick={(e) => {
          e.stopPropagation();
          setAddModalTarget({ parentId, index });
        }}
        className="relative w-6 h-6 rounded-full bg-zinc-900 border border-zinc-800 hover:border-indigo-500 text-zinc-400 hover:text-indigo-400 hover:bg-indigo-950/40 flex items-center justify-center scale-75 group-hover/add:scale-100 shadow-lg cursor-pointer z-10 opacity-0 group-hover/add:opacity-100 transition-all duration-200"
        title="Add layer here"
      >
        <Plus className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}
