# 幻梦 Illusion v1.1.0

> 一款追求极致视觉体验的 Hugo 博客主题 —— 朦胧幻梦、毛玻璃 UI、昼夜双粒子特效，专为中文博客设计

[![Hugo](https://img.shields.io/badge/Hugo-%3E%3D0.146.0-FF4088?logo=hugo)](https://gohugo.io)
[![License](https://img.shields.io/badge/License-GPLv3-blue.svg)](LICENSE)
[![Demo](https://img.shields.io/badge/Demo-illusion.azxt.org-brightgreen)](https://illusion.azxt.org)
[![Version](https://img.shields.io/badge/Version-v1.1.0-orange)](https://github.com/aizexintong/illusion)

---

## 项目简介

**幻梦 (Illusion)** v1.1.0 正式预览版——为个人博客打造的 Hugo 主题，将自然意象（晨雾、星空、萤火虫、糖果雨）融入数字设计。

在线演示: [https://illusion.azxt.org](https://illusion.azxt.org)

> **版本说明**: v1.1.0 为正式预览版，核心功能稳定可用，可能存在少量不影响正常使用的边界情况瑕疵，欢迎反馈。

---

## 功能特性

| 功能 | 说明 |
|------|------|
| 三模主题 | 朦胧幻梦（浅色）/ 夜色幻梦（深色）/ 跟随系统，自动切换粒子背景 |
| Canvas 粒子特效 | 浅色模式：糖果彩带雨 + 爱心 + 星星；深色模式：星光闪烁 + 萤火虫 + 流星 |
| 本地搜索 | 全客户端搜索，Ctrl+K 快捷键，JSON 索引驱动，无需后端 |
| 毛玻璃 UI | 全站统一毛玻璃效果，`backdrop-filter: blur()` 实现通透质感 |
| 打字机效果 | 首页副标题 Typed.js 轮播，可配置多条文案 |
| SEO 完备 | Open Graph / Twitter Cards / Schema.org / RSS / Sitemap |
| 响应式设计 | 5 级断点（576 / 768 / 992 / 1200 / 1440），移动端完善适配 |
| 国际化 | 完整的 zh-CN 翻译（约 200 项），JS 运行时自动注入 |
| 数据驱动 | 单一 `data/theme.yaml` 管理首页、关于、技能、友链、工具、404 等所有页面 |
| 滚动动画 | AOS 库驱动入场动画，卡片 3D 鼠标跟随透视效果 |
| 代码高亮 | Chroma 语法高亮 + 语言标签 + 一键复制按钮 |
| 图片灯箱 | 点击放大，Esc 或点击外部关闭 |
| 归档页面 | 按年月分组，侧边栏年份导航 + 月份网格 + 文章统计 |
| 标签/分类 | Hugo 原生分类法，格子展示 + 客户端分页 |
| RSS | 自动生成 RSS 和 JSON Feed |

---

## 快速开始

### 环境要求

- **Hugo** >= v0.146.0（extended 版本，需要 Dart Sass）
- **Git**

### 安装

```bash
hugo new site myblog
cd myblog
git init
git submodule add https://github.com/aizexintong/illusion themes/illusion
cp themes/illusion/hugo.toml hugo.toml
cp -r themes/illusion/data/ data/
cp -r themes/illusion/content/ content/
cp -r themes/illusion/i18n/ i18n/
```

### 本地运行

```bash
hugo server
```

### 生产构建

```bash
hugo --minify --cleanDestinationDir
```

---

## 目录结构

```
myblog/
├── hugo.toml              # 站点主配置（功能开关、菜单、评论等）
├── data/
│   └── theme.yaml         # 主题数据文件（统一管理所有页面内容）
├── i18n/
│   └── zh-CN.yaml         # 翻译文件
├── content/
│   └── posts/             # 文章目录
├── static/                # 覆盖主题 static/
├── assets/                # 覆盖主题 SCSS/TS
├── layouts/               # 覆盖主题模板
└── themes/
    └── illusion/
        ├── hugo.toml
        ├── data/theme.yaml
        ├── i18n/zh-CN.yaml
        ├── archetypes/default.md
        ├── assets/
        │   ├── scss/main.scss
        │   └── ts/main.ts
        ├── layouts/
        │   ├── _default/         # 默认模板
        │   ├── posts/            # 文章模板
        │   ├── categories/       # 分类模板
        │   ├── tags/             # 标签模板
        │   └── partials/         # 组件部分
        ├── static/
        │   ├── lib/aos/          # AOS 动画库本地回退
        │   ├── lib/fontawesome/  # Font Awesome 本地回退
        │   ├── lib/fonts/        # 字体定义
        │   └── lib/typed.js/     # Typed.js 本地回退
        └── LICENSE
```

> **覆盖规则**: 站点根目录的同名文件自动覆盖主题文件。建议通过 `data/theme.yaml` 定制，而非直接修改主题源码。

---

## 配置详解

### 站点配置 (hugo.toml)

```toml
baseURL = 'https://yourdomain.com/'
title = '你的站点标题'
theme = 'illusion'
defaultContentLanguage = 'zh'

[params]
  author = "你的名字"
  description = "站点描述"
  email = "you@example.com"
  github = "your-github"
  domain = "yourdomain.com"
  siteTime = "2026-01-01T00:00:00+08:00"

  # 功能开关
  enableDarkMode = true
  enableSearch = true
  enableParticles = true
  enable3DEffects = true
  enableScrollAnimations = true
  enableTypewriter = true
  enableAccessibility = true
  enableTOC = true
  enableComments = false
  lazyLoadImages = true
  enableSchema = true
  enableOpenGraph = true
  enableTwitterCards = true

  # 评论系统（可选: disqus | utterances | giscus | twikoo | waline | artalk）
  commentsProvider = "giscus"
  # 各评论系统具体参数详见 hugo.toml 中的注释
```

### 数据文件 (theme.yaml)

`data/theme.yaml` 是主题的**唯一数据源**，涵盖以下配置区域：

| 区域 | 说明 |
|------|------|
| `home` | 首页：Hero 首屏、文章展示、关于卡片、技能展示 |
| `about` | 关于页：个人信息、统计数据、技术理念、联系方式 |
| `assets` | 资源管理：头像、背景图、OG 图片、默认封面 |
| `social` | 社交链接：GitHub、邮箱、RSS、Twitter、Telegram、微信 |
| `skills` | 技能页：技能总览分类、详细技能项、发展时间线 |
| `friends` | 友链页：友链列表、申请条件、联系方式 |
| `tools` | 工具页：分类工具卡片列表 |
| `error404` | 404 页面：提示信息、返回按钮 |
| `tags` | 标签页配置：标题、每页数量 |
| `layout` | 布局策略：文章列表、侧边栏、代码块、特效开关、性能策略 |

完整配置项和默认值详见主题自带的 `data/theme.yaml` 文件内注释。

### 国际化

主题内置完整的 zh-CN 简体中文翻译（约 200 项），涵盖：

- 导航菜单、按钮、文章元数据
- 分页、归档、搜索、主题切换
- 页脚、日历、相对时间、无障碍标签

如需其他语言，将 `i18n/zh-CN.yaml` 复制一份翻译后，修改 `hugo.toml` 中的 `defaultContentLanguage` 和语言配置即可。主题设计上为单语言博客优化，因此未做多语言并行排版。

### 文章 Front Matter

```yaml
---
title: "文章标题"
date: 2026-04-01T12:00:00+08:00
lastmod: 2026-04-15T18:00:00+08:00
description: "文章简介，用于摘要和 SEO"
tags: ["Hugo", "博客", "教程"]
categories: ["技术"]
cover: "https://example.com/cover.jpg"
draft: false
toc: true
---
```

### 短代码

```markdown
# 技能展示
{{< skills >}}

# 友链卡片
{{< links-grid >}}
  {{< link-card avatar="..." name="站点名" desc="描述" url="https://..." >}}
{{< /links-grid >}}
```

---

## 技术架构

| 层级 | 技术 |
|------|------|
| 静态生成 | Hugo（Go templates） |
| 样式引擎 | SCSS → Hugo Dart Sass 编译（单体 `main.scss`，约 6500 行） |
| 脚本引擎 | TypeScript → Hugo `js.Build`（单体 `main.ts`，约 2000 行） |
| 动画库 | AOS.js + Typed.js（CDN 优先，本地回退） |
| 图标 | Font Awesome 6（CDN 优先，本地回退） |
| 字体 | Inter + Noto Sans SC + JetBrains Mono + 系统字体回退 |

### JavaScript 模块（12 个管理器）

| 模块 | 职责 |
|------|------|
| I18nHelper | 运行时翻译，参数插值 |
| ThemeManager | 三模主题切换，localStorage 持久化 |
| EffectsManager | Canvas 粒子系统，性能自适应 |
| AnimationManager | AOS 初始化，Typed.js，滚动进度条 |
| InteractionManager | 移动端菜单，平滑滚动，懒加载，搜索模态框 |
| EnhancementManager | 代码增强（语言标签 + 复制），标题锚点 |
| UtilsManager | 滚动按钮，图片灯箱，TOC 高亮，涟漪效果 |
| FontFallback | FontAwesome CDN 失败自动回退 |
| FooterManager | 动态版权，运行时长，渲染耗时 |
| SearchEngine | 客户端全文搜索，关键词高亮 |
| CalendarWidget | 侧边栏日历渲染 |
| TagsPagination | 标签/分类客户端分页 |

---

## 设计系统

### 色彩

通过 CSS 自定义属性切换两套完整配色：

- **朦胧幻梦（浅色）**: 暖桃色/杏色系，背景 `#FDF8F5`，文字 `#2E2825`
- **夜色幻梦（深色）**: 暖深色系，背景 `#0E0A08`，文字 `#EDE0D8`

### 粒子系统

| 模式 | 粒子类型 |
|------|----------|
| 浅色 | 彩带、糖果（3 种）、爱心、星星 |
| 深色 | 星光（3 种光谱）、萤火虫、流星 |

自动检测设备性能，低性能设备粒子数量自动减半，`prefers-reduced-motion` 用户自动禁用。

### 动画

- AOS 滚动入场动画
- 卡片 3D 鼠标跟随透视
- IntersectionObserver 驱动技能条动画
- 滚动进度条
- 按钮点击涟漪效果

---

## 部署

```bash
hugo --minify --cleanDestinationDir
```

输出 `public/` 目录，部署到任意静态托管服务（GitHub Pages、Vercel、Netlify、Cloudflare Pages 等）。

---

## 许可证

幻梦 (Illusion) v1.1.0 基于 **GPL v3.0** 许可证开源。详见 [LICENSE](LICENSE)。

作者: [爱则心痛 (azxt)](https://github.com/aizexintong)

---

*代码是诗，键盘是笔，屏幕是画布，让我们一起书写数字世界的篇章。*
