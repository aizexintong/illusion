# azxt-theme 主题文档

> **版本**: 2.0.0 | **作者**: 爱则心痛 (azxt) | **许可**: MIT | **最低 Hugo**: 0.146.0

---

## 目录

- [简介](#简介)
- [特性](#特性)
- [快速开始](#快速开始)
- [目录结构](#目录结构)
- [站点配置](#站点配置)
- [数据文件系统](#数据文件系统)
- [页面模板](#页面模板)
- [Shortcodes](#shortcodes)
- [CSS 架构](#css-架构)
- [JavaScript 模块](#javascript-模块)
- [自定义与扩展](#自定义与扩展)
- [更新日志](#更新日志)

---

## 简介

azxt-theme 是一个华丽清新的二次元风格 Hugo 博客主题。采用温暖柔和的配色方案，支持暗黑模式、响应式设计和丰富的动画效果（樱花飘落、萤火虫漂浮、星星闪烁）。主题数据驱动，关于页、技能页、友链页的内容均可通过 YAML 数据文件自定义。

---

## 特性

| 分类 | 特性 |
|------|------|
| **视觉效果** | 樱花飘落、星星闪烁、光点漂浮、萤火虫动画、粒子背景 |
| **暗黑模式** | 自动跟随系统主题，支持手动切换 |
| **响应式设计** | 移动端优先，适配手机、平板、桌面 |
| **可访问性** | ARIA 标签、键盘导航、屏幕阅读器支持 |
| **SEO** | Open Graph、Twitter Cards、结构化数据 (Schema.org) |
| **数据驱动** | 关于、技能、友链内容通过 YAML 配置 |
| **代码高亮** | 内置代码块样式，支持行号显示 |
| **文章功能** | 阅读时间、字数统计、标签分类、上下篇导航 |
| **评论系统** | 支持 Disqus / Utterances / Giscus |
| **搜索功能** | 内置本地搜索 |
| **Shortcodes** | link-card、links-grid、skills 内嵌组件 |

---

## 快速开始

### 1. 安装主题

```bash
cd themes
git clone https://github.com/aizexintong/azxt-theme.git
```

或作为 Git 子模块：

```bash
git submodule add https://github.com/aizexintong/azxt-theme.git themes/azxt-theme
```

### 2. 站点配置

在站点根目录 `hugo.toml` 中：

```toml
theme = "azxt-theme"
```

### 3. 创建内容

```bash
hugo new posts/my-first-post.md
hugo new about.md
```

### 4. 启动开发服务器

```bash
hugo server -D
```

---

## 目录结构

```
azxt-theme/
├── archetypes/
│   └── default.md                  # 默认文章模板
├── assets/
│   ├── css/
│   │   ├── main.css                # CSS 入口 (导入所有模块)
│   │   ├── modules/
│   │   │   ├── variables.css       # CSS 变量与设计令牌
│   │   │   ├── base.css            # 基础重置与全局样式
│   │   │   ├── layout.css          # 布局 (header/footer/container)
│   │   │   ├── components.css      # 组件 (card/btn/form)
│   │   │   ├── pages.css           # 页面通用样式
│   │   │   ├── effects.css         # 动画与装饰效果
│   │   │   └── darkmode.css        # 深色模式样式
│   │   └── pages/
│   │       ├── about.css           # 关于页专用样式
│   │       ├── skills.css          # 技能页专用样式
│   │       └── links.css           # 友链页专用样式
│   └── js/
│       ├── main.js                 # JS 入口
│       └── modules/
│           ├── theme.js            # 主题切换管理
│           ├── animations.js       # 动画效果 (AOS/技能条)
│           ├── interactions.js     # 交互 (菜单/搜索/滚动)
│           └── enhancements.js     # Markdown 渲染增强
├── data/
│   ├── about.yaml                  # 关于页默认数据
│   ├── friends.yaml                # 友链页默认数据
│   └── skills.yaml                 # 技能页默认数据
├── layouts/
│   ├── _default/
│   │   └── single.html             # 文章详情页
│   ├── _partials/
│   │   ├── baseof.html             # 基础模板骨架
│   │   ├── footer.html             # 页脚
│   │   ├── header.html             # 页头 (含移动端菜单)
│   │   ├── menu.html               # 导航菜单
│   │   ├── search-modal.html       # 搜索弹窗
│   │   ├── terms.html              # 分类法列表
│   │   ├── data-helper.html        # 数据文件优先级说明
│   │   └── head/
│   │       ├── html                # <head> 元信息
│   │       ├── css.html            # CSS 资源加载
│   │       ├── js.html             # JS 资源加载
│   │       └── schema.html         # 结构化数据
│   ├── partials/
│   │   ├── comments.html           # 评论系统
│   │   └── search.html             # 搜索组件
│   ├── shortcodes/
│   │   ├── link-card.html          # 友链卡片
│   │   ├── links-grid.html         # 友链网格容器
│   │   └── skills.html             # 内嵌技能展示
│   ├── about.html                  # 关于页
│   ├── baseof.html                 # 全局骨架
│   ├── home.html                   # 首页
│   ├── links.html                  # 友链页
│   ├── section.html                # 文章列表 (分页+侧栏)
│   ├── skills.html                 # 技能页
│   ├── taxonomy.html               # 标签云页
│   └── term.html                   # 单标签文章列表
├── static/
│   └── favicon.ico                 # 网站图标
├── hugo.toml                       # 主题默认配置
├── LICENSE                         # MIT 许可证
├── README.md                       # 简介文档
└── THEME.md                        # 本文档 (完整参考)
```

---

## 站点配置

### 完整配置参考

```toml
baseURL = "https://example.com/"
languageCode = "zh-CN"
title = "我的博客"
theme = "azxt-theme"

[params]
  author = "作者名"
  description = "博客描述"
  email = "your@email.com"
  github = "your-github"
  domain = "example.com"

  # 颜色系统
  primaryColor = "#8a4b5a"
  primaryLight = "#b27a87"
  primaryDark = "#6a3b45"
  secondaryColor = "#7a6a5f"
  accentColor = "#5b7e91"
  backgroundColor = "#fdfaf8"
  surfaceColor = "#ffffff"
  textColor = "#2e2b28"
  textLight = "#7a726c"
  neutralColor = "#e8e4e0"

  # 图片配置
  avatarImage = "https://example.com/avatar.jpg"
  adaptiveImage = "https://example.com/bg.jpg"
  horizontalImage = "https://example.com/h.jpg"
  verticalImage = "https://example.com/v.jpg"

  # 功能开关
  enableParticles = true       # 粒子背景
  enable3DEffects = true       # 3D 卡片效果
  enableScrollAnimations = true # 滚动动画
  enableTypewriter = true      # 打字机效果
  enableDarkMode = true        # 暗黑模式
  enableAccessibility = true   # 可访问性增强
  enableSearch = true          # 搜索
  enableTOC = false            # 文章目录

  # 布局
  heroLayout = "centered"      # centered | left | right
  postsLayout = "grid"         # grid | list | masonry
  skillsLayout = "grid"        # grid | list | radial
  footerLayout = "columns"     # columns | simple | social

  # 技能 (首页展示用，技能页优先读 data/skills.yaml)
  skills = [
    { name = "JavaScript", level = 90 },
    { name = "Python", level = 85 },
  ]

  # 社交链接
  socialLinks = [
    { platform = "github", url = "https://github.com/xxx", icon = "fab fa-github" },
    { platform = "email", url = "mailto:xxx@xx.com", icon = "fas fa-envelope" },
  ]

  # 评论系统
  enableComments = false
  commentsProvider = "disqus"  # disqus | utterances | giscus
  disqusShortname = ""
  utterancesRepo = ""
  giscusRepo = ""

  # SEO
  enableSchema = true
  enableOpenGraph = true
  enableTwitterCards = true

  # 性能
  lazyLoadImages = true
  optimizeCSS = true
  optimizeJS = true

# 菜单
[menus]
  [[menus.main]]
    name = "主页"
    pageRef = "/"
    weight = 5
  [[menus.main]]
    name = "文章"
    pageRef = "/posts"
    weight = 10
  [[menus.main]]
    name = "标签"
    pageRef = "/tags"
    weight = 20
  [[menus.main]]
    name = "关于"
    pageRef = "/about"
    weight = 30
  [[menus.main]]
    name = "技能"
    url = "/skills/"
    weight = 40
  [[menus.main]]
    name = "友链"
    url = "/links/"
    weight = 50

[module]
  [module.hugoVersion]
    extended = false
    min = "0.146.0"
```

### 页面 Front Matter

文章页面推荐 Front Matter：

```yaml
---
title: "文章标题"
date: 2026-03-26
draft: false
description: "文章简介，用于 SEO 和列表摘要"
image: "https://example.com/cover.jpg"
categories: ["技术"]
tags: ["Hugo", "前端", "CSS"]
---
```

---

## 数据文件系统

### 数据优先级

主题使用 Hugo 数据级联机制：

```
站点根目录 data/  >  themes/azxt-theme/data/
```

- 如果站点根目录 `data/` 下存在同名数据文件，则**优先使用根目录版本**
- 如果根目录不存在对应文件，则**回退到主题默认数据**
- 所有模板已内置 `default` 回退值，即使数据文件缺失页面仍可正常渲染

### 快速自定义数据

1. 将主题默认数据文件复制到站点根目录：

```bash
cp themes/azxt-theme/data/about.yaml data/about.yaml
cp themes/azxt-theme/data/skills.yaml data/skills.yaml
cp themes/azxt-theme/data/friends.yaml data/friends.yaml
```

2. 编辑根目录下的数据文件

3. 重新构建站点：`hugo`

### about.yaml - 关于页数据

```yaml
intro:
  name: "你的名字"
  title: "你的头衔"
  quote: "你的座右铭"

stats:
  - icon: "fas fa-code"
    number: "auto"          # "auto" 自动统计文章数
    label: "技术文章"
  - icon: "fas fa-project-diagram"
    number: "auto"          # "auto" 自动统计技能数
    label: "技术技能"
  - icon: "fas fa-calendar-alt"
    number: "5+"
    label: "开发经验"
  - icon: "fas fa-heart"
    number: "∞"
    label: "热爱程度"

philosophy:
  title: "技术理念"
  items:
    - icon: "fas fa-feather-alt"
      title: "优雅简洁"
      description: "你的理念描述"

contact:
  title: "保持联系"
  subtitle: "副标题"
  methods:
    - type: "email"
      icon: "fas fa-envelope"
      label: "邮箱"
      value: "your@email.com"
      link: "mailto:your@email.com"
    - type: "github"
      icon: "fab fa-github"
      label: "GitHub"
      value: "username"
      link: "https://github.com/username"
  note: "尾部备注"
```

### skills.yaml - 技能页数据

```yaml
overview:
  title: "技能总览"
  subtitle: "副标题"
  categories:
    - icon: "fas fa-code"
      title: "前端开发"
      description: "HTML5、CSS3、JavaScript"
      progress: 90

skills:
  - name: "JavaScript"
    level: 90
    description: "掌握 ES6+ 特性..."
    projects:
      - "项目名1"
      - "项目名2"

timeline:
  - year: "2024"
    title: "全栈发展"
    description: "学习后端开发..."
```

> **注意**: `skills` 列表在技能页优先使用 `data/skills.yaml` 中的定义。如果数据文件中没有 `skills` 键，则回退到 `hugo.toml` 中的 `params.skills`。

### friends.yaml - 友链页数据

```yaml
page:
  title: "我的朋友们"
  subtitle: "副标题"

friends:
  - name: "博客名称"
    url: "https://example.com"
    avatar: "https://avatar-url"
    description: "博客简介"
    category: "技术博客"

apply:
  title: "申请友链"
  conditions:
    - "条件1"
    - "条件2"
  siteInfo:
    name: "站点名"
    url: "https://example.com"
    description: "站点描述"
  contactTitle: "联系方式"
  contactDescription: "联系说明"
  contactMethods:
    - icon: "fas fa-envelope"
      label: "发送邮件"
      link: "mailto:admin@example.com"
```

---

## 页面模板

### 首页 (home.html)

- 英雄区域：打字机效果展示标语，CTA 按钮跳转文章/关于
- 最新文章：展示最近 6 篇文章（卡片式），超过 6 篇显示"查看所有文章"
- 关于简介：文章数/标签数/技能数统计
- 技能展示：基于 `params.skills` 的进度条

### 文章列表 (section.html)

- 左右分栏布局：左侧文章列表，右侧边栏
- 交替布局：奇偶文章卡片图文位置交替
- 分页导航：每页 10 篇
- 侧栏组件：日历、最新文章、标签云

### 文章详情 (single.html)

- 封面大图：有 `image` 时显示 hero 封面
- 文章元信息：日期、阅读时间、字数
- 侧栏：文章信息、标签列表、目录（需 `enableTOC = true`）
- 上下篇导航
- 评论区（需开启评论系统）

### 关于页 (about.html)

读取 `data/about.yaml`，展示个人简介、数据统计、技术理念、联系方式。

### 技能页 (skills.html)

读取 `data/skills.yaml`，展示技能分类总览、详细技能列表（含项目）、发展历程时间线。

### 友链页 (links.html)

读取 `data/friends.yaml`，展示友链列表、申请友链说明、联系方式。

### 标签页 (taxonomy.html / term.html)

- `taxonomy.html`：标签云，显示所有标签及文章数
- `term.html`：单标签下文章列表，支持分页

---

## Shortcodes

### link-card - 友链卡片

在 Markdown 内容中嵌入单个友链卡片：

```markdown
{{</* link-card
  name="博客名"
  url="https://example.com"
  avatar="https://avatar-url"
  desc="博客简介" */>}}
```

### links-grid - 友链网格

包裹多个 link-card 形成网格布局：

```markdown
{{</* links-grid */>}}
  {{</* link-card name="A" url="https://a.com" avatar="..." desc="..." */>}}
  {{</* link-card name="B" url="https://b.com" avatar="..." desc="..." */>}}
{{</* /links-grid */>}}
```

### skills - 内嵌技能展示

在文章中展示技能列表：

```markdown
{{</* skills */>}}
```

读取 `params.skills` 配置，生成带进度条的技能展示。

---

## CSS 架构

### 设计令牌 (variables.css)

所有设计值通过 CSS 变量定义，方便全局主题定制：

```css
:root {
  --space-sm: 0.5rem;       /* 8px */
  --space-md: 1rem;         /* 16px */
  --space-lg: 1.5rem;       /* 24px */
  --text-base: 1rem;        /* 16px */
  --primary: #8a4b5a;       /* 主色 */
  --primary-light: #b27a87;
  --primary-dark: #6a3b45;
  --bg: #fdfaf8;
  --surface: #ffffff;
  --text: #2e2b28;
  --text-light: #7a726c;
}
```

### 模块说明

| 文件 | 职责 |
|------|------|
| `variables.css` | CSS 变量、设计令牌 |
| `base.css` | 重置样式、排版基础、全局元素 |
| `layout.css` | Header、Footer、Container 布局 |
| `components.css` | Card、Button、Form 等可复用组件 |
| `pages.css` | 页面通用样式 |
| `effects.css` | 樱花、星星、萤火虫、光点等装饰动画 |
| `darkmode.css` | `prefers-color-scheme: dark` 深色适配 |

### 响应式断点

移动端优先设计：

```css
/* 默认: 移动端 (<768px) */
.container { padding: 0 1rem; }

/* 平板: 768px+ */
@media (min-width: 768px) {
  .container { padding: 0 2rem; }
}

/* 桌面: 1024px+ */
@media (min-width: 1024px) {
  .container { padding: 0 3rem; }
}
```

---

## JavaScript 模块

### ThemeManager (theme.js)

管理主题切换（亮色/暗色模式）：

```javascript
// 切换主题
ThemeManager.toggleTheme();

// 获取当前主题
const theme = ThemeManager.currentTheme; // "light" | "dark"
```

### AnimationManager (animations.js)

管理滚动动画和技能条动画：

```javascript
// 初始化 AOS 滚动动画
AnimationManager.initAOS();

// 初始化技能进度条动画
AnimationManager.initSkillBars();
```

### InteractionManager (interactions.js)

管理用户交互：

```javascript
// 初始化移动端菜单
InteractionManager.initMobileMenu();

// 初始化搜索功能
InteractionManager.initSearch();

// 初始化回到顶部
InteractionManager.initBackToTop();
```

### EnhancementManager (enhancements.js)

Markdown 渲染增强：

```javascript
// 初始化代码块增强 (复制按钮、语言标签)
EnhancementManager.initCodeBlocks();

// 初始化图片懒加载
EnhancementManager.initLazyLoad();
```

---

## 自定义与扩展

### 修改配色

编辑 `assets/css/modules/variables.css` 中的 CSS 变量，或在 `hugo.toml` 的 `[params]` 中配置颜色参数。

### 添加新页面

1. 创建布局模板：`layouts/newpage.html`（继承 `baseof.html`）
2. 创建内容文件：`content/newpage.md`
3. 添加菜单项到 `hugo.toml`

布局模板基本结构：

```html
{{ define "main" }}
<div class="container">
  <section class="page-header">
    <h1>{{ .Title }}</h1>
  </section>
  <div class="markdown-content">
    {{ .Content }}
  </div>
</div>
{{ end }}
```

### 禁用装饰效果

在 `hugo.toml` 中：

```toml
[params]
  enableParticles = false
  enable3DEffects = false
  enableScrollAnimations = false
  enableTypewriter = false
```

或在 `layouts/baseof.html` 中移除对应的 JS 函数调用。

### 添加评论系统

在 `hugo.toml` 中启用：

```toml
[params]
  enableComments = true
  commentsProvider = "giscus"
  giscusRepo = "user/repo"
```

### 文章 Front Matter 完整参考

```yaml
---
title: "文章标题"            # 必填
date: 2026-03-26T10:00:00+08:00  # 必填
draft: false                 # 草稿标记
lastmod: 2026-03-27          # 最后修改日期
description: "文章摘要"      # SEO 描述
image: "https://cover.jpg"   # 封面图
categories: ["技术"]         # 分类
tags: ["Hugo", "CSS"]        # 标签
---
```

---

## 更新日志

### v2.0.0

- 重构 CSS 架构，模块化组织（7 个模块文件）
- 重构 JS 架构，ES 模块化（4 个模块文件）
- 移动端优先响应式设计
- 数据文件驱动内容配置（about/skills/friends）
- 移除内联样式和脚本
- 新增暗黑模式自动跟随系统
- 新增 AOS 滚动动画
- 新增樱花/星星/萤火虫装饰效果
- 新增 Shortcodes（link-card / links-grid / skills）
- 新增评论系统支持（Disqus / Utterances / Giscus）
- 新增本地搜索功能
- 优化可访问性（ARIA 标签、语义化 HTML）
- 优化 SEO（Open Graph、Twitter Cards、Schema.org）
- 支持数据文件优先级：根目录 `data/` 优先于主题 `data/`

---

## 许可证

MIT License - 详见 [LICENSE](LICENSE) 文件。
