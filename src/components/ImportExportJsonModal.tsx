import React, { useState, useRef, useEffect } from "react";
import { useNetwork } from "../context/NetworkContext";
import { LayerNode, ImageShape } from "../types";
import {
  X,
  Copy,
  Check,
  Download,
  Upload,
  AlertCircle,
  FileCode,
  Trash2,
} from "lucide-react";

interface ImportExportJsonModalProps {
  onClose: () => void;
}

export function ImportExportJsonModal({ onClose }: ImportExportJsonModalProps) {
  const { layers, inputShape, importModel } = useNetwork();

  // Tabs: 'export' or 'import'
  const [activeTab, setActiveTab] = useState<"export" | "import">("export");

  // Export State
  const [copied, setCopied] = useState(false);

  // Import State
  const [importText, setImportText] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [warning, setWarning] = useState<string | null>(null);
  const [parsedData, setParsedData] = useState<{
    layers: LayerNode[];
    inputShape: ImageShape;
  } | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Generate the formatted JSON model content
  const modelJson = JSON.stringify({ layers, inputShape }, null, 2);

  // Parse and validate whenever import text changes
  useEffect(() => {
    if (!importText.trim()) {
      setError(null);
      setWarning(null);
      setParsedData(null);
      return;
    }

    try {
      const parsed = JSON.parse(importText);

      if (!parsed || typeof parsed !== "object") {
        setError("JSON must be a valid object.");
        setParsedData(null);
        return;
      }

      let validatedLayers: LayerNode[] = [];
      let validatedInputShape: ImageShape = { ...inputShape };

      // Validate Input Shape
      if (parsed.inputShape) {
        if (typeof parsed.inputShape !== "object") {
          setError('The "inputShape" field must be an object.');
          setParsedData(null);
          return;
        }

        const shape = parsed.inputShape;
        if (
          typeof shape.c !== "number" ||
          typeof shape.h !== "number" ||
          typeof shape.w !== "number"
        ) {
          setError(
            'The "inputShape" object must contain numeric properties "c", "h", and "w".',
          );
          setParsedData(null);
          return;
        }

        validatedInputShape = {
          c: shape.c,
          h: shape.h,
          w: shape.w,
          ...(shape.d !== undefined ? { d: Number(shape.d) } : {}),
        };
      } else {
        setWarning(
          'The "inputShape" field is missing. Current input dimensions will be kept.',
        );
      }

      // Validate Layers Array
      if (parsed.layers) {
        if (!Array.isArray(parsed.layers)) {
          setError('The "layers" field must be an array.');
          setParsedData(null);
          return;
        }

        // Deep validation helper
        const validateNodes = (nodes: any[]): LayerNode[] => {
          return nodes.map((node, i) => {
            if (!node || typeof node !== "object") {
              throw new Error(`The node at index ${i} is not a valid object.`);
            }
            if (!node.type) {
              throw new Error(
                `The node at index ${i} is missing the "type" field.`,
              );
            }
            if (!node.name) {
              throw new Error(
                `The node at index ${i} is missing the "name" field.`,
              );
            }

            const cleanNode: LayerNode = {
              id: node.id || `layer_${Math.random().toString(36).substr(2, 9)}`,
              type: node.type,
              name: node.name,
              params: node.params || {},
              ...(node.isExpanded !== undefined
                ? { isExpanded: !!node.isExpanded }
                : {}),
            };

            if (node.children) {
              if (!Array.isArray(node.children)) {
                throw new Error(
                  `The children array in node "${node.name}" must be an array.`,
                );
              }
              cleanNode.children = validateNodes(node.children);
            }

            return cleanNode;
          });
        };

        try {
          validatedLayers = validateNodes(parsed.layers);
        } catch (e: any) {
          setError(`Layer validation error: ${e.message}`);
          setParsedData(null);
          return;
        }
      } else {
        setWarning(
          'The "layers" field is missing. The imported model will be empty.',
        );
      }

      setError(null);
      setParsedData({
        layers: validatedLayers,
        inputShape: validatedInputShape,
      });
    } catch (e: any) {
      setError(`JSON syntax error: ${e.message}`);
      setParsedData(null);
    }
  }, [importText, inputShape]);

  // Handle Clipboard Copy
  const handleCopy = () => {
    navigator.clipboard.writeText(modelJson);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Handle Config Download
  const handleDownload = () => {
    try {
      const blob = new Blob([modelJson], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = "neural_network_model.json";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Download failed", err);
    }
  };

  // Import Action
  const handleImport = () => {
    if (!parsedData) return;
    importModel(parsedData.layers, parsedData.inputShape);
    onClose();
  };

  // Drag and drop event handlers
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const processFile = (file: File) => {
    if (!file) return;
    if (file.type !== "application/json" && !file.name.endsWith(".json")) {
      setError("Please upload valid .json files only.");
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result;
      if (typeof text === "string") {
        setImportText(text);
      }
    };
    reader.onerror = () => {
      setError("Failed to read file.");
    };
    reader.readAsText(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processFile(e.target.files[0]);
    }
  };

  const triggerFileSelect = () => {
    fileInputRef.current?.click();
  };

  const clearImportState = () => {
    setImportText("");
    setError(null);
    setWarning(null);
    setParsedData(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-950/80 backdrop-blur-sm p-4">
      <div className="bg-zinc-900 border border-zinc-805 rounded-2xl shadow-2xl w-full max-w-2xl flex flex-col max-h-[85vh] overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header containing tabs */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-800 bg-zinc-900/60">
          <div className="flex gap-4">
            <button
              className={`text-xs tracking-wider font-bold uppercase pb-1 transition-colors relative cursor-pointer ${
                activeTab === "export"
                  ? "text-indigo-400"
                  : "text-zinc-500 hover:text-zinc-350"
              }`}
              onClick={() => setActiveTab("export")}
            >
              Export JSON
              {activeTab === "export" && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-500 rounded-full" />
              )}
            </button>
            <button
              className={`text-xs tracking-wider font-bold uppercase pb-1 transition-colors relative cursor-pointer ${
                activeTab === "import"
                  ? "text-cyan-400"
                  : "text-zinc-500 hover:text-zinc-355"
              }`}
              onClick={() => setActiveTab("import")}
            >
              Import JSON
              {activeTab === "import" && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-cyan-500 rounded-full" />
              )}
            </button>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800 rounded-lg transition-colors cursor-pointer"
            title="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Export Tab View */}
        {activeTab === "export" && (
          <div className="flex-1 flex flex-col min-h-0">
            <div className="px-5 py-3 bg-zinc-950/40 border-b border-zinc-800 text-[11px] text-zinc-400 flex items-center justify-between">
              <span>
                This JSON configuration describes the neural network structure
                completely and can be imported back into the workspace.
              </span>
              <div className="flex gap-2">
                <button
                  onClick={handleDownload}
                  className="flex items-center gap-1.5 px-2.5 py-1 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 transition-colors border border-zinc-700/50 rounded-md text-[10.5px] cursor-pointer"
                  title="Download JSON config"
                >
                  <Download className="w-3.5 h-3.5 text-cyan-400" />
                  Download .json
                </button>
                <button
                  onClick={handleCopy}
                  className="flex items-center gap-1.5 px-2.5 py-1 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 transition-colors border border-zinc-700/50 rounded-md text-[10.5px] cursor-pointer"
                  title="Copy JSON string"
                >
                  {copied ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5 text-indigo-400" />
                      Copy JSON
                    </>
                  )}
                </button>
              </div>
            </div>

            <div className="p-5 flex-1 overflow-y-auto custom-scrollbar bg-[#0d0d10] font-mono text-[11px] text-zinc-300 leading-relaxed max-h-[50vh]">
              <pre className="selection:bg-indigo-505/30">
                <code>{modelJson}</code>
              </pre>
            </div>
          </div>
        )}

        {/* Import Tab View */}
        {activeTab === "import" && (
          <div className="flex-1 flex flex-col p-5 overflow-y-auto custom-scrollbar gap-4 min-h-0">
            {/* Drag & Drop File Upload Area */}
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={triggerFileSelect}
              className={`border-2 border-dashed rounded-xl p-6 flex flex-col items-center justify-center gap-2 cursor-pointer transition-all ${
                isDragging
                  ? "border-cyan-500 bg-cyan-950/10"
                  : "border-zinc-800 hover:border-zinc-700 bg-zinc-950/30 hover:bg-zinc-950/55"
              }`}
            >
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept=".json"
                className="hidden"
              />
              <div className="p-2.5 bg-zinc-900 border border-zinc-800 rounded-lg text-cyan-400 group-hover:scale-105 transition-transform">
                <Upload className="w-5 h-5" />
              </div>
              <div className="text-center">
                <p className="text-xs font-semibold text-zinc-300">
                  Drag a JSON file here or{" "}
                  <span className="text-cyan-400 hover:text-cyan-300 underline font-bold">
                    browse
                  </span>
                </p>
                <p className="text-[10px] text-zinc-500 mt-1">
                  Upload a previously exported .json model configuration
                </p>
              </div>
            </div>

            {/* Alternativ text area field */}
            <div className="flex flex-col gap-1.5 flex-1 min-h-[160px]">
              <div className="flex items-center justify-between">
                <label className="text-[10.5px] uppercase font-bold tracking-wider text-zinc-500">
                  Or paste JSON text directly:
                </label>
                {importText.trim() && (
                  <button
                    onClick={clearImportState}
                    className="text-[10px] font-medium text-red-400 hover:text-red-300 transition-colors flex items-center gap-1 cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    Clear
                  </button>
                )}
              </div>
              <textarea
                value={importText}
                onChange={(e) => setImportText(e.target.value)}
                placeholder='Paste JSON schema e.g., {"layers": ..., "inputShape": ...} here...'
                className="w-full h-full min-h-[120px] bg-zinc-950 border border-zinc-800 focus:border-cyan-500/50 rounded-xl p-3 text-[11px] font-mono text-zinc-300 focus:outline-none focus:ring-1 focus:ring-cyan-500/30 custom-scrollbar resize-none"
              />
            </div>

            {/* Validations & Previews */}
            {error && (
              <div className="p-3 bg-red-950/30 border border-red-900/40 rounded-xl flex gap-3 items-start animate-fade-in/10">
                <AlertCircle className="w-4 h-4 text-red-400 mt-0.5 shrink-0" />
                <div>
                  <h4 className="text-[11px] font-bold text-red-350 tracking-wide uppercase">
                    Validation Error
                  </h4>
                  <p className="text-[10.5px] text-red-400/90 leading-relaxed mt-0.5">
                    {error}
                  </p>
                </div>
              </div>
            )}

            {warning && !error && (
              <div className="p-3 bg-amber-950/30 border border-amber-900/40 rounded-xl flex gap-3 items-start animate-fade-in/10">
                <AlertCircle className="w-4 h-4 text-amber-400 mt-0.5 shrink-0" />
                <div>
                  <h4 className="text-[11px] font-bold text-amber-350 tracking-wide uppercase">
                    Warning
                  </h4>
                  <p className="text-[10.5px] text-amber-400/90 leading-relaxed mt-0.5">
                    {warning}
                  </p>
                </div>
              </div>
            )}

            {parsedData && !error && (
              <div className="p-3 bg-emerald-950/15 border border-emerald-900/30 rounded-xl flex gap-3 items-start animate-fade-in/10">
                <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                <div className="flex-1 min-w-0">
                  <h4 className="text-[11px] font-bold text-emerald-400 tracking-wide uppercase">
                    Valid JSON Model
                  </h4>
                  <p className="text-[10.5px] text-zinc-400 mt-0.5">
                    Model mapped successfully:{" "}
                    <strong className="text-zinc-200">
                      {parsedData.layers.length}
                    </strong>{" "}
                    layers found. Input Shape:{" "}
                    <span className="font-mono text-cyan-400 text-[10px]">
                      {parsedData.inputShape.c} × {parsedData.inputShape.h} ×{" "}
                      {parsedData.inputShape.w}
                    </span>
                    .
                  </p>
                </div>
              </div>
            )}

            {/* Footer action */}
            <div className="flex justify-end gap-2 border-t border-zinc-800/80 pt-4 mt-1">
              <button
                onClick={onClose}
                className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-lg text-xs font-semibold cursor-pointer transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleImport}
                disabled={!parsedData || !!error}
                className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
                  parsedData && !error
                    ? "bg-cyan-500 hover:bg-cyan-400 text-zinc-950 font-bold"
                    : "bg-zinc-800 text-zinc-500 cursor-not-allowed border border-transparent"
                }`}
              >
                <FileCode className="w-3.5 h-3.5" />
                Import Model
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
