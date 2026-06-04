import { useState, useCallback, useRef } from "react";

interface HtmlPreviewState {
  srcDoc: string;
  error: string | null;
}

/**
 * useHtmlPreview — Hook to render HTML code in a sandboxed iframe.
 *
 * Instead of Pyodide (browser Python runtime), we use srcdoc on an iframe
 * to directly render the user's HTML. All HTML demos are "runnable" by default
 * since any valid HTML can be rendered in a browser.
 *
 * Key differences from usePyodide:
 * - No external runtime to load (Pyodide ~20MB download)
 * - Instant rendering — no async execution
 * - Errors captured via iframe error handling
 * - Debounced updates to avoid excessive re-renders during rapid editing
 */
export function useHtmlPreview() {
  const [state, setState] = useState<HtmlPreviewState>({
    srcDoc: "",
    error: null,
  });

  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const runCode = useCallback((code: string) => {
    // Cancel any pending debounce
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
      debounceTimerRef.current = null;
    }

    // Reset error state
    setState({ srcDoc: code, error: null });
  }, []);

  // Debounced version for auto-preview during editing
  const debouncedRunCode = useCallback((code: string) => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }
    debounceTimerRef.current = setTimeout(() => {
      setState({ srcDoc: code, error: null });
      debounceTimerRef.current = null;
    }, 300);
  }, []);

  const reset = useCallback(() => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
      debounceTimerRef.current = null;
    }
    setState({ srcDoc: "", error: null });
  }, []);

  // Cleanup timer on unmount
  // Note: We don't need useEffect cleanup here since the timer is managed via ref

  return {
    ...state,
    runCode,
    debouncedRunCode,
    reset,
  };
}