import React from "react";
import { ImageShape, LayerNode } from "../types";
import {
  calculateOutputShape,
  checkLayerCompatibility,
} from "../lib/networkUtils";
import { LayerBlock } from "./LayerBlock";
import { ShapeToken } from "./ShapeToken";
import { AddBetweenButton } from "./AddBetweenButton";

interface LayerListProps {
  nodes: LayerNode[];
  initialShape: ImageShape | null;
  parentId?: string;
}

export function LayerList({ nodes, initialShape, parentId }: LayerListProps) {
  let currentShape = initialShape;
  let hasIncompatibilityOccurred = !initialShape;

  return (
    <div className="flex flex-col items-center w-full relative">
      <AddBetweenButton parentId={parentId} index={0} />

      {nodes.map((node, index) => {
        const inShape = currentShape;

        let compatibility = {
          compatible: true,
          reason: undefined as string | undefined,
        };

        if (hasIncompatibilityOccurred || !inShape) {
          compatibility = {
            compatible: false,
            reason:
              "Incoming dimensions are invalid due to previous configuration errors.",
          };
          hasIncompatibilityOccurred = true;
        } else {
          const res = checkLayerCompatibility(inShape, node);
          if (!res.compatible) {
            compatibility = { compatible: false, reason: res.reason };
            hasIncompatibilityOccurred = true;
          }
        }

        let outShape: ImageShape | null = null;
        if (compatibility.compatible && inShape) {
          outShape = calculateOutputShape(inShape, node);
          currentShape = outShape;
        } else {
          currentShape = null;
        }

        return (
          <React.Fragment key={node.id}>
            <LayerBlock
              node={node}
              inShape={inShape || { c: 0, h: 0, w: 0 }}
              outShape={outShape}
              compatibility={compatibility}
            />
            {outShape ? (
              <ShapeToken shape={outShape} />
            ) : (
              <div className="flex flex-col items-center my-0 select-none">
                <div className="w-[1px] h-4 bg-red-900/40 border-dashed border-l" />
                <div className="text-[10.5px] font-sans text-red-400 bg-red-950/25 border border-red-900/40 px-3 py-1 rounded-full shadow-sm flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
                  No connection
                </div>
                <div className="w-[1px] h-4 bg-red-900/40 border-dashed border-l" />
              </div>
            )}
            <AddBetweenButton parentId={parentId} index={index + 1} />
          </React.Fragment>
        );
      })}
    </div>
  );
}
