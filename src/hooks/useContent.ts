import { useState, useEffect } from "react";
import type { ContentData, Chapter, Section } from "../types/content";

export function useContent() {
  const [data, setData] = useState<ContentData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    import("../data/content.json")
      .then((mod) => {
        setData(mod.default as ContentData);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  return { data, loading, error };
}

export function findSection(
  data: ContentData,
  chapterId: string,
  sectionId: string
): { chapter: Chapter; section: Section } | null {
  const chapter = data.chapters.find((c) => c.id === chapterId);
  if (!chapter) return null;
  const section = chapter.sections.find((s) => s.id === sectionId);
  if (!section) return null;
  return { chapter, section };
}

export function getFirstSection(data: ContentData): {
  chapterId: string;
  sectionId: string;
} | null {
  const firstChapter = data.chapters[0];
  if (!firstChapter) return null;
  const firstSection = firstChapter.sections[0];
  if (!firstSection) return null;
  return { chapterId: firstChapter.id, sectionId: firstSection.id };
}
