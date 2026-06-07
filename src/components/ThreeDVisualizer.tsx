import React, { useState, useEffect, useRef } from 'react';
import { useNetwork } from '../context/NetworkContext';
import { ImageShape, LayerNode, LayerType } from '../types';
import { checkLayerCompatibility, calculateOutputShape } from '../lib/networkUtils';
import { computeLayerStats } from '../lib/calculations';
import { 
  Rotate3d, 
  Layers, 
  Coins, 
  Cpu, 
  Play, 
  Plus, 
  Minus, 
  Maximize2, 
  Move, 
  Box, 
  HelpCircle,
  AlertTriangle,
  Flame,
  Zap,
  RefreshCw,
  Scale
} from 'lucide-react';
import { cn } from '../lib/utils';

// Math helpers
const cos = Math.cos;
const sin = Math.sin;
const PI = Math.PI;

interface Point3D {
  x: number;
  y: number;
  z: number;
}

interface Point2D {
  x: number;
  y: number;
}

interface PolygonItem {
  type: 'face' | 'line' | 'text' | 'kernel_face' | 'pulse';
  points: Point3D[];
  projectedPoints?: Point2D[];
  avgZ: number; // depth value for painter sorting
  fill?: string;
  stroke?: string;
  strokeWidth?: number;
  strokeDasharray?: string;
  opacity?: number;
  layerId?: string;
  tooltipText?: string;
  isClickable?: boolean;
}

