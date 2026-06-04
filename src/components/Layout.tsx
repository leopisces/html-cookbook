import { Outlet, useParams, Navigate } from "react-router-dom";
import Sidebar from "./Sidebar";
import type { ContentData } from "../types/content";

interface LayoutProps {
  data: ContentData;
  theme: "light" | "dark";
  toggleTheme: () => void;
}

export default function Layout({ data, theme, toggleTheme }: LayoutProps) {
  const { chapterId, sectionId } = useParams<{
    chapterId: string;
    sectionId: string;
  }>();

  if (!chapterId || !sectionId) {
    const firstChapter = data.chapters[0];
    const firstSection = firstChapter?.sections[0];
    if (firstChapter && firstSection) {
      return <Navigate to={`/learn/${firstChapter.id}/${firstSection.id}`} replace />;
    }
    return <Navigate to="/" replace />;
  }

  return (
    <div className="flex h-screen bg-surface-50 dark:bg-surface-950 transition-colors duration-200 ease-out">
      <Sidebar data={data} theme={theme} toggleTheme={toggleTheme} />
      <main className="flex-1 overflow-hidden flex flex-col bg-white dark:bg-surface-900 shadow-xs transition-colors duration-200 ease-out">
        <Outlet />
      </main>
    </div>
  );
}
