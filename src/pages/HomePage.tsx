import { Link } from "react-router-dom";
import ThemeToggle from "../components/ThemeToggle";
import type { ContentData } from "../types/content";

interface HomePageProps {
  data: ContentData;
  theme: "light" | "dark";
  toggleTheme: () => void;
}

export default function HomePage({ data, theme, toggleTheme }: HomePageProps) {
  const firstChapter = data.chapters[0];
  const firstSection = firstChapter?.sections[0];
  const totalSections = data.chapters.reduce((sum, ch) => sum + ch.sections.length, 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50/60 via-surface-50 to-primary-100/40
                    dark:from-surface-950 dark:via-surface-900 dark:to-surface-950
                    transition-colors duration-300 ease-out">
      {/* Header with theme toggle */}
      <div className="absolute top-5 right-5">
        <ThemeToggle theme={theme} toggleTheme={toggleTheme} />
      </div>

      {/* Hero */}
      <header className="max-w-4xl mx-auto px-6 pt-24 pb-16 text-center">
        <div className="text-7xl mb-8 drop-shadow-sm">🌐</div>
        <h1 className="text-5xl font-extrabold text-surface-900 dark:text-white mb-4 tracking-tight">
          HTML Cookbook
        </h1>
        <p className="text-lg text-surface-500 dark:text-surface-400 mb-10 max-w-2xl mx-auto leading-relaxed">
          交互式 HTML 学习平台 · {data.chapters.length} 个章节 · {totalSections} 个知识点 ·
          浏览器内实时预览效果
        </p>
        {firstChapter && firstSection && (
          <Link
            to={`/learn/${firstChapter.id}/${firstSection.id}`}
            className="inline-flex items-center gap-2.5 px-7 py-3.5 bg-primary-600 text-white
                       rounded-xl hover:bg-primary-500 transition-all duration-200 ease-out
                       text-lg font-semibold shadow-lg shadow-primary-600/25
                       hover:shadow-xl hover:shadow-primary-500/30 hover:-translate-y-0.5
                       active:translate-y-0 active:shadow-md"
          >
            开始学习
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </Link>
        )}
        <div className="mt-8 flex items-center justify-center gap-8 text-sm text-surface-400 dark:text-surface-500">
          <span className="flex items-center gap-2">
            <span className="w-2 h-2 bg-primary-500 rounded-full shadow-sm shadow-primary-500/40"></span>
            {totalSections} 个可预览示例
          </span>
        </div>
      </header>

      {/* Chapter grid */}
      <main className="max-w-4xl mx-auto px-6 pb-24">
        <div className="grid gap-5">
          {data.chapters.map((chapter, index) => (
            <div
              key={chapter.id}
              className="group bg-white dark:bg-surface-800/80 rounded-2xl
                         border border-surface-200/80 dark:border-surface-700/50
                         p-6 hover-lift
                         shadow-sm hover:shadow-lg hover:shadow-surface-900/5
                         dark:hover:shadow-black/20
                         transition-all duration-200 ease-out"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <span className="inline-flex items-center justify-center w-8 h-8 rounded-lg
                                   bg-primary-50 dark:bg-primary-900/30 text-primary-600
                                   dark:text-primary-400 text-xs font-mono font-bold
                                   group-hover:bg-primary-100 dark:group-hover:bg-primary-900/50
                                   transition-colors duration-200">
                    {chapter.order.toString().padStart(2, "0")}
                  </span>
                  <h2 className="text-lg font-semibold text-surface-900 dark:text-white group-hover:text-primary-600
                                 dark:group-hover:text-primary-400 transition-colors duration-200">
                    {chapter.title}
                  </h2>
                </div>
                <span className="text-xs text-surface-400 dark:text-surface-500 bg-surface-50
                                 dark:bg-surface-700/50 px-2.5 py-1 rounded-lg font-medium">
                  {chapter.sections.length} 个知识点
                </span>
              </div>
              <p className="text-sm text-surface-500 dark:text-surface-400 mb-4 leading-relaxed">
                {chapter.description}
              </p>
              <div className="flex flex-wrap gap-2">
                {chapter.sections.map((section) => (
                  <Link
                    key={section.id}
                    to={`/learn/${chapter.id}/${section.id}`}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium
                               bg-surface-50 dark:bg-surface-700/40
                               hover:bg-primary-50 dark:hover:bg-primary-900/20
                               text-surface-600 dark:text-surface-300
                               hover:text-primary-700 dark:hover:text-primary-300
                               rounded-lg transition-all duration-150 ease-out
                               border border-surface-200/60 dark:border-surface-600/30
                               hover:border-primary-200 dark:hover:border-primary-700/50
                               hover:shadow-xs"
                  >
                    {section.title}
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}