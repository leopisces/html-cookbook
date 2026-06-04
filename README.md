# HTML Cookbook - 交互式学习平台

基于 React + TypeScript + Vite 的浏览器内 HTML/CSS 交互式学习平台。

## 特性

- 📄 浏览器内实时预览 HTML 代码（iframe 渲染）
- 🌗 亮色/暗色主题切换
- 📐 设计令牌系统（emerald primary + slate surface）
- 🖥️ 代码编辑器 + 右侧预览抽屉面板
- 📱 响应式布局

## 快速开始

```bash
# 安装依赖
npm install

# 开发模式（自动扫描 demos/ 生成内容）
npm run dev

# 构建
npm run build
```

## 添加新的 Demo

在 `demos/` 目录下按约定结构添加 `.html` 文件即可，无需手动编辑 JSON。

### 文件组织

```
demos/
├── 01-basics/               # 章节（文件夹名 = 章节 ID）
│   ├── 01_document_structure.html  # 小节（文件名 = 小节 ID）
│   ├── 02_tags_and_attributes.html
│   └── ...
├── 02-semantic/
│   └── ...
└── 13-my-topic/             # 新增章节
    └── 01_my_demo.html      # 新增示例
```

### .html 文件格式

文件中用 HTML 注释标记元数据（标题、学习目标等）：

```html
<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <!-- title: 你的标题 -->
  <!-- description: 你的描述 -->
  <!-- goals: 目标一; 目标二; 目标三 -->
  <!-- tags: css, layout -->
  <title>你的标题</title>
</head>
<body>
  <!-- 你的 HTML 内容 -->
</body>
</html>
```

> 如果不写注释元数据，脚本会自动从 `<title>` 标签提取标题。

### 新增章节

新增章节文件夹后，需在 `scripts/build-content.ts` 的 `CHAPTER_META` 中补上中文标题和描述：

```ts
const CHAPTER_META: Record<string, { title: string; description: string }> = {
  // ...existing...
  "13-my-topic": { title: "我的主题", description: "主题简介" },
};
```

### 自动化

| 命令 | 说明 |
|------|------|
| `npm run dev` | 启动开发服务器（自动先扫描 demos/） |
| `npm run build` | 构建生产版本（自动先扫描 demos/） |
| `npm run generate` | 单独重新生成 content.json |

开发模式下修改 `demos/` 里的 `.html` 文件，Vite 会自动重新生成 `content.json` 并热更新浏览器。

## 技术栈

- **React 19** + **TypeScript 6**
- **Vite 8** + **Tailwind CSS v4**
- **CodeMirror** (HTML 语法高亮 + oneDark 主题)
- **React Router 7**

## 项目结构

```
src/
├── components/
│   ├── CodeEditor.tsx      # 代码编辑器（主题自适应，HTML 语法）
│   ├── CodeRunner.tsx      # 主编辑器容器 + 预览抽屉
│   ├── PreviewPanel.tsx    # 预览面板（iframe 渲染）
│   ├── Sidebar.tsx         # 侧边栏导航
│   ├── ThemeToggle.tsx     # 主题切换
│   └── Layout.tsx          # 页面布局
├── hooks/
│   ├── useContent.ts       # 内容数据加载
│   ├── useHtmlPreview.ts   # HTML 预览（iframe srcDoc 渲染）
│   └── useTheme.ts         # 主题管理
├── data/
│   └── content.json        # 自动生成，勿手动编辑
├── pages/
│   ├── HomePage.tsx        # 首页
│   └── LessonPage.tsx      # 课程页
├── types/
│   └── content.ts          # 类型定义
└── index.css               # 全局样式 + 设计令牌
demos/                       # HTML demo 源文件
scripts/
└── build-content.ts        # demos/ → content.json 构建脚本
```
