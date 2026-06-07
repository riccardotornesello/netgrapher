import { ImageShape } from '../types';

export function ShapeToken({ shape }: { shape: ImageShape }) {
  const shapeStr = shape.d !== undefined 
    ? `[ ${shape.c}, ${shape.d}, ${shape.h}, ${shape.w} ]`
    : `[ ${shape.c}, ${shape.h}, ${shape.w} ]`;

  return (
    <div className="flex flex-col items-center my-0">
      <div className="w-[1px] h-4 bg-zinc-700/50" />
      <div className="px-3 py-1 rounded-full bg-zinc-900 border border-cyan-900/50 text-xs font-mono text-cyan-400 shadow-sm shadow-cyan-900/20">
        {shapeStr}
      </div>
      <div className="w-[1px] h-4 bg-zinc-700/50" />
    </div>
  );
}
