import { useState, useCallback, useRef, useEffect } from "react";
import CodeEditor from "./CodeEditor";
import PreviewPanel from "./PreviewPanel";
import { useHtmlPreview } from "../hooks/useHtmlPreview";
import type { Section } from "../types/content";

interface CodeRunnerProps {
  section: Section;
  sidebarOpen: boolean;
  onToggleSidebar: () => void;
}

export default function CodeRunner({ section, sidebarOpen, onToggleSidebar }: CodeRunnerProps) {
  const [code, setCode] = useState(section.code);
  const preview = useHtmlPreview();
  const [infoOpen, setInfoOpen] = useState(false);
  const infoRef = useRef<HTMLDivElement>(null);

  const [drawerOpen, setDrawerOpen] = useState(true);
  const [drawerWidth, setDrawerWidth] = useState(420);
  const drawerRef = useRef<HTMLDivElement>(null);
  const dragStateRef = useRef({ startX: 0, startWidth: 0 });
  const drawerWidthRef = useRef(drawerWidth);
  const dragListenersRef = useRef<{ move: (e: MouseEvent) => void; end: () => void } | null>(null);

  // Keep ref in sync
  drawerWidthRef.current = drawerWidth;

  const [prevSection, setPrevSection] = useState(section.id);
  if (prevSection !== section.id) {
    setCode(section.code);
    setPrevSection(section.id);
    preview.reset();
  }

  const handleRun = useCallback(() => {
    preview.runCode(code);
    setDrawerOpen(true);
  }, [code, preview]);

  const handleReset = useCallback(() => {
    setCode(section.code);
    preview.reset();
  }, [section.code, preview]);

  const handleCloseDrawer = useCallback(() => {
    setDrawerOpen(false);
  }, []);

  const isDraggingRef = useRef(false);

  const handleDragStart = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    isDraggingRef.current = true;

    // Use pointer capture so the drag handle receives all pointer events
    // even if the mouse leaves the element (e.g. enters iframe).
    // This prevents the iframe from stealing mouse events during drag.
    const target = e.currentTarget as HTMLElement;
    target.setPointerCapture(e.nativeEvent.pointerId);

    const startWidth = drawerRef.current?.offsetWidth ?? drawerWidthRef.current;
    dragStateRef.current = {
      startX: e.clientX,
      startWidth,
    };
    document.body.setAttribute("data-resizing", "");
    // Disable ALL transitions on drawer during drag for smoothness
    if (drawerRef.current) {
      drawerRef.current.style.transition = "none";
    }

    const handleDragMove = (moveEvent: PointerEvent) => {
      if (!isDraggingRef.current) return;
      const delta = dragStateRef.current.startX - moveEvent.clientX;
      const minWidth = 280;
      const maxWidth = Math.max(minWidth, (window.innerWidth * 0.6));
      const newWidth = Math.max(minWidth, Math.min(maxWidth, dragStateRef.current.startWidth + delta));
      if (drawerRef.current) {
        drawerRef.current.style.width = `${newWidth}px`;
      }
      drawerWidthRef.current = newWidth;
    };

    const handleDragEnd = () => {
      isDraggingRef.current = false;
      // Re-enable transitions
      if (drawerRef.current) {
        drawerRef.current.style.transition = "";
      }
      setDrawerWidth(drawerWidthRef.current);
      document.body.removeAttribute("data-resizing");
      target.removeEventListener("pointermove", handleDragMove);
      target.removeEventListener("pointerup", handleDragEnd);
      target.removeEventListener("pointercancel", handleDragEnd);
      dragListenersRef.current = null;
    };

    // Use pointer events on the captured target, not window events.
    // Pointer capture ensures events are delivered to this element
    // even when the pointer moves over the iframe.
    target.addEventListener("pointermove", handleDragMove);
    target.addEventListener("pointerup", handleDragEnd);
    target.addEventListener("pointercancel", handleDragEnd);
  }, []);

  // Close info popover on outside click
  useEffect(() => {
    if (!infoOpen) return;
    const handler = (e: MouseEvent) => {
      if (infoRef.current && !infoRef.current.contains(e.target as Node)) {
        setInfoOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [infoOpen]);

  // Cleanup drag listeners on unmount
  useEffect(() => {
    return () => {
      isDraggingRef.current = false;
      if (dragListenersRef.current) {
        // These are pointer events on the drag handle element, not window events
        document.body.removeAttribute("data-resizing");
      }
    };
  }, []);

  return (
    <div className="h-full flex min-h-0">
      {/* Left: Editor area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Toolbar */}
        <div className="sticky top-0 z-10 flex items-center justify-between px-4 py-2.5
                        bg-surface-100 dark:bg-surface-900
                        border-b border-surface-200/80 dark:border-surface-800/60
                        transition-colors duration-200 ease-out">
          <div className="flex items-center gap-2 relative">
            <button
              onClick={onToggleSidebar}
              className="hidden lg:inline-flex p-1.5 rounded-lg text-surface-400 dark:text-surface-500
                         hover:bg-surface-200 dark:hover:bg-surface-800/80 hover:text-surface-600 dark:hover:text-surface-300
                         transition-all duration-150 ease-out items-center justify-center"
              aria-label={sidebarOpen ? "Collapse sidebar" : "Expand sidebar"}
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={sidebarOpen ? "M15 19l-7-7 7-7" : "M9 5l7 7-7 7"} />
              </svg>
            </button>
            <span className="text-xs text-surface-500 dark:text-surface-500 font-mono tracking-wide">
              {section.chapterId}/{section.id}.html
            </span>
            <button
              onClick={() => setInfoOpen(!infoOpen)}
              className="p-1 text-surface-400 dark:text-surface-500
                         hover:text-primary-600 dark:hover:text-primary-400
                         hover:bg-primary-50 dark:hover:bg-primary-900/20
                         rounded-md transition-all duration-150 ease-out"
              title="查看说明"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a99 0 11-18 0 9-18 0zm-9-3.75h.008v.008H12V8.25z" />
              </svg>
            </button>

            {/* Info popover */}
            {infoOpen && (
              <div
                ref={infoRef}
                className="absolute top-full left-0 mt-2 w-80 p-4 z-50
                           bg-white dark:bg-surface-800
                           border border-surface-200 dark:border-surface-700
                           rounded-xl shadow-xl shadow-surface-900/10 dark:shadow-black/30
                           animate-in fade-in slide-in-from-top-1 duration-150"
              >
                <h3 className="text-sm font-bold text-surface-900 dark:text-white mb-2">{section.title}</h3>
                {section.description && (
                  <p className="text-xs text-surface-500 dark:text-surface-400 leading-relaxed mb-3">{section.description}</p>
                )}
                {section.goals.length > 0 && (
                  <div className="mb-3">
                    <h4 className="text-[10px] font-semibold text-surface-400 dark:text-surface-500 mb-1.5 uppercase tracking-wider">学习目标</h4>
                    <ul className="space-y-1">
                      {section.goals.map((goal, i) => (
                        <li key={i} className="text-xs text-surface-600 dark:text-surface-300 flex items-start gap-2">
                          <span className="text-primary-500 mt-1 text-[6px]">●</span>
                          <span className="leading-relaxed">{goal}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {section.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {section.tags.map((tag) => (
                      <span
                        key={tag}
                        className="px-2 py-0.5 text-[10px] font-medium
                                   bg-surface-100 dark:bg-surface-700/50
                                   text-surface-500 dark:text-surface-400
                                   rounded-md border border-surface-200/60 dark:border-surface-600/30"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
          <div className="flex items-center gap-2">
              <button
                onClick={handleReset}
                className="px-3 py-1.5 text-xs font-medium text-surface-500 dark:text-surface-500
                           hover:text-surface-800 dark:hover:text-white
                           bg-surface-200/80 dark:bg-surface-800
                           hover:bg-surface-300 dark:hover:bg-surface-700
                           rounded-lg transition-all duration-150 ease-out
                           active:scale-95"
              >
                重置
              </button>
              <button
                onClick={handleRun}
                className={`
                  px-4 py-1.5 text-xs font-semibold rounded-lg
                  transition-all duration-150 ease-out active:scale-95
                  bg-primary-600 hover:bg-primary-500 text-white shadow-sm shadow-primary-600/25 hover:shadow-md hover:shadow-primary-500/30
                `}
              >
                ▶ 预览
              </button>
            </div>
        </div>

        {/* Code editor */}
        <div className="flex-1 min-h-0 overflow-auto">
          <CodeEditor
            value={code}
            onChange={setCode}
            readOnly={false}
          />
        </div>
      </div>

      {/* Right: Preview drawer */}
      <div
        ref={drawerRef}
        className={`
          flex-shrink-0 h-full flex flex-row
          border-l border-surface-200 dark:border-surface-800/60
          ${drawerOpen
            ? "opacity-100"
            : "w-0 opacity-0 overflow-hidden border-l-0 pointer-events-none"
          }
        `}
        style={drawerOpen ? { width: `${drawerWidth}px`, transition: "width 200ms ease-out, opacity 200ms ease-out" } : undefined}
      >
        {/* Drag handle — thin bar with pointer capture */}
        <div
          className="w-1.5 h-full cursor-col-resize
                      hover:bg-primary-500/20 active:bg-primary-500/30
                      transition-colors duration-100"
          onPointerDown={handleDragStart}
        />
        <div className="h-full overflow-hidden flex-1 min-w-0">
          <PreviewPanel
            srcDoc={preview.srcDoc}
            error={preview.error}
            isDragging={isDraggingRef.current}
            onClose={handleCloseDrawer}
          />
        </div>
      </div>
    </div>
  );
}