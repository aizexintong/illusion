# 幻梦 (Illusion)

> 一款追求极致视觉体验的 Hugo 博客主题 —— 梦幻色彩、玻璃态 UI、昼夜双粒子特效

[![Hugo](https://img.shields.io/badge/Hugo-%3E%3D0.146.0-FF4088?logo=hugo)](https://gohugo.io)
[![License](https://img.shields.io/badge/License-GPLv3-blue.svg)](LICENSE)
[![Demo](https://img.shields.io/badge/Demo-azxt.org-brightgreen)](https://azxt.org)

---

## 目录

- [项目简介](#项目简介)
- [功能特性](#功能特性)
- [架构概览](#架构概览)
- [快速开始](#快速开始)
- [目录结构](#目录结构)
- [配置详解](#配置详解)
  - [站点配置 (hugo.toml)](#站点配置-hugotoml)
  - [数据文件 (theme.yaml)](#数据文件-themeyaml)
  - [国际化 (zh-CN.yaml)](#国际化-zh-cnyaml)
  - [文章 Front Matter](#文章-front-matter)
  - [短代码](#短代码)
- [设计系统](#设计系统)
- [开发与定制](#开发与定制)
- [部署](#部署)
- [许可证与致谢](#许可证与致谢)

---

## 项目简介

**幻梦 (Illusion)** 是一款为个人博客打造的 Hugo 主题，将自然意象（晨雾、星空、萤火虫、糖果雨）融入数字设计。

在线演示: [https://azxt.org](https://azxt.org)

---

## 功能特性

| 功能 | 说明 |
|------|------|
| 🌓 三模主题 | 浅色（朦胧幻梦）/ 深色（夜色幻梦）/ 跟随系统，自动切换粒子背景 |
| ✨ Canvas 粒子特效 | 白天糖果彩带雨 + 爱心星星，夜间星光闪烁 + 萤火虫飘荡 + 流星划过 |
| 🔍 本地搜索 | 全客户端搜索，Ctrl+K 快捷键，JSON 索引驱动，无需后端 |
| 🪟 玻璃态 UI | 全站统一毛玻璃效果，`backdrop-filter: blur()` 实现通透质感 |
| ⌨️ 打字机效果 | 首页副标题 Typed.js 轮播，可配置多条文案 |
| 🎯 SEO 完备 | Open Graph / Twitter Cards / Schema.org 结构化数据 / RSS / Sitemap |
| 📱 响应式设计 | 5 级断点 (576 / 768 / 992 / 1200 / 1440)，移动端适配 |
| 🌐 国际化 | 完整的 zh-CN 翻译（~200 项），JS 运行时 `window.i18nData` 注入 |
| 📦 数据驱动 | 单一 `data/theme.yaml` 管理首页、关于、技能、友链、工具、404 等所有页面内容 |
| 🎨 滚动动画 | AOS 库驱动滚动入场动画，卡片 3D 鼠标跟随透视效果 |
| 💻 代码高亮 | Chroma 语法高亮 + 语言标签 + 一键复制按钮 |
| 🖼️ 图片灯箱 | 点击放大，Esc/点击外部关闭 |
| 📄 归档页面 | 按年月分组，侧边栏年份导航 + 月份网格 + 文章统计 |
| 🏷️ 标签 / 分类 | Hugo 原生分类法，格子式展示 + 客户端分页 |
| 📡 RSS | 自动生成 RSS / JSON Feed |

---

## 架构概览

### 技术栈

| 层级 | 技术 |
|------|------|
| 静态生成 | Hugo (Go templates) |
| 样式 engine | SCSS → Hugo Dart Sass 编译 (monolithic `main.scss`, ~6200 行) |
| 脚本 engine | TypeScript → Hugo `js.Build` (monolithic `main.ts`, ~1800 行) |
| 动画库 | AOS.js + Typed.js (CDN + 本地回退) |
| 图标 | Font Awesome 6 (CDN + 本地回退) |
| 字体 | Inter + Noto Sans SC + JetBrains Mono + 系统字体回退 |

### 模板组织

主题采用分层 partial 架构：

```
layouts/
├── _default/
│   ├── baseof.html      ← 全局外壳（head, body 结构, 背景层, 搜索模态框）
│   ├── index.json        ← 搜索索引生成
│   └── ...
├── partials/
│   ├── _layout/          ← 全局布局（head, header, footer, menu, search, comments, schema）
│   ├── _components/      ← 可复用 UI 组件（hero, cards, headers, sidebar, pagination）
│   ├── _shortcodes/      ← 短代码模板（skills, links-grid, link-card）
│   └── _utils/           ← 工具函数（relative-time）
├── index.html            ← 首页拼装（hero + posts + about + skills）
├── about.html            ← 关于页（数据驱动）
├── archives.html         ← 归档页
├── skills.html           ← 技能页
├── links.html            ← 友链页
├── tools.html            ← 工具页
└── 404.html              ← 错误页
```

### JavaScript 模块

`assets/ts/main.ts` 包含 12 个管理器模块，在 `initIllusionTheme()` 中统一初始化：

| 模块 | 职责 |
|------|------|
| I18nHelper | 运行时翻译, `{{param}}` 插值 |
| ThemeManager | 三模主题切换, localStorage 持久化, 系统偏好监听 |
| EffectsManager | Canvas 粒子系统 (糖果雨 / 星空萤火虫), 性能检测 |
| AnimationManager | AOS 初始化, 滚动进度条, 技能条动画, Typed.js |
| InteractionManager | 移动端菜单, 平滑滚动, 懒加载, 搜索模态框, 3D 卡片, 跳过链接 |
| EnhancementManager | 代码块增强 (语言标签 + 复制), 表格包装, 引用块样式, 标题锚点 |
| UtilsManager | 滚动按钮, 图片灯箱, TOC 高亮, 点击涟漪 |
| FontFallback | FontAwesome CDN 失败时自动回退本地文件 |
| FooterManager | 动态版权年份, 网站运行时间, powered-by |
| SearchEngine | 客户端搜索 (标题+内容匹配), 关键词高亮, 上下文摘录 |
| CalendarWidget | 侧边栏日历渲染 |
| TagsPagination | 标签/分类页客户端分页 |

---

## 快速开始

### 环境要求

- **Hugo** >= v0.146.0 (extended 版本，需要 Dart Sass)
- **Git**

### 安装主题

```bash
# 1. 创建 Hugo 站点
hugo new site myblog
cd myblog

# 2. 初始化 git 仓库
git init

# 3. 添加主题为 submodule
git submodule add https://github.com/aizexintong/illusion themes/illusion

# 4. 复制示例配置
cp themes/illusion/hugo.toml hugo.toml
cp -r themes/illusion/data/ data/
cp -r themes/illusion/content/ content/
cp -r themes/illusion/i18n/ i18n/
```

### 本地运行

```bash
hugo server
# 访问 http://localhost:1313
```

### 生产构建

```bash
hugo --minify --cleanDestinationDir
# 输出到 public/ 目录
```

---

## 目录结构

```
myblog/
├── hugo.toml                 # ★ 站点主配置
├── data/
│   └── theme.yaml            # ★ 主题数据文件（统一配置所有页面内容）
├── i18n/
│   └── zh-CN.yaml            # 站点级翻译（覆盖主题翻译）
├── content/
│   └── posts/                # 文章目录
├── static/                   # 静态资源（覆盖主题 static/）
├── assets/                   # 站点级 SCSS/TS（覆盖主题资源）
├── layouts/                  # 站点级模板（覆盖主题模板）
└── themes/
    └── illusion/             # ★ 幻梦主题
        ├── hugo.toml         # 主题默认配置
        ├── data/
        │   └── theme.yaml    # 主题默认数据
        ├── i18n/
        │   └── zh-CN.yaml    # 中文翻译
        ├── archetypes/
        │   └── default.md    # 文章模板
        ├── assets/
        │   ├── scss/
        │   │   └── main.scss # 样式表（单体文件, ~6200行）
        │   └── ts/
        │       └── main.ts   # TypeScript（单体文件, ~1800行）
        ├── layouts/
        │   ├── _default/
        │   │   ├── baseof.html
        │   │   ├── index.json
        │   │   ├── list.html
        │   │   ├── single.html
        │   │   ├── term.html
        │   │   └── terms.html
        │   ├── posts/
        │   │   ├── list.html
        │   │   └── single.html
        │   ├── categories/
        │   │   ├── term.html
        │   │   └── terms.html
        │   ├── tags/
        │   │   ├── term.html
        │   │   └── terms.html
        │   ├── partials/
        │   │   ├── _layout/         # 全局布局 partials
        │   │   ├── _components/     # UI 组件 partials
        │   │   ├── _shortcodes/     # 短代码 partials
        │   │   └── _utils/          # 工具 partials
        │   ├── index.html           # 首页
        │   ├── about.html           # 关于页
        │   ├── archives.html        # 归档页
        │   ├── skills.html          # 技能页
        │   ├── links.html           # 友链页
        │   ├── tools.html           # 工具页
        │   ├── legal.html           # 隐私/条款页
        │   └── 404.html             # 错误页
        ├── static/
        │   ├── favicon.svg
        │   ├── headimg.jpg
        │   ├── robots.txt
        │   └── lib/
        │       ├── aos/             # AOS 动画库
        │       ├── fontawesome/     # Font Awesome 6
        │       ├── fonts/           # 本地字体定义
        │       └── typed.js/        # Typed.js 打字机库
        └── LICENSE
```

> **Hugo 覆盖规则**: 站点根目录的同名文件会自动覆盖主题文件。建议通过 `data/theme.yaml` 定制内容，而非直接修改主题。

---

## 配置详解

### 站点配置 (hugo.toml)

```toml
# ========== 基础信息 ==========
baseURL = 'https://yourdomain.com/'
title = '你的站点标题'
theme = 'illusion'
defaultContentLanguage = 'zh'

# ========== 站点参数 ==========
[params]
  author = "你的名字"
  description = "站点描述"
  email = "you@example.com"
  github = "your-github"
  domain = "yourdomain.com"
  siteTime = "2026-01-01T00:00:00+08:00"    # 站点计时起始时间

  # 功能开关
  enableDarkMode = true           # 深色模式
  enableSearch = true             # 本地搜索
  searchProvider = "local"        # 搜索类型 (仅支持 local)
  enableParticles = true          # Canvas 粒子背景
  enable3DEffects = true          # 卡片 3D 悬停效果
  enableScrollAnimations = true   # AOS 滚动动画
  enableTypewriter = true         # 首页打字机效果
  enableAccessibility = true      # 无障碍 (skip-link, aria, focus-visible)
  enableTOC = true                # 文章内目录
  enableComments = false          # 评论系统 (暂未启用)
  lazyLoadImages = true           # 图片懒加载

  # SEO
  enableSchema = true
  enableOpenGraph = true
  enableTwitterCards = true

# ========== 导航菜单 ==========
[menus]
  [[menus.main]]
    name = '首页'
    pageRef = '/'
    weight = 5
    [menus.main.params]
      icon = 'fas fa-home'

  [[menus.main]]
    name = '文章'
    pageRef = '/posts'
    weight = 10
    [menus.main.params]
      icon = 'fas fa-file-alt'

  # ... 更多菜单项

# ========== 代码高亮 ==========
[markup]
  [markup.highlight]
    codeFences = true
    guessSyntax = true
    noClasses = false

# ========== 输出格式 ==========
[outputs]
  home = ["HTML", "JSON", "RSS"]
  page = ["HTML"]
  section = ["HTML", "RSS"]
  taxonomy = ["HTML", "RSS"]
  term = ["HTML", "RSS"]
```

### 数据文件 (theme.yaml)

`data/theme.yaml` 是主题的**唯一数据源**，管理所有页面内容和个性化配置。你可以将主题自带的数据文件复制到站点 `data/` 目录下进行覆盖。

#### 首页配置 (`home`)

```yaml
home:
  hero:
    title: "你的名字"
    subtitles:                    # Typed.js 轮播文案
      - "技术开发者"
      - "代码艺术家"
      - "终身学习者"
    description: "欢迎来到我的个人空间"
    primaryBtn:
      text: "阅读文章"
      url: "/posts"
    secondaryBtn:
      text: "关于我"
      url: "/about"
    badgeText: "欢迎来到我的世界"
    greeting: "你好，我是"
    quote:
      text: "代码是诗，键盘是笔，屏幕是画布。"
      author: "你的名字"
  posts:
    title: "最新文章"
    subtitle: "分享思考，记录成长"
    count: 6                     # 首页显示文章数量
    showMore:
      text: "查看所有文章"
      url: "/posts"
  about:
    title: "关于我"
    description: "简短个人描述..."
    btnText: "了解更多"
    btnUrl: "/about"
  skills:
    title: "技术栈"
    subtitle: "不断学习，持续进步"
    count: 6                     # 首页显示技能数量
```

#### 关于页配置 (`about`)

```yaml
about:
  intro:
    name: "你的名字"
    title: "全栈开发者 · 技术爱好者"
    quote: "代码如诗，技术如画。"
  stats:                         # 四个统计数字
    - icon: "fas fa-code"
      number: "auto"             # "auto" 自动计算文章数量
      label: "技术文章"
    - icon: "fas fa-project-diagram"
      number: "auto"             # "auto" 自动计算技能数量
      label: "技术技能"
    - icon: "fas fa-calendar-alt"
      number: "8+"
      label: "开发经验"
    - icon: "fas fa-heart"
      number: "∞"
      label: "热爱程度"
  philosophy:
    title: "技术理念"
    items:
      - icon: "fas fa-feather-alt"
        title: "优雅简洁"
        description: "追求代码的简洁性和可维护性"
      - icon: "fas fa-graduation-cap"
        title: "持续学习"
        description: "保持好奇心和学习热情"
      # ... 可添加更多
  contact:
    title: "保持联系"
    subtitle: "有任何问题，欢迎联系我"
    methods:
      - type: "email"
        icon: "fas fa-envelope"
        label: "邮箱"
        value: "you@example.com"
        link: "mailto:you@example.com"
      # ... 更多联系方式
```

#### 图片资源配置 (`assets`)

```yaml
assets:
  avatar:
    url: "/headimg.jpg"
    alt: "头像"
  background:
    desktop:
      url: "https://t.alcy.cc/pc"     # 桌面端背景
    adaptive:
      url: "https://t.alcy.cc/ycy"    # 自适应背景（推荐）
  openGraph:
    default:
      url: "https://t.alcy.cc/og"
      width: 1200
      height: 630
  defaults:
    postCover: "https://t.alcy.cc/ycy" # 文章默认封面
    friendAvatar: "https://t.alcy.cc/tx" # 友链默认头像
    skillIcon: "fas fa-code"
```

#### 社交链接 (`social`)

```yaml
social:
  links:
    - platform: "github"
      url: "https://github.com/yourname"
      icon: "fab fa-github"
      label: "GitHub"
      show: true                     # true=显示, false=隐藏
    - platform: "email"
      url: "mailto:you@example.com"
      icon: "fas fa-envelope"
      label: "邮箱"
      show: true
    - platform: "rss"
      url: "/index.xml"
      icon: "fas fa-rss"
      label: "RSS"
      show: true
```

#### 技能页配置 (`skills`)

```yaml
skills:
  overview:
    categories:
      - icon: "fas fa-code"
        title: "前端开发"
        description: "HTML5、CSS3、JavaScript、React"
        progress: 100                # 进度条百分比
      - icon: "fas fa-server"
        title: "后端开发"
        description: "Node.js、Python、数据库"
        progress: 85
      # ... 更多分类
  skills:                            # 详细技能
    - name: "JavaScript"
      level: 90                      # 熟练度 0-100
      description: "掌握ES6+特性、异步编程、Vue/React框架开发"
      projects:
        - "个人博客"
        - "数据可视化平台"
    # ... 更多技能
  timeline:                          # 技能发展时间线
    - year: "2022"
      title: "基础学习"
      description: "掌握HTML、CSS、JavaScript基础"
    # ... 更多事件
```

#### 友链页配置 (`friends`)

```yaml
friends:
  friends:
    - name: "示例友链"
      url: "https://example.com"
      avatar: "https://t.alcy.cc/tx"
      description: "这是一个示例友链"
      category: "技术博客"
    # ... 更多友链
  apply:
    title: "申请友链"
    conditions:
      - "内容优质，原创技术文章优先"
      - "定期更新，保持活跃"
      - "无不良内容，健康向上"
      - "已添加本站链接"
    siteInfo:
      name: "你的站点名称"
      url: "https://yourdomain.com"
      description: "站点描述"
    contactMethods:
      - icon: "fas fa-envelope"
        label: "发送邮件"
        link: "mailto:you@example.com"
```

#### 工具页配置 (`tools`)

```yaml
tools:
  categories:
    - name: "开发工具"
      icon: "fas fa-code"
      description: "编程开发相关的工具软件"
      tools:
        - name: "Visual Studio Code"
          url: "https://code.visualstudio.com"
          description: "强大的代码编辑器"
          icon: "https://cdn.jsdelivr.net/gh/simple-icons/simple-icons/icons/visualstudiocode.svg"
        - name: "Git"
          url: "https://git-scm.com"
          description: "分布式版本控制系统"
          icon: "https://cdn.jsdelivr.net/gh/simple-icons/simple-icons/icons/git.svg"
    # ... 更多分类
```

#### 404 页面配置 (`error404`)

```yaml
error404:
  page:
    title: "404"
    description: "页面不存在或已被移除"
    message: "抱歉，你访问的页面不存在。可能已被删除或链接有误。"
    icon: "fas fa-ghost"
  buttons:
    home:
      text: "返回首页"
      icon: "fas fa-home"
      url: "/"
    posts:
      text: "浏览文章"
      icon: "fas fa-file-alt"
      url: "/posts/"
```

#### 布局与样式配置 (`layout`)

```yaml
layout:
  posts:
    layout: "grid"              # 布局: grid | list
    columns: 2
    perPage: 12
    excerptLength: 160
    showDate: true
    showCategory: true
    showTags: true
    showExcerpt: true
  skills:
    layout: "grid"
    showCategories: true
    showDetailed: true
    showTimeline: true
    showProjects: true
  links:
    showCategory: true
  sidebar:
    position: "right"
    showTOC: true
    showInfo: true
    showTags: true
  codeblock:
    showLang: true
    showCopy: true
    expandLines: 0
    lineNumbers: false
```

### 国际化 (zh-CN.yaml)

主题提供完整的 ~200 项中文翻译，涵盖导航、按钮、文章元数据、分页、归档、搜索、主题切换、无障碍标签等所有界面文字。

如需自定义翻译，将 `themes/illusion/i18n/zh-CN.yaml` 复制到站点 `i18n/` 目录后修改即可。

主题 JS 模块会自动通过 `window.i18nData` 读取翻译字符串，支持 `{{param}}` 插值语法。

---

### 文章 Front Matter

```bash
# 创建文章
hugo new posts/my-article.md
```

```yaml
---
title: "文章标题"
date: 2026-04-01T12:00:00+08:00
lastmod: 2026-04-15T18:00:00+08:00    # 最后修改时间（可选，用于显示"已更新"）
description: "文章简介，用于摘要和SEO"
tags: ["Hugo", "博客", "教程"]
categories: ["技术"]
cover: "https://example.com/cover.jpg"  # 文章封面图
draft: false                             # true = 草稿, 默认不渲染
toc: true                                # 是否显示文章目录
---
```

---

### 短代码

#### 技能展示

```markdown
{{< skills >}}
```

渲染技能进度条列表。

#### 友链网格

```markdown
{{< links-grid >}}
  {{< link-card avatar="..." name="站点名" desc="描述" url="https://..." >}}
{{< /links-grid >}}
```

在文章内展示友链卡片。

---

## 设计系统

### 色彩

主题定义了两套完整的色彩系统，通过 CSS 自定义属性切换：

**浅色模式 (朦胧幻梦)**：暖桃色 / 杏色系，背景 `#FDF8F5`，文字 `#2E2825`，适合日间阅读。

**深色模式 (夜色幻梦)**：暖深色系，背景 `#0E0A08`，文字 `#EDE0D8`，减少蓝光刺激。

### 粒子系统

| 模式 | 粒子类型 | 描述 |
|------|----------|------|
| 浅色 | 彩带、糖果 (3种)、爱心、星星 | 欢快的糖果雨效果 |
| 深色 | 星光 (3种光谱: 白/暖白/橙)、萤火虫、流星 | 夏夜星空氛围 |

系统自动检测设备性能（`hardwareConcurrency <= 2` 或 `deviceMemory <= 2`）时，粒子数量减半。`prefers-reduced-motion` 用户自动禁用。

### 动画

- **AOS 滚动入场**: 400ms duration, `ease-out-cubic`, 每个元素仅触发一次
- **卡片 3D 效果**: 鼠标位置驱动的透视变换，`requestAnimationFrame` 节流
- **技能条**: IntersectionObserver 驱动，进入视口时从 0% 动画到目标值
- **滚动进度条**: 页面顶部固定，水平缩放映射滚动进度
- **涟漪按钮**: 点击时扩散的 CSS 动画波纹

### 排版

- **正文**: Inter (拉丁) + Noto Sans SC (中文) → 系统字体回退
- **代码**: JetBrains Mono + 等宽字体回退
- **装饰**: ZCOOL QingKe HuangYou (站酷庆科黄油体，可选本地)

---

## 开发与定制

### 覆盖优先级

> **站点文件优先于主题文件。** 同名文件在站点根目录会自动覆盖主题。

| 修改目标 | 推荐方式 |
|----------|----------|
| 页面内容 | 编辑站点 `data/theme.yaml` |
| 样式 | 在站点 `assets/scss/` 添加自定义 SCSS |
| 脚本 | 在站点 `assets/ts/` 添加自定义 TypeScript |
| 模板 | 在站点 `layouts/` 创建同名文件覆盖 |
| 翻译文本 | 站点 `i18n/zh-CN.yaml` |

### 资源编译

主题样式和脚本通过 Hugo 原生资源管道编译：

- **SCSS → CSS**: `layouts/partials/_layout/head/css.html` 使用 `resources.Get` + `toCSS` (Dart Sass)，生产环境自动 minify + fingerprint
- **TS → JS**: `layouts/partials/_layout/head/js.html` 使用 `js.Build`, target ES2015 IIFE, production 环境 minify, development 环境 source map

### 第三方依赖

| 库 | 位置 | 加载方式 |
|----|------|----------|
| AOS | CDN / `static/lib/aos/` | CDN 优先，失败回退本地 |
| Typed.js | CDN / `static/lib/typed.js/` | CDN 优先，失败回退本地 |
| Font Awesome 6 | CDN / `static/lib/fontawesome/` | CDN 优先，JS 检测失败回退本地 |
| 字体 | `static/lib/fonts/fonts.css` | 本地定义，优先系统字体 |

---

## 部署

### 静态托管

构建命令:

```bash
hugo --minify --cleanDestinationDir
```

输出目录: `public/`

部署到任意静态托管服务 (GitHub Pages, Vercel, Netlify, Cloudflare Pages 等)。

### 环境变量

```bash
# 生产环境
HUGO_ENV=production hugo --minify

# 自定义域名
hugo --baseURL "https://example.com" --minify
```

---

## 许可证与致谢

幻梦 (Illusion) 主题基于 **GPL v3.0** 许可证开源。详见 [LICENSE](LICENSE)。

作者: [爱则心痛 (azxt)](https://github.com/aizexintong)

---

*代码是诗，键盘是笔，屏幕是画布，让我们一起书写数字世界的篇章。*