export function ThreeDVisualizer() {
  const { layers, inputShape, selectedNodeId, setSelectedNodeId } = useNetwork();
  
  // Custom camera & view states
  const [yaw, setYaw] = useState<number>(-35); // Rotation in degrees around Y
  const [pitch, setPitch] = useState<number>(20); // Rotation in degrees around X
  const [zoom, setZoom] = useState<number>(0.95);
  const [panX, setPanX] = useState<number>(0);
  const [panY, setPanY] = useState<number>(-20);
  
  const [dragMode, setDragMode] = useState<'rotate' | 'pan'>('rotate');
  const animateKernel = true;
  
  // Ref for drag tracking
  const viewportRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef<boolean>(false);
  const previousMouse = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  
  // Animated timeline ticks
  const [animationTick, setAnimationTick] = useState<number>(0);

  useEffect(() => {
    let frameId: number;
    const tick = () => {
      setAnimationTick(prev => (prev + 1.2) % 360);
      frameId = requestAnimationFrame(tick);
    };
    frameId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frameId);
  }, []);

  // Compute layers shapes along the sequence
  interface TraceLayer {
    node: LayerNode | null; // null represents the Input itself
    inShape: ImageShape;
    outShape: ImageShape | null;
    isCompatible: boolean;
    reason?: string;
    layerIndex: number;
  }

  const traceLayers: TraceLayer[] = [];
  let currentShape: ImageShape | null = { ...inputShape };
  let hasError = false;

  // Add the base input first
  traceLayers.push({
    node: null,
    inShape: inputShape,
    outShape: inputShape,
    isCompatible: true,
    layerIndex: 0
  });

  layers.forEach((node, i) => {
    const inShape = currentShape ? { ...currentShape } : { c: 0, h: 0, w: 0 };
    let outShape: ImageShape | null = null;
    let isCompatible = true;
    let reason = '';

    if (hasError || !currentShape) {
      isCompatible = false;
      reason = 'Interrupted due to previous layer incompatibility';
      hasError = true;
    } else {
      const res = checkLayerCompatibility(currentShape, node);
      if (!res.compatible) {
        isCompatible = false;
        reason = res.reason || 'Shape incompatibility';
        hasError = true;
        currentShape = null;
      } else {
        outShape = calculateOutputShape(currentShape, node);
        currentShape = outShape;
      }
    }

    traceLayers.push({
      node,
      inShape,
      outShape,
      isCompatible,
      reason,
      layerIndex: i + 1
    });
  });

  // Calculate coordinates and geometry
  // Let's space the layers along the X axis
  const layerSpacing = 160;
  const totalWidth = (traceLayers.length - 1) * layerSpacing;
  const startX = -totalWidth / 2;

  // Layout scales for visualization
  // Scales physical heights/widths and channel depths cleanly
  const scaleHW = (val: number | undefined) => {
    if (!val) return 5;
    // Map standard sizes gracefully
    if (val >= 224) return 65;
    if (val >= 112) return 52;
    if (val >= 56) return 40;
    if (val >= 28) return 28;
    if (val >= 14) return 18;
    return Math.max(8, val * 1.5);
  };

  const scaleC = (val: number | undefined) => {
    if (!val) return 5;
    if (val >= 512) return 40;
    if (val >= 256) return 32;
    if (val >= 128) return 24;
    if (val >= 64) return 18;
    if (val >= 32) return 12;
    return Math.max(4, val * 0.5);
  };

  // 3D Point projection math
  const projectPoint = (p: Point3D): Point2D => {
    // 1. Convert rotation degrees to radians
    const yawRad = (yaw * PI) / 180;
    const pitchRad = (pitch * PI) / 180;

    // 2. Rotate around Y-axis (Yaw)
    const x1 = p.x * cos(yawRad) - p.z * sin(yawRad);
    const z1 = p.x * sin(yawRad) + p.z * cos(yawRad);
    const y1 = p.y;

    // 3. Rotate around X-axis (Pitch)
    const x2 = x1;
    const y2 = y1 * cos(pitchRad) - z1 * sin(pitchRad);
    const z2 = y1 * sin(pitchRad) + z1 * cos(pitchRad);

    // 4. Transform to 2D screen coordinate with zoom and pan
    const screenX = 350 + panX + x2 * zoom;
    const screenY = 220 + panY - y2 * zoom;

    return { x: screenX, y: screenY };
  };

  // Collect items to sort with Painters Algorithm
  const polygonItems: PolygonItem[] = [];

  // Helper to add a 3D box bounding polygon item properties
  const addBox3D = (
    cx: number, 
    cy: number, 
    cz: number, 
    dx: number, 
    dy: number, 
    dz: number, 
    colors: { fill: string; stroke: string; opacity?: number },
    nodeId: string,
    layerTitle: string
  ) => {
    // 8 vertices of the box
    const hw = dx / 2;
    const hh = dy / 2;
    const hd = dz / 2;

    const v: Point3D[] = [
      { x: cx - hw, y: cy - hh, z: cz - hd }, // 0
      { x: cx + hw, y: cy - hh, z: cz - hd }, // 1
      { x: cx + hw, y: cy + hh, z: cz - hd }, // 2
      { x: cx - hw, y: cy + hh, z: cz - hd }, // 3
      { x: cx - hw, y: cy - hh, z: cz + hd }, // 4
      { x: cx + hw, y: cy - hh, z: cz + hd }, // 5
      { x: cx + hw, y: cy + hh, z: cz + hd }, // 6
      { x: cx - hw, y: cy + hh, z: cz + hd }  // 7
    ];

    // Define the 6 faces with vertices
    const faces = [
      { indices: [0, 1, 2, 3], name: 'back' },
      { indices: [4, 5, 6, 7], name: 'front' },
      { indices: [0, 4, 7, 3], name: 'left' },
      { indices: [1, 5, 6, 2], name: 'right' },
      { indices: [3, 2, 6, 7], name: 'top' },
      { indices: [0, 1, 5, 4], name: 'bottom' }
    ];

    faces.forEach((face) => {
      const facePoints = face.indices.map(idx => v[idx]);
      
      // Calculate average Z (depth distance) for sorting
      // We'll compute depth in rotated coordinate system
      const yawRad = (yaw * PI) / 180;
      const pitchRad = (pitch * PI) / 180;

      const avgRotatedZ = facePoints.reduce((acc, pt) => {
        // Rotate matching camera
        const x1 = pt.x * cos(yawRad) - pt.z * sin(yawRad);
        const z1 = pt.x * sin(yawRad) + pt.z * cos(yawRad);
        const y2 = pt.y * cos(pitchRad) - z1 * sin(pitchRad);
        const z2 = pt.y * sin(pitchRad) + z1 * cos(pitchRad);
        return acc + z2;
      }, 0) / 4;

      polygonItems.push({
        type: 'face',
        points: facePoints,
        avgZ: avgRotatedZ,
        fill: colors.fill,
        stroke: colors.stroke,
        strokeWidth: 1.2,
        opacity: colors.opacity ?? 0.85,
        layerId: nodeId,
        tooltipText: layerTitle,
        isClickable: true
      });
    });
  };

  // Build geometrics of traceLayers
  traceLayers.forEach((tl, i) => {
    const layerX = startX + i * layerSpacing;
    const isNodeSelected = tl.node && selectedNodeId === tl.node.id;
    const isInput = tl.node === null;
    const activeNodeId = tl.node ? tl.node.id : 'input';

    // Set colors based on state
    let colors = {
      fill: isInput ? 'rgba(34, 197, 94, 0.15)' : 'rgba(99, 102, 241, 0.15)',
      stroke: isInput ? '#22c55e' : '#6366f1',
      opacity: isNodeSelected ? 0.92 : 0.75
    };

    if (isNodeSelected) {
      colors.fill = 'rgba(6, 182, 212, 0.28)';
      colors.stroke = '#06b6d4';
    }

    if (!tl.isCompatible) {
      colors.fill = 'rgba(239, 68, 68, 0.12)';
      colors.stroke = '#ef4444';
    }

    // Determine spatial dimensions
    const displayH = scaleHW(tl.outShape?.h);
    const displayW = scaleHW(tl.outShape?.w);
    const displayC = scaleC(tl.outShape?.c);
    const displayD = tl.outShape?.d ? scaleHW(tl.outShape.d) * 0.4 : 6;

    const layerTitle = isInput 
      ? `Input Map\n[${tl.inShape.c}×${tl.inShape.h}×${tl.inShape.w}]` 
      : `${tl.node?.name}\n[${tl.outShape?.c}×${tl.outShape?.h}×${tl.outShape?.w}]`;

    if (tl.isCompatible && tl.outShape) {
      // Draw actual 3D Box modeling output tensor of this module stage
      addBox3D(
        layerX, 
        0, 
        0, 
        displayD, // thickness along coordinate X
        displayH, // height along coordinate Y
        displayW, // width along coordinate Z
        colors,
        activeNodeId,
        layerTitle
      );

      // Add grid indices inside the input/output faces for details
      if (isNodeSelected || isInput) {
        // Render detailed mesh wire lines on the front face of the box
        // We will just draw the contour highlight
      }
    } else {
      // Display a beautiful error 3D red wireframe box
      addBox3D(
        layerX,
        0, 
        0, 
        15, 
        30, 
        30, 
        { fill: 'rgba(239, 68, 68, 0.05)', stroke: '#ef4444', opacity: 0.6 },
        activeNodeId,
        `Error: ${tl.reason}`
      );
    }

    // Connect layer i-1 to layer i with wire conduits
    if (i > 0) {
      const prevX = startX + (i - 1) * layerSpacing;
      const prevTL = traceLayers[i - 1];

      if (prevTL.isCompatible && tl.isCompatible && prevTL.outShape && tl.outShape) {
        // Draw matching corner lines between consecutive box interfaces
        // We link vertices top-left, top-right, bottom-left, bottom-right of output Map faces
        const prevH = scaleHW(prevTL.outShape.h) / 2;
        const prevW = scaleHW(prevTL.outShape.w) / 2;
        const prevD = scaleHW(prevTL.outShape.d ? prevTL.outShape.d : 1) * 0.4 / 2;

        const currH = scaleHW(tl.outShape.h) / 2;
        const currW = scaleHW(tl.outShape.w) / 2;
        const currD = scaleHW(tl.outShape.d ? tl.outShape.d : 1) * 0.4 / 2;

        const corners = [
          { dy1: prevH, dz1: prevW, dy2: currH, dz2: currW },
          { dy1: -prevH, dz1: prevW, dy2: -currH, dz2: currW },
          { dy1: prevH, dz1: -prevW, dy2: currH, dz2: -currW },
          { dy1: -prevH, dz1: -prevW, dy2: -currH, dz2: -currW }
        ];

        corners.forEach((cItem, ci) => {
          const pt1: Point3D = { x: prevX + prevD, y: cItem.dy1, z: cItem.dz1 };
          const pt2: Point3D = { x: layerX - currD, y: cItem.dy2, z: cItem.dz2 };

          // Rotated middle point for painters depth
          const yawRad = (yaw * PI) / 180;
          const pitchRad = (pitch * PI) / 180;
          const avgZ = ((pt1.z + pt2.z)/2) * cos(yawRad) + ((pt1.x + pt2.x)/2) * sin(yawRad);

          polygonItems.push({
            type: 'line',
            points: [pt1, pt2],
            avgZ: avgZ - 100, // force below solid faces
            stroke: tl.node && selectedNodeId === tl.node?.id ? '#06b6d4' : '#3f3f46',
            strokeWidth: 1.0,
            strokeDasharray: '3,4',
            opacity: tl.node && selectedNodeId === tl.node?.id ? 0.70 : 0.35
          });
        });
      }
    }

    // Animating sweeping convolutional kernel grid on selected Conv maps!
    if (animateKernel && tl.node && isNodeSelected && tl.isCompatible && traceLayers[i - 1].isCompatible) {
      const prevX = startX + (i - 1) * layerSpacing;
      const prevTL = traceLayers[i - 1];

      if (prevTL.outShape && tl.outShape && (tl.node.type === 'conv2d' || tl.node.type === 'conv3d' || tl.node.type === 'maxpool2d' || tl.node.type === 'maxpool3d')) {
        // Animate sweeping window coordinates across the face row-by-row step-by-step snapping ("di scatto riga per riga")
        const gridRows = 5;
        const gridCols = 5;
        const totalSteps = gridRows * gridCols;
        const stepIndex = Math.floor((animationTick / 360) * totalSteps) % totalSteps;
        const rowIndex = Math.floor(stepIndex / gridCols);
        const colIndex = stepIndex % gridCols;

        // Map row and column indices to [0.15, 0.85] range so it sweeps across the face beautifully
        const sweepX = 0.15 + (0.70 * (colIndex / (gridCols - 1)));
        const sweepY = 0.15 + (0.70 * (rowIndex / (gridRows - 1)));

        // Source dimensions
        const srcH = scaleHW(prevTL.outShape.h);
        const srcW = scaleHW(prevTL.outShape.w);
        const srcD = scaleHW(prevTL.outShape.d ? prevTL.outShape.d : 1) * 0.4;
        
        // Kernel sizes
        const kParams = tl.node.params || {};
        const kSize = kParams.kernelSize || kParams.poolSize || 3;
        const kScale = Math.max(8, kSize * 4.5);

        const kCenterX = (sweepX - 0.5) * (srcW - kScale);
        const kCenterY = (sweepY - 0.5) * (srcH - kScale);

        // Define a 3D bounding box for kernel on the source faces layer
        const pt1: Point3D = { x: prevX + srcD/2, y: kCenterY - kScale/2, z: kCenterX - kScale/2 };
        const pt2: Point3D = { x: prevX + srcD/2 + 2, y: kCenterY + kScale/2, z: kCenterX + kScale/2 };
        
        // Sweeping target pixel inside the output tensor node i
        const outH = scaleHW(tl.outShape.h);
        const outW = scaleHW(tl.outShape.w);
        const outD = scaleHW(tl.outShape.d ? tl.outShape.d : 1) * 0.4;

        const targetY = (sweepY - 0.5) * outH;
        const targetZ = (sweepX - 0.5) * outW;
        const targetPt: Point3D = { x: layerX - outD/2, y: targetY, z: targetZ };

        // Push Kernel polygon
        const yawRad = (yaw * PI) / 180;
        const pitchRad = (pitch * PI) / 180;
        const avgZ = ((pt1.z + targetPt.z) / 2) * cos(yawRad) + ((pt1.x + targetPt.x) / 2) * sin(yawRad);

        // Add 3D projected lines representing the kernel focus funnel
        const funnelPts = [
          { y: kCenterY - kScale/2, z: kCenterX - kScale/2 },
          { y: kCenterY + kScale/2, z: kCenterX - kScale/2 },
          { y: kCenterY + kScale/2, z: kCenterX + kScale/2 },
          { y: kCenterY - kScale/2, z: kCenterX + kScale/2 }
        ];

        funnelPts.forEach((fp) => {
          polygonItems.push({
            type: 'line',
            points: [
              { x: prevX + srcD/2, y: fp.y, z: fp.z },
              targetPt
            ],
            avgZ: avgZ + 50,
            stroke: '#06b6d4',
            strokeWidth: 0.9,
            opacity: 0.65
          });
        });

        // Push translucent highlighted kernel scanning plane on Input tensor backface
        polygonItems.push({
          type: 'kernel_face',
          points: [
            { x: prevX + srcD/2 + 1, y: kCenterY - kScale/2, z: kCenterX - kScale/2 },
            { x: prevX + srcD/2 + 1, y: kCenterY + kScale/2, z: kCenterX - kScale/2 },
            { x: prevX + srcD/2 + 1, y: kCenterY + kScale/2, z: kCenterX + kScale/2 },
            { x: prevX + srcD/2 + 1, y: kCenterY - kScale/2, z: kCenterX + kScale/2 }
          ],
          avgZ: avgZ + 80,
          fill: 'rgba(6, 182, 212, 0.45)',
          stroke: '#22d3ee',
          strokeWidth: 1.2
        });
      }
    }
  });

  // Project all points for painters algorithm
  polygonItems.forEach(item => {
    item.projectedPoints = item.points.map(pt => projectPoint(pt));
  });

  // Sort polygon items back-to-front
  polygonItems.sort((a, b) => b.avgZ - a.avgZ);

  // Mouse drag handlers to rotate or pan in 3D
  const handleMouseDown = (e: React.MouseEvent) => {
    isDragging.current = true;
    previousMouse.current = { x: e.clientX, y: e.clientY };
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging.current) return;
    const deltaX = e.clientX - previousMouse.current.x;
    const deltaY = e.clientY - previousMouse.current.y;

    if (dragMode === 'rotate') {
      setYaw(prev => (prev + deltaX * 0.45) % 360);
      setPitch(prev => Math.max(-80, Math.min(80, prev - deltaY * 0.4)));
    } else {
      setPanX(prev => prev + deltaX);
      setPanY(prev => prev - deltaY);
    }

    previousMouse.current = { x: e.clientX, y: e.clientY };
  };

  const handleMouseUp = () => {
    isDragging.current = false;
  };

  const resetView = () => {
    setYaw(-35);
    setPitch(20);
    setZoom(0.95);
    setPanX(0);
    setPanY(-20);
  };

  // Find info about the currently selected node
  const selectedNodeIndex = traceLayers.findIndex(tl => tl.node?.id === selectedNodeId);
  const selectedTrace = selectedNodeIndex !== -1 ? traceLayers[selectedNodeIndex] : traceLayers[0]; // defaults to input
  const stats = selectedTrace.outShape 
    ? computeLayerStats(selectedTrace.inShape, selectedTrace.node || { id: 'in', name: 'Input', type: 'flatten' }, selectedTrace.outShape)
    : null;

  return (
    <div className="flex flex-col xl:flex-row gap-6 h-full min-h-[520px] relative text-zinc-300">
      
      {/* 3D Viewport Column */}
      <div className="flex-1 bg-zinc-950/40 rounded-2xl border border-zinc-800/40 backdrop-blur-md flex flex-col relative overflow-hidden h-[420px] xl:h-auto min-h-[380px]">
        {/* Quick controls bar */}
        <div className="absolute top-4 left-4 z-20 flex flex-wrap gap-1.5 items-center">
          <button
            onClick={() => setDragMode('rotate')}
            className={cn(
              "p-2 rounded-lg text-xs font-medium cursor-pointer transition-all flex items-center gap-1.5",
              dragMode === 'rotate' ? "bg-cyan-950/50 border border-cyan-800/60 text-cyan-400" : "bg-zinc-900/60 border border-zinc-800/60 text-zinc-400 hover:text-zinc-200"
            )}
            title="Drag mouse to rotate in 3D"
          >
            <Rotate3d className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Rotate</span>
          </button>
          
          <button
            onClick={() => setDragMode('pan')}
            className={cn(
              "p-2 rounded-lg text-xs font-medium cursor-pointer transition-all flex items-center gap-1.5",
              dragMode === 'pan' ? "bg-cyan-950/50 border border-cyan-800/60 text-cyan-400" : "bg-zinc-900/60 border border-zinc-800/60 text-zinc-400 hover:text-zinc-200"
            )}
            title="Drag mouse to pan camera"
          >
            <Move className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Pan</span>
          </button>

          <div className="h-4 w-[1px] bg-zinc-800 mx-1" />

          <button
            onClick={() => setZoom(z => Math.max(0.3, z - 0.1))}
            className="p-2 bg-zinc-900/60 border border-zinc-800/60 text-zinc-400 hover:text-zinc-200 rounded-lg cursor-pointer transition-all"
            title="Zoom Out"
          >
            <Minus className="w-3.5 h-3.5" />
          </button>
          
          <button
            onClick={() => setZoom(z => Math.min(2.5, z + 0.1))}
            className="p-2 bg-zinc-900/60 border border-zinc-800/60 text-zinc-400 hover:text-zinc-200 rounded-lg cursor-pointer transition-all"
            title="Zoom In"
          >
            <Plus className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={resetView}
            className="p-2 bg-zinc-900/60 border border-zinc-800/60 text-zinc-400 hover:text-zinc-200 rounded-lg text-[10.5px] font-mono cursor-pointer transition-all ml-1 flex items-center gap-1"
            title="Reset to default rotation and zoom"
          >
            <RefreshCw className="w-3 h-3" />
            Standard
          </button>
        </div>

        {/* Right floating animations switch indicators */}
        <div className="absolute top-4 right-4 z-20 flex flex-col sm:flex-row gap-2">
          <div className="flex items-center gap-2 px-2.5 py-1.5 bg-cyan-950/40 border border-cyan-800/50 rounded-lg text-[11px] font-mono text-cyan-300 select-none">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
            <span>Conv Kernel</span>
          </div>
        </div>

        {/* Floating guidance overlay */}
        <div className="absolute bottom-4 left-4 z-20 pointer-events-none bg-zinc-900/40 px-3 py-1.5 rounded-lg border border-zinc-800/40 backdrop-blur-sm shadow-xl flex items-center gap-2 text-[10px] text-zinc-500 font-mono">
          <HelpCircle className="w-3.5 h-3.5 text-cyan-500" />
          <span>Drag with mouse to explore in 3D</span>
        </div>

        {/* Active viewport rendering */}
        <div 
          ref={viewportRef}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          className={cn(
            "w-full h-full relative cursor-grab select-none active:cursor-grabbing pb-8",
            dragMode === 'pan' ? "cursor-move" : "cursor-grab"
          )}
        >
          {/* Subtle grid base below */}
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#1f293708_1px,transparent_1px),linear-gradient(to_bottom,#1f293708_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none opacity-40" />

          <svg 
            className="w-full h-full overflow-visible"
            viewBox="0 0 700 440"
            preserveAspectRatio="xMidYMid meet"
          >
            {/* Ground grid helper perspective lines */}
            {/* Painters elements stack render loop */}
            {polygonItems.map((item, idx) => {
              if (item.type === 'pulse' && item.projectedPoints) {
                const pt = item.projectedPoints[0];
                return (
                  <circle
                    key={`pulse-${idx}`}
                    cx={pt.x}
                    cy={pt.y}
                    r={item.strokeWidth || 4}
                    fill={item.fill}
                    className="animate-ping fill-indigo-400 opacity-75"
                    style={{ animationDuration: '1.2s' }}
                  />
                );
              }

              if (item.type === 'line' && item.projectedPoints && item.projectedPoints.length >= 2) {
                const p1 = item.projectedPoints[0];
                const p2 = item.projectedPoints[1];
                return (
                  <line
                    key={`line-${idx}`}
                    x1={p1.x}
                    y1={p1.y}
                    x2={p2.x}
                    y2={p2.y}
                    stroke={item.stroke}
                    strokeWidth={item.strokeWidth || 1}
                    strokeDasharray={item.strokeDasharray}
                    opacity={item.opacity || 1}
                    className="transition-all duration-300"
                  />
                );
              }

              if ((item.type === 'face' || item.type === 'kernel_face') && item.projectedPoints) {
                const pointsStr = item.projectedPoints.map(p => `${p.x},${p.y}`).join(' ');
                const isSelectedFace = item.layerId && selectedNodeId === item.layerId;

                return (
                  <g key={`face-g-${idx}`} className="group/face">
                    <polygon
                      points={pointsStr}
                      fill={item.fill}
                      stroke={item.stroke}
                      strokeWidth={item.strokeWidth || 1}
                      opacity={item.opacity || 0.8}
                      onClick={(e) => {
                        e.stopPropagation();
                        if (item.layerId) {
                          if (item.layerId === 'input') {
                            setSelectedNodeId(null);
                          } else {
                            setSelectedNodeId(item.layerId);
                          }
                        }
                      }}
                      className={cn(
                        "transition-all duration-200 cursor-pointer",
                        isSelectedFace ? "stroke-[2px] filter drop-shadow-[0_0_8px_rgba(6,182,212,0.3)]" : "hover:fill-opacity-50"
                      )}
                    />
                    
                    {/* Hover tooltip hint */}
                    {item.tooltipText && (
                      <title>{item.tooltipText}</title>
                    )}
                  </g>
                );
              }

              return null;
            })}
          </svg>
        </div>

        {/* Pipeline index tracker list for desktop */}
        <div className="absolute bottom-4 right-4 z-20 flex gap-1.5 p-1.5 bg-zinc-900/75 border border-zinc-800/80 rounded-xl backdrop-blur-sm shadow-xl overflow-x-auto max-w-[85%] select-none custom-scrollbar">
          {traceLayers.map((tl, index) => {
            const isInput = tl.node === null;
            const isClickActive = isInput ? selectedNodeId === null : selectedNodeId === tl.node?.id;
            return (
              <button
                key={`crumb-${index}`}
                onClick={() => setSelectedNodeId(isInput ? null : (tl.node?.id || null))}
                className={cn(
                  "px-2 py-1 text-[10px] font-mono rounded-lg transition-all shrink-0 cursor-pointer flex items-center gap-1",
                  isClickActive 
                    ? "bg-cyan-950/50 border border-cyan-800 text-cyan-300 font-bold" 
                    : !tl.isCompatible 
                      ? "bg-red-950/30 border border-red-900/40 text-red-400 hover:bg-red-900/20"
                      : "bg-zinc-950 border border-zinc-900 text-zinc-500 hover:text-zinc-300 hover:bg-zinc-900"
                )}
              >
                <span>{index}</span>
                <span className="opacity-60 max-w-[50px] truncate">{isInput ? 'INPUT' : tl.node?.name}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Math inspector Sidebar / Panel */}
      <div className="w-full xl:w-96 shrink-0 flex flex-col gap-4">
        
        {/* Layer Header Card */}
        <div className="bg-zinc-900/40 border border-zinc-800/40 rounded-2xl p-5 backdrop-blur-md shadow-xl">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className={cn(
                "p-2.5 rounded-xl border flex items-center justify-center shadow-inner",
                selectedTrace.node === null
                  ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
                  : !selectedTrace.isCompatible
                    ? "bg-red-500/10 border-red-500/20 text-red-400"
                    : "bg-indigo-500/10 border-indigo-500/20 text-indigo-400"
              )}>
                {selectedTrace.node === null ? <Box className="w-5 h-5" /> : <Layers className="w-5 h-5" />}
              </div>
              <div>
                <div className="text-[10px] tracking-widest font-mono text-zinc-500 font-bold uppercase">
                  {selectedTrace.node === null ? 'INPUT PROPERTIES' : `LAYER ${selectedNodeIndex} OF ${layers.length}`}
                </div>
                <h3 className="text-zinc-200 font-semibold text-[15px] hover:text-white transition-colors">
                  {selectedTrace.node === null ? 'Input Data' : selectedTrace.node.name}
                </h3>
              </div>
            </div>

            {selectedTrace.node !== null && (
              <span className={cn(
                "px-2 px-1 rounded text-[9.5px] font-bold uppercase font-sans border",
                selectedTrace.isCompatible 
                  ? "bg-indigo-950/40 text-indigo-300 border-indigo-900/30" 
                  : "bg-red-950/50 text-red-400 border-red-900/40"
              )}>
                {selectedTrace.node.type}
              </span>
            )}
          </div>

          {/* Configuration alert if not compatible */}
          {!selectedTrace.isCompatible && (
            <div className="mt-4 p-3 bg-red-950/40 ring-1 ring-red-920 border-l-2 border-red-500 rounded-xl flex gap-2.5 items-start">
              <AlertTriangle className="w-4 h-4 text-red-400 mt-0.5 shrink-0" />
              <div>
                <h4 className="text-xs font-bold text-red-300 uppercase tracking-wide">Incompatibility Detected</h4>
                <p className="text-[11px] text-red-400/90 leading-relaxed mt-0.5">{selectedTrace.reason}</p>
              </div>
            </div>
          )}

          {/* Quick Shape transition box */}
          <div className="mt-4 grid grid-cols-2 gap-2 text-center">
            <div className="bg-zinc-950/60 rounded-xl border border-zinc-800/40 p-2.5">
              <div className="text-[10px] text-zinc-500 font-mono">INPUT SHAPE</div>
              <div className="text-sm font-semibold text-zinc-300 font-mono mt-0.5">
                {selectedTrace.inShape.d !== undefined 
                  ? `${selectedTrace.inShape.c} × ${selectedTrace.inShape.d} × ${selectedTrace.inShape.h} × ${selectedTrace.inShape.w}`
                  : `${selectedTrace.inShape.c} × ${selectedTrace.inShape.h} × ${selectedTrace.inShape.w}`}
              </div>
            </div>
            
            <div className="bg-zinc-950/60 rounded-xl border border-zinc-800/40 p-2.5">
              <div className="text-[10px] text-zinc-500 font-mono">OUTPUT SHAPE</div>
              <div className={cn(
                "text-sm font-semibold font-mono mt-0.5",
                selectedTrace.isCompatible && selectedTrace.outShape 
                  ? "text-cyan-400" 
                  : "text-red-400/80"
              )}>
                {selectedTrace.isCompatible && selectedTrace.outShape 
                  ? (selectedTrace.outShape.d !== undefined 
                      ? `${selectedTrace.outShape.c} × ${selectedTrace.outShape.d} × ${selectedTrace.outShape.h} × ${selectedTrace.outShape.w}` 
                      : `${selectedTrace.outShape.c} × ${selectedTrace.outShape.h} × ${selectedTrace.outShape.w}`) 
                  : 'Incompatible'}
              </div>
            </div>
          </div>
        </div>

        {/* Math & Calculations Breakdown panel */}
        {selectedTrace.isCompatible && stats && (
          <div className="flex-1 bg-zinc-900/40 border border-zinc-800/40 rounded-2xl p-5 backdrop-blur-md shadow-xl flex flex-col gap-4">
            
            {/* Parameters count card */}
            <div className="flex gap-4 items-start p-3 bg-zinc-950/50 border border-zinc-850 rounded-xl">
              <div className="p-2.5 bg-yellow-500/10 border-yellow-500/20 text-yellow-400 rounded-xl">
                <Coins className="w-4.5 h-4.5" />
              </div>
              <div className="flex-1 overflow-hidden">
                <div className="text-[9.5px] uppercase font-bold tracking-widest text-zinc-500">Trainable Parameters</div>
                <div className="text-base font-bold text-zinc-100 font-mono mt-0.5">
                  {stats.parameterCount.toLocaleString()}
                </div>
                <div className="text-[10px] text-zinc-500 font-mono mt-1 break-words line-clamp-2" title={stats.parameterFormula}>
                  {stats.parameterFormula}
                </div>
              </div>
            </div>

            {/* Arithmetic FLOP count card */}
            <div className="flex gap-4 items-start p-3 bg-zinc-950/50 border border-zinc-850 rounded-xl">
              <div className="p-2.5 bg-blue-500/10 border-blue-500/20 text-blue-400 rounded-xl animate-pulse">
                <Cpu className="w-4.5 h-4.5" />
              </div>
              <div className="flex-1 overflow-hidden">
                <div className="text-[9.5px] uppercase font-bold tracking-widest text-zinc-500">Estimated Operations (FLOPs)</div>
                <div className="text-base font-bold text-zinc-100 font-mono mt-0.5">
                  {stats.flopCount.toLocaleString()}
                </div>
                <div className="text-[10px] text-zinc-500 font-mono mt-1 break-words line-clamp-2" title={stats.flopFormula}>
                  {stats.flopFormula}
                </div>
              </div>
            </div>

            {/* Step-by-step Size Calculation equations */}
            <div className="p-3 bg-zinc-950/50 border border-zinc-850 rounded-xl flex flex-col gap-2">
              <div className="text-[9.5px] uppercase font-bold tracking-widest text-zinc-500 flex items-center justify-between">
                <span>Dimensional Evolution</span>
                <Scale className="w-3.5 h-3.5 text-cyan-400" />
              </div>
              
              <div className="font-mono text-[10.5px] bg-zinc-950 p-2.5 rounded-lg border border-zinc-900 leading-relaxed flex flex-col gap-1.5 text-zinc-400">
                {stats.dimensionFormulaD && (
                  <div className="flex flex-col gap-0.5 border-b border-zinc-900 pb-1.5">
                    <span className="text-[8.5px] font-sans text-indigo-400 uppercase tracking-wider font-bold">DEPTH (D):</span>
                    <span className="text-zinc-300 font-semibold">{stats.dimensionFormulaD}</span>
                  </div>
                )}
                
                <div className="flex flex-col gap-0.5 border-b border-zinc-900 pb-1.5 pt-0.5">
                  <span className="text-[8.5px] font-sans text-indigo-400 uppercase tracking-wider font-bold">HEIGHT (H):</span>
                  <span className="text-zinc-300 font-semibold">{stats.dimensionFormulaH}</span>
                </div>

                <div className="flex flex-col gap-0.5 pt-0.5">
                  <span className="text-[8.5px] font-sans text-indigo-400 uppercase tracking-wider font-bold">WIDTH (W):</span>
                  <span className="text-zinc-300 font-semibold">{stats.dimensionFormulaW}</span>
                </div>
              </div>
            </div>

            {/* Friendly explanation paragraph */}
            <div className="flex-1 p-3.5 bg-indigo-950/15 border border-indigo-900/20 rounded-xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-20 h-20 bg-indigo-500/5 rounded-full blur-xl" />
              <h4 className="text-[10px] uppercase font-bold text-indigo-400 tracking-wider">What does this layer do?</h4>
              <p className="text-[11px] text-zinc-400 leading-relaxed mt-1.5 font-sans">
                {stats.explanation}
              </p>
            </div>
          </div>
        )}

        {/* Input Map placeholder details */}
        {selectedTrace.node === null && (
          <div className="bg-zinc-900/40 border border-zinc-800/40 rounded-2xl p-5 backdrop-blur-md shadow-xl flex-1 flex flex-col gap-3.5">
            <h4 className="text-[10px] uppercase font-bold text-emerald-400 tracking-wider">Initial Source Data</h4>
            <p className="text-[11.5px] leading-relaxed text-zinc-400 font-sans">
              This block defines the initial shape of the data propagated through the network. You can alter these values using the ImageNet, MNIST, or Spectrogram shape presets in the header above or by editing the parameters in the canvas sidebar.
            </p>
            
            <div className="rounded-xl bg-zinc-950/60 p-3 border border-zinc-805 font-mono text-xs flex flex-col gap-2 text-zinc-400">
              <div className="flex justify-between">
                <span>Channels (C):</span>
                <span className="text-zinc-200">{inputShape.c} map(s)</span>
              </div>
              <div className="flex justify-between">
                <span>Height (H):</span>
                <span className="text-zinc-200">{inputShape.h} px</span>
              </div>
              <div className="flex justify-between">
                <span>Width (W):</span>
                <span className="text-zinc-200">{inputShape.w} px</span>
              </div>
              {inputShape.d !== undefined && (
                <div className="flex justify-between text-indigo-400 border-t border-zinc-850 pt-2 mt-1">
                  <span>Depth (D):</span>
                  <span>{inputShape.d} voxels</span>
                </div>
              )}
            </div>

            <div className="p-3 bg-emerald-950/10 border border-emerald-900/25 rounded-xl text-[10.5px] leading-relaxed text-emerald-400/90 mt-auto flex items-start gap-2">
              <Zap className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Ready for training. The model calculates a reduced output with feedforward estimations.</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
