/**
 * build-content.ts
 * 解析 demos/ 目录下所有 .html demo 文件，生成 content.json 供前端使用。
 * 运行: npx tsx scripts/build-content.ts
 */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

// ESM 兼容的 __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ============================================================
// 类型定义
// ============================================================

interface Chapter {
  id: string;
  title: string;
  description: string;
  order: number;
  sections: Section[];
}

interface Section {
  id: string;
  title: string;
  chapterId: string;
  description: string;
  goals: string[];
  code: string;
  runnable: boolean;
  output?: string;
  tags: string[];
}

interface ContentData {
  chapters: Chapter[];
  generatedAt: string;
}

// ============================================================
// 章节元数据
// ============================================================

const CHAPTER_META: Record<string, { title: string; description: string }> = {
  "01-basics": { title: "HTML 基础", description: "HTML 入门：文档结构、标签、属性、文本格式化" },
  "02-semantic": { title: "语义化标签", description: "语义化 HTML：header、nav、main、article、section、footer" },
  "03-forms": { title: "表单与输入", description: "表单元素：input、select、textarea、表单验证" },
  "04-media": { title: "媒体与嵌入", description: "图片、音频、视频、iframe 嵌入" },
  "05-tables": { title: "表格", description: "HTML 表格：结构、合并单元格、可访问性" },
  "06-lists": { title: "列表", description: "有序列表、无序列表、定义列表、嵌套列表" },
  "07-links": { title: "链接与导航", description: "超链接、锚点、导航菜单" },
  "08-css-intro": { title: "CSS 基础", description: "CSS 选择器、盒模型、布局基础" },
  "09-flexbox": { title: "Flexbox 布局", description: "弹性盒布局：主轴、交叉轴、对齐、换行" },
  "10-grid": { title: "Grid 布局", description: "网格布局：行列定义、区域、对齐" },
  "11-responsive": { title: "响应式设计", description: "媒体查询、视口、移动优先" },
  "12-animations": { title: "CSS 动画", description: "过渡、关键帧动画、变换" },
  "13-javascript": { title: "JavaScript 交互", description: "DOM 操作、事件处理、动态效果" },
};

// ============================================================
// 解析函数
// ============================================================

const DEMOS_ROOT = path.resolve(__dirname, "..", "demos");

/**
 * 从 HTML 文件中提取注释元数据。
 * 格式：在 <head> 中用 <!-- ... --> 包含元数据
 * 支持:
 *   <!-- title: 标题 -->
 *   <!-- description: 描述 -->
 *   <!-- goals: 目标1; 目标2; 目标3 -->
 *   <!-- tags: tag1, tag2 -->
 */
function extractHtmlMeta(source: string): {
  title: string;
  description: string;
  goals: string[];
  tags: string[];
} {
  let title = "";
  let description = "";
  let goals: string[] = [];
  let tags: string[] = [];

  // Try to extract <title> content
  const titleMatch = source.match(/<title>([\s\S]*?)<\/title>/i);
  if (titleMatch) {
    title = titleMatch[1].trim();
  }

  // Extract meta comments from the head or top of file
  const metaCommentRegex = /<!--\s*(title|description|goals|tags)\s*:\s*(.*?)\s*-->/gi;
  let match;
  while ((match = metaCommentRegex.exec(source)) !== null) {
    const key = match[1].toLowerCase();
    const value = match[2].trim();

    switch (key) {
      case "title":
        title = value;
        break;
      case "description":
        description = value;
        break;
      case "goals":
        goals = value.split(/[;；]/).map((g) => g.trim()).filter(Boolean);
        break;
      case "tags":
        tags = value.split(/[,，]/).map((t) => t.trim()).filter(Boolean);
        break;
    }
  }

  return { title, description, goals, tags };
}

function isRunnable(_relPath: string, _source: string): boolean {
  // HTML files are always runnable in the browser via iframe
  return true;
}

function scanChapterDir(chapterDir: string, chapterId: string): Section[] {
  const sections: Section[] = [];
  const files = fs
    .readdirSync(chapterDir)
    .filter((f: string) => f.endsWith(".html") && !f.startsWith("__"))
    .sort();

  for (const file of files) {
    const filePath = path.join(chapterDir, file);
    const source = fs.readFileSync(filePath, "utf-8");
    const meta = extractHtmlMeta(source);
    const id = file.replace(".html", "");
    const title = meta.title || id;
    const relPath = `${chapterId}/${file}`;
    const runnable = isRunnable(relPath, source);

    sections.push({
      id,
      title,
      chapterId,
      description: meta.description || meta.goals.join("；"),
      goals: meta.goals,
      code: source,
      runnable,
      tags: meta.tags,
    });
  }

  return sections;
}

// ============================================================
// 主函数
// ============================================================

function main() {
  console.log("Building content.json from demos/...");
  console.log(`Source: ${DEMOS_ROOT}`);

  if (!fs.existsSync(DEMOS_ROOT)) {
    console.error(`Error: demos/ directory not found at ${DEMOS_ROOT}`);
    process.exit(1);
  }

  const chapterDirs = fs
    .readdirSync(DEMOS_ROOT)
    .filter((d: string) => /^\d{2}-/.test(d) && fs.statSync(path.join(DEMOS_ROOT, d)).isDirectory())
    .sort();

  const chapters: Chapter[] = [];
  let totalSections = 0;

  for (const dirName of chapterDirs) {
    const chapterDir = path.join(DEMOS_ROOT, dirName);
    const meta = CHAPTER_META[dirName] || { title: dirName, description: "" };
    const sections = scanChapterDir(chapterDir, dirName);

    const chapter: Chapter = {
      id: dirName,
      title: meta.title,
      description: meta.description,
      order: chapters.length + 1,
      sections,
    };

    chapters.push(chapter);
    totalSections += sections.length;

    console.log(`  ${dirName}: ${sections.length} sections`);
  }

  const content: ContentData = {
    chapters,
    generatedAt: new Date().toISOString(),
  };

  const outDir = path.resolve(__dirname, "..", "src", "data");
  if (!fs.existsSync(outDir)) {
    fs.mkdirSync(outDir, { recursive: true });
  }

  const outPath = path.join(outDir, "content.json");
  fs.writeFileSync(outPath, JSON.stringify(content, null, 2), "utf-8");

  console.log(`\nGenerated: ${outPath}`);
  console.log(`Total: ${chapters.length} chapters, ${totalSections} sections`);
}

main();
