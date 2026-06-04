interface PreviewPanelProps {
  srcDoc: string;
  error: string | null;
  isDragging?: boolean;
  onClose?: () => void;
}

export default function PreviewPanel({ srcDoc, error, isDragging, onClose }: PreviewPanelProps) {
  return (
    <div className="h-full flex flex-col bg-white dark:bg-surface-950 transition-colors duration-200 ease-out">
      <div className="sticky top-0 z-10 flex items-center justify-between px-4 py-2.5
                      bg-surface-100/80 dark:bg-surface-900/80
                      border-b border-surface-200/80 dark:border-surface-800/40">
        <div className="flex items-center gap-2">
          <div className="flex gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-red-500/60"></span>
            <span className="w-2.5 h-2.5 rounded-full bg-yellow-500/60"></span>
            <span className="w-2.5 h-2.5 rounded-full bg-green-500/60"></span>
          </div>
          <span className="text-xs font-medium text-surface-600 dark:text-surface-400 tracking-wide">预览</span>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="p-1.5 text-surface-400 dark:text-surface-500
                       hover:text-surface-600 dark:hover:text-surface-300
                       hover:bg-surface-200/60 dark:hover:bg-surface-800/60
                       rounded-md transition-all duration-150 ease-out
                       active:scale-95"
            title="关闭面板"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>
      <div className="flex-1 overflow-hidden">
        {!srcDoc && !error && (
          <div className="flex flex-col items-center justify-center h-full text-surface-400 dark:text-surface-600">
            <svg className="w-8 h-8 mb-2 opacity-40" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13V6a3 3 0 013-3h12a3 3 0 013 3v7M6.75 13a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z" />
            </svg>
            <span className="text-xs italic">点击「预览」按钮查看渲染效果</span>
          </div>
        )}
        {srcDoc && !error && (
          <iframe
            srcDoc={srcDoc}
            title="HTML Preview"
            sandbox="allow-scripts"
            className="w-full h-full border-0 bg-white"
            style={isDragging ? { pointerEvents: "none" } : undefined}
          />
        )}
        {error && (
          <div className="flex-1 overflow-auto p-4">
            <pre className="text-red-500 dark:text-red-300 whitespace-pre-wrap text-sm font-mono">{error}</pre>
          </div>
        )}
      </div>
    </div>
  );
}