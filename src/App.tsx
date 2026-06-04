import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Layout from "./components/Layout";
import HomePage from "./pages/HomePage";
import LessonPage from "./pages/LessonPage";
import { useContent, getFirstSection } from "./hooks/useContent";
import { useTheme } from "./hooks/useTheme";

export default function App() {
  const { data, loading, error } = useContent();
  const { theme, toggleTheme } = useTheme();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-surface-50 dark:bg-surface-950 transition-colors duration-200 ease-out">
        <div className="text-center">
          <div className="w-8 h-8 border-[3px] border-primary-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-surface-400 dark:text-surface-500 text-sm font-medium">加载内容...</p>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="flex items-center justify-center h-screen bg-surface-50 dark:bg-surface-950 transition-colors duration-200 ease-out">
        <div className="text-center">
          <div className="text-4xl mb-4">⚠️</div>
          <h2 className="text-xl font-semibold text-surface-700 dark:text-surface-200 mb-2">加载失败</h2>
          <p className="text-surface-400 dark:text-surface-500 text-sm">{error || "无法加载内容数据"}</p>
        </div>
      </div>
    );
  }

  const firstSection = getFirstSection(data);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage data={data} theme={theme} toggleTheme={toggleTheme} />} />
        <Route path="/learn" element={<Layout data={data} theme={theme} toggleTheme={toggleTheme} />}>
          <Route index element={
            firstSection
              ? <Navigate to={`/learn/${firstSection.chapterId}/${firstSection.sectionId}`} replace />
              : <Navigate to="/" replace />
          } />
          <Route path=":chapterId/:sectionId" element={<LessonPage data={data} />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
