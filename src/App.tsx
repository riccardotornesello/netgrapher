/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import { useState, useEffect } from "react";
import { NetworkProvider, useNetwork } from "./context/NetworkContext";
import DesignerPage from "./pages/DesignerPage";
import ThreeDPage from "./pages/ThreeDPage";
import DidacticPage from "./pages/DidacticPage";
import { Inspector } from "./components/Inspector";
import { ExportModal } from "./components/ExportModal";
import { AddLayerModal } from "./components/AddLayerModal";
import { ImportExportJsonModal } from "./components/ImportExportJsonModal";
import {
  Box,
  Code,
  PanelRightOpen,
  PanelRightClose,
  ChevronLeft,
  ChevronRight,
  Layers,
  Rotate3d,
  GraduationCap,
  AlertTriangle,
  X,
  FileCode,
} from "lucide-react";
import { cn } from "./lib/utils";

function AppContent() {
  const { selectedNodeId } = useNetwork();
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [isJsonModalOpen, setIsJsonModalOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<
    "designer" | "threed" | "didactic"
  >("designer");
  const [showAlert, setShowAlert] = useState(false);

  // Check alert visibility status
  useEffect(() => {
    const dismissedUntil = localStorage.getItem(
      "vibe_coded_alert_dismissed_until",
    );
    const now = Date.now();
    if (!dismissedUntil || now > parseInt(dismissedUntil, 10)) {
      setShowAlert(true);
    }
  }, []);

  const handleDismissAlert = () => {
    const twentyFourHours = 24 * 60 * 60 * 1000;
    localStorage.setItem(
      "vibe_coded_alert_dismissed_until",
      (Date.now() + twentyFourHours).toString(),
    );
    setShowAlert(false);
  };

  // Auto open sidebar on select, auto close when selection is cleared
  useEffect(() => {
    if (selectedNodeId !== null && activeTab === "designer") {
      setIsSidebarOpen(true);
    } else {
      setIsSidebarOpen(false);
    }
  }, [selectedNodeId, activeTab]);

  return (
    <div className="h-screen w-screen bg-zinc-950 text-zinc-100 flex flex-col font-sans overflow-hidden relative">
      {showAlert && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-50 w-[92%] max-w-lg transition-all duration-300">
          <div className="bg-zinc-900/95 border border-amber-500/30 text-amber-200/95 shadow-[0_10px_40px_rgba(0,0,0,0.8)] rounded-xl p-4 backdrop-blur-md flex items-start gap-3.5">
            <div className="p-1.5 bg-amber-500/10 rounded-lg border border-amber-500/20 text-amber-400 shrink-0">
              <AlertTriangle className="w-4 h-4" />
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="text-xs font-bold text-amber-450 tracking-wider uppercase select-none">
                Vibe-Coded Warning
              </h4>
              <p className="text-[11.5px] text-zinc-305 leading-relaxed mt-1">
                This site was mainly <strong>warning-coded</strong> (vibe-coded)
                and may contain <strong>AI slop</strong>. Explore with critical
                thinking! 🤖✨
              </p>
            </div>
            <button
              onClick={handleDismissAlert}
              className="p-1 hover:bg-zinc-800/80 text-zinc-500 hover:text-zinc-200 rounded-lg transition-all cursor-pointer self-start shrink-0"
              title="Dismiss warning"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Header */}
      <header className="h-14 border-b border-zinc-800/50 flex items-center justify-between px-6 shrink-0 bg-zinc-900/40 relative z-10 backdrop-blur-sm">
        <div className="flex items-center">
          <div className="w-7 h-7 bg-indigo-500/10 rounded flex items-center justify-center border border-indigo-500/20 mr-3 shadow-inner">
            <Box className="w-4 h-4 text-indigo-400" />
          </div>
          <h1 className="font-semibold text-[13px] tracking-widest text-zinc-300 uppercase select-none hidden sm:inline">
            Neural Network Architect
          </h1>

          {/* Visualizer Mode Segment Toggle */}
          <div className="flex items-center gap-1.5 bg-zinc-950 border border-zinc-800/70 rounded-lg p-0.5 ml-4 sm:ml-8 h-8 select-none">
            <button
              onClick={() => setActiveTab("designer")}
              className={cn(
                "px-2.5 py-0.5 h-full rounded-md text-[10.5px] font-bold tracking-wider uppercase transition-all flex items-center gap-1.5 cursor-pointer",
                activeTab === "designer"
                  ? "bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 shadow-inner"
                  : "text-zinc-500 hover:text-zinc-350 border border-transparent",
              )}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Canvas 2D</span>
            </button>

            <button
              onClick={() => setActiveTab("threed")}
              className={cn(
                "px-2.5 py-0.5 h-full rounded-md text-[10.5px] font-bold tracking-wider uppercase transition-all flex items-center gap-1.5 cursor-pointer relative",
                activeTab === "threed"
                  ? "bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 shadow-inner"
                  : "text-zinc-500 hover:text-zinc-350 border border-transparent",
              )}
            >
              <Rotate3d className="w-3.5 h-3.5" />
              <span>3D Flow</span>
              <span className="absolute -top-1 -right-1 flex h-1.5 w-1.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-cyan-500"></span>
              </span>
            </button>

            <button
              onClick={() => setActiveTab("didactic")}
              className={cn(
                "px-2.5 py-0.5 h-full rounded-md text-[10.5px] font-bold tracking-wider uppercase transition-all flex items-center gap-1.5 cursor-pointer",
                activeTab === "didactic"
                  ? "bg-amber-500/10 text-amber-400 border border-amber-500/20 shadow-inner"
                  : "text-zinc-500 hover:text-zinc-350 border border-transparent",
              )}
            >
              <GraduationCap className="w-3.5 h-3.5" />
              <span>Theory Hub</span>
            </button>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Toggle Sidebar Button - only visible in designer tab when something is selected */}
          {selectedNodeId !== null && activeTab === "designer" && (
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-zinc-900/80 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 rounded-md text-xs font-medium transition-colors cursor-pointer"
              title={
                isSidebarOpen
                  ? "Hide configuration sidebar"
                  : "Show configuration sidebar"
              }
            >
              {isSidebarOpen ? (
                <>
                  <PanelRightClose className="w-4 h-4 text-cyan-400" />
                  <span className="hidden sm:inline">Hide parameters</span>
                </>
              ) : (
                <>
                  <PanelRightOpen className="w-4 h-4 text-zinc-400" />
                  <span className="hidden sm:inline">Show parameters</span>
                </>
              )}
            </button>
          )}

          <button
            onClick={() => setIsJsonModalOpen(true)}
            className="flex items-center gap-2 px-3 py-1.5 bg-zinc-900/80 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 rounded-md text-xs font-medium transition-colors ml-1 cursor-pointer"
          >
            <FileCode className="w-4 h-4 text-cyan-400" />
            JSON Model
          </button>

          <button
            onClick={() => setIsExportModalOpen(true)}
            className="flex items-center gap-2 px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700/50 text-zinc-300 rounded-md text-xs font-medium transition-colors cursor-pointer"
          >
            <Code className="w-4 h-4 text-indigo-400" />
            Export Code
          </button>
        </div>
      </header>

      {/* Main Body */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Canvas / 3D / Didactic Wrapper */}
        <main className="flex-1 overflow-y-auto custom-scrollbar relative bg-[#0a0a0c]">
          {/* Ambient Background Glow */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 max-w-4xl h-[40vh] bg-indigo-500/5 rounded-full blur-[120px] pointer-events-none" />

          <div className="relative z-10 min-h-full p-6 sm:p-8 md:p-12">
            {activeTab === "designer" ? (
              <DesignerPage />
            ) : activeTab === "threed" ? (
              <ThreeDPage />
            ) : (
              <DidacticPage />
            )}
          </div>

          {/* Subtle floating toggle on the extreme right screen border when sidebar is closed and something is selected in Canvas 2D */}
          {!isSidebarOpen &&
            selectedNodeId !== null &&
            activeTab === "designer" && (
              <button
                onClick={() => setIsSidebarOpen(true)}
                className="fixed right-0 top-1/2 -translate-y-1/2 bg-zinc-900/90 border-l border-t border-b border-zinc-700/60 p-2.5 rounded-l-xl text-cyan-400 hover:text-cyan-300 hover:bg-zinc-805/90 hover:pl-4 transition-all z-40 shadow-2xl flex items-center justify-center cursor-pointer group"
                title="Open parameters"
              >
                <div className="flex flex-col items-center gap-1">
                  <ChevronLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
                  <span className="text-[9px] uppercase tracking-widest font-bold font-sans [writing-mode:vertical-lr] text-zinc-500 group-hover:text-zinc-350 select-none">
                    PARAMS
                  </span>
                </div>
              </button>
            )}
        </main>

        {/* Sidebar */}
        <aside
          className={cn(
            "border-l border-zinc-800/50 bg-zinc-950 flex flex-col shrink-0 shadow-[-10px_0_30px_rgba(0,0,0,0.2)] z-20 transition-all duration-300 relative",
            isSidebarOpen
              ? "w-80 opacity-100"
              : "w-0 opacity-0 pointer-events-none border-l-0 overflow-hidden",
          )}
        >
          {/* Edge-collapsing grip button for sidebar */}
          {isSidebarOpen && (
            <button
              onClick={() => setIsSidebarOpen(false)}
              className="absolute left-0 top-1/2 -translate-x-1/2 -translate-y-1/2 w-5 h-12 bg-zinc-900 hover:bg-zinc-805 border border-zinc-700/80 hover:border-zinc-500 rounded-full flex items-center justify-center transition-all z-50 text-zinc-400 hover:text-zinc-200 cursor-pointer shadow-lg"
              title="Hide settings"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          )}
          <div className="flex-1 w-80 h-full overflow-y-auto">
            <Inspector />
          </div>
        </aside>
      </div>

      {isExportModalOpen && (
        <ExportModal onClose={() => setIsExportModalOpen(false)} />
      )}

      {isJsonModalOpen && (
        <ImportExportJsonModal onClose={() => setIsJsonModalOpen(false)} />
      )}

      <AddLayerModal />
    </div>
  );
}

export default function App() {
  return (
    <NetworkProvider>
      <AppContent />
    </NetworkProvider>
  );
}
