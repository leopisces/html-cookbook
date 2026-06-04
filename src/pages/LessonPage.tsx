import { useParams, Navigate, useOutletContext } from "react-router-dom";
import CodeRunner from "../components/CodeRunner";
import type { ContentData } from "../types/content";
import { findSection } from "../hooks/useContent";

interface LessonPageProps {
  data: ContentData;
}

interface OutletContext {
  sidebarOpen: boolean;
  onToggleSidebar: () => void;
}

export default function LessonPage({ data }: LessonPageProps) {
  const { sidebarOpen, onToggleSidebar } = useOutletContext<OutletContext>();
  const { chapterId, sectionId } = useParams<{
    chapterId: string;
    sectionId: string;
  }>();

  if (!chapterId || !sectionId) {
    return <Navigate to="/" replace />;
  }

  const result = findSection(data, chapterId, sectionId);

  if (!result) {
    return (
      <div className="flex items-center justify-center h-full bg-surface-50 dark:bg-surface-900">
        <div className="text-center">
          <div className="text-5xl mb-4">😕</div>
          <h2 className="text-xl font-semibold text-surface-700 dark:text-surface-200 mb-2">页面未找到</h2>
          <p className="text-surface-400 dark:text-surface-500 text-sm">
            章节 {chapterId}/{sectionId} 不存在
          </p>
        </div>
      </div>
    );
  }

  return <CodeRunner section={result.section} sidebarOpen={sidebarOpen} onToggleSidebar={onToggleSidebar} />;
}
