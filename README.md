# 爱则心痛 | azxt

> 基于 Hugo + 幻梦 (Illusion) 主题构建的个人博客网站

[![Hugo](https://img.shields.io/badge/Hugo-%3E%3D0.146.0-FF4088?logo=hugo)](https://gohugo.io)
[![License](https://img.shields.io/badge/License-GPLv3-blue.svg)](LICENSE)

---

## 目录

- [项目简介](#项目简介)
- [功能特性](#功能特性)
- [快速开始](#快速开始)
- [目录结构](#目录结构)
- [配置详解](#配置详解)
  - [站点配置 (hugo.toml)](#站点配置-hugotoml)
  - [数据文件配置](#数据文件配置)
    - [首页配置 (home.yaml)](#首页配置-homeyaml)
    - [关于页配置 (about.yaml)](#关于页配置-aboutyaml)
    - [技能页配置 (skills.yaml)](#技能页配置-skillsyaml)
    - [友链页配置 (friends.yaml)](#友链页配置-friendsyaml)
    - [工具页配置 (tools.yaml)](#工具页配置-toolsyaml)
    - [社交链接配置 (social.yaml)](#社交链接配置-socialyaml)
    - [图片资源配置 (assets.yaml)](#图片资源配置-assetsyaml)
    - [布局配置 (layout.yaml)](#布局配置-layoutyaml)
    - [404页面配置 (404.yaml)](#404页面配置-404yaml)
  - [文章 Front Matter](#文章-front-matter)
  - [Shortcodes](#shortcodes)
- [开发指南](#开发指南)
- [部署](#部署)
- [许可证](#许可证)

---

## 项目简介

这是一个使用 **Hugo** 静态站点生成器构建的个人博客，采用自主研发的 **幻梦 (Illusion)** 主题。主题提供了完整的双主题（浅色/深色）切换、Canvas 粒子特效、玻璃态 UI、打字机效果、本地搜索、SEO 优化等功能。

**在线演示**: [https://azxt.org](https://azxt.org)

---

## 功能特性

| 功能 | 说明 |
|------|------|
| 🌓 双主题系统 | 浅色/深色/跟随系统三种模式，自动切换粒子背景 |
| ✨ Canvas 粒子特效 | 白天糖果雨，夜间星空萤火虫，自动检测低性能设备 |
| 🔍 本地搜索 | 全客户端搜索（Ctrl+K 快捷键），无需后端 |
| 🪟 玻璃态 UI | 毛玻璃效果卡片，`backdrop-filter` 实现 |
| ⌨️ 打字机效果 | 首页副标题 Typed.js 轮播 |
| 🎯 SEO 优化 | Open Graph / Twitter Cards / Schema.org 结构化数据 |
| 📱 响应式设计 | 完美适配桌面端和移动端 |
| 📝 国际化 | 完整的 zh-CN 中文翻译（414行） |
| 📦 数据驱动 | 首页、关于、技能、友链、工具等页面全部由 YAML 数据驱动 |
| 🎨 滚动动画 | AOS 滚动触发动画，卡片 3D 悬停效果 |
| 💻 代码高亮 | Chroma 语法高亮 + 语言标签 + 一键复制 |
| 🖼️ 图片灯箱 | 点击图片放大查看 |
| 📄 归档页面 | 文章时间线归档 |
| 🏷️ 标签/分类 | Hugo 标准分类法 |
| 📡 RSS 订阅 | 自动生成 RSS / JSON Feed |

---

## 快速开始

### 环境要求

- **Hugo** ≥ v0.146.0 (extended 版本)
- Git

### 本地运行

```bash
# 克隆项目
git clone <你的仓库地址>
cd azxt

# 启动开发服务器
hugo server

# 自定义端口
hugo server --port 1313 --bind 0.0.0.0
```

访问 `http://localhost:1313` 查看效果。

### 生产构建

```bash
# 构建静态文件到 public/ 目录
hugo

# 清理构建
hugo --cleanDestinationDir
```

---

## 目录结构

```
azxt/
├── archetypes/          # 文章模板
│   └── default.md
├── assets/              # 站点级资源（覆盖主题资源）
├── content/             # 文章内容（Markdown）
│   └── posts/
├── data/                # 站点级数据文件（覆盖主题 data/）
├── i18n/                # 站点级翻译（覆盖主题 i18n/）
├── static/              # 静态文件（覆盖主题 static/）
├── layouts/             # 站点级模板（覆盖主题 layouts/）
├── hugo.toml            # ★ 站点主配置文件
├── public/              # 构建输出目录
└── themes/
    └── illusion/        # ★ 幻梦主题
        ├── archetypes/
        ├── assets/
        │   ├── css/     # 12个CSS模块文件
        │   └── js/
        │       └── main.js
        ├── content/     # 主题示例内容
        ├── data/        # 主题默认数据文件（9个YAML）
        ├── i18n/        # 主题翻译（zh-CN.yaml）
        ├── layouts/     # 主题模板
        │   ├── _default/
        │   ├── partials/
        │   └── shortcodes/
        ├── static/      # 主题静态资源
        │   └── lib/     # 第三方库（AOS, Typed.js, FontAwesome）
        ├── hugo.toml    # 主题配置
        └── LICENSE      # GPL v3
```

> **优先级规则**: 站点根目录的文件会覆盖主题中同名文件。例如 `data/about.yaml` 在根目录存在时，会替代 `themes/illusion/data/about.yaml`。

---

## 配置详解

### 站点配置 (hugo.toml)

```toml
# ========== 基础信息 ==========
baseURL = 'https://azxt.org/'           # 网站域名
locale = 'zh-CN'                        # 语言代码
languageName = '中文'                    # 语言名称
title = '爱则心痛 | azxt'               # 站点标题
theme = 'illusion'                       # 使用的主题
defaultContentLanguage = 'zh'            # 默认语言
defaultContentLanguageInSubdir = false   # 不在URL中包含语言子目录

# ========== 站点参数 ==========
[params]
  author = "爱则心痛"                                           # 作者名
  description = "爱则心痛的个人博客 - 分享技术、生活和思考"      # 站点描述
  email = "admin@azxt.org"                                      # 邮箱
  github = "aizexintong"                                        # GitHub用户名
  domain = "azxt.org"                                           # 域名

  # 功能开关
  enableDarkMode = true              # 深色模式
  enableSearch = true                # 本地搜索
  searchProvider = "local"           # 搜索提供方（仅支持 local）
  enableParticles = true             # 粒子背景动画
  enable3DEffects = true             # 3D 卡片效果
  enableScrollAnimations = true      # 滚动动画（AOS）
  enableTypewriter = true            # 打字机效果
  enableAccessibility = true         # 无障碍支持
  enableTOC = true                   # 文章目录
  enableComments = false             # 评论系统（暂未启用）
  lazyLoadImages = true              # 图片懒加载

  # SEO
  enableSchema = true                # Schema.org 结构化数据
  enableOpenGraph = true             # Open Graph 标签
  enableTwitterCards = true          # Twitter Cards

  siteTime = "2026-04-01T00:00:00+08:00"  # 网站运行起始时间（用于页脚计时）

# ========== 代码高亮 ==========
[markup]
  [markup.highlight]
    codeFences = true                # 启用代码块
    guessSyntax = true               # 自动检测语言
    noClasses = false                # 使用CSS类名
    tabWidth = 2                     # Tab宽度
    lineNos = false                  # 行号

# ========== 导航菜单 ==========
[menus]
  [[menus.main]]
    name = '主页'
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

  [[menus.main]]
    name = '归档'
    url = '/archives/'
    weight = 15
    [menus.main.params]
      icon = 'fas fa-archive'

  [[menus.main]]
    name = '标签'
    pageRef = '/tags/'
    weight = 20
    [menus.main.params]
      icon = 'fas fa-tags'

  [[menus.main]]
    name = '关于'
    pageRef = '/about'
    weight = 30
    [menus.main.params]
      icon = 'fas fa-user'

  [[menus.main]]
    name = '技能'
    url = '/skills/'
    weight = 40
    [menus.main.params]
      icon = 'fas fa-code'

  [[menus.main]]
    name = '友链'
    url = '/links/'
    weight = 50
    [menus.main.params]
      icon = 'fas fa-link'

  [[menus.main]]
    name = '工具'
    url = '/tools/'
    weight = 60
    [menus.main.params]
      icon = 'fas fa-tools'

  [[menus.footer]]
    name = '隐私政策'
    url = '/privacy/'
    weight = 10
    [menus.footer.params]
      icon = 'fas fa-shield-alt'

  [[menus.footer]]
    name = '使用条款'
    url = '/terms/'
    weight = 20
    [menus.footer.params]
      icon = 'fas fa-file-contract'

# ========== 输出格式 ==========
[outputs]
  home = ["HTML", "JSON", "RSS"]     # 首页输出HTML + JSON索引 + RSS
  page = ["HTML"]                     # 页面输出HTML

# ========== 站点地图 ==========
[sitemap]
  changefreq = "weekly"
  filename = "sitemap.xml"
  priority = 0.5
```

---

### 数据文件配置

> 所有数据文件支持在站点根目录 `data/` 下创建同名文件来覆盖主题默认值。

#### 首页配置 (home.yaml)

```yaml
# 英雄区域
hero:
  title: "爱则心痛"                    # 大标题
  subtitles:                           # 打字机轮播文本
    - "技术开发者"
    - "代码艺术家"
    - "终身学习者"
    - "梦想追逐者"
  description: "欢迎来到我的个人空间，这里记录着我的技术探索、生活感悟和成长历程。"
  primaryBtn:                          # 主按钮
    text: "阅读文章"
    url: "/posts"
  secondaryBtn:                        # 次按钮
    text: "关于我们"
    url: "/about"
  badgeText: "欢迎来到我的世界"
  greeting: "你好，我是"
  quote:                               # 名言引用
    text: "代码是诗，键盘是笔，屏幕是画布，让我们一起书写数字世界的篇章。"
    author: "爱则心痛"

# 文章区域
posts:
  title: "最新文章"
  subtitle: "分享思考，记录成长"
  count: 6                            # 显示文章数量
  showMore:
    text: "查看所有文章"
    url: "/posts"

# 关于区域
about:
  title: "关于爱则心痛"
  description: "一名热爱技术的开发者..."
  btnText: "了解更多"
  btnUrl: "/about"

# 技能区域
skills:
  title: "技术栈"
  subtitle: "不断学习，持续进步"
  count: 6                            # 显示技能数量
```

#### 关于页配置 (about.yaml)

```yaml
intro:
  name: "爱则心痛 (azxt)"
  title: "全栈开发者 · 技术爱好者 · 开源贡献者"
  quote: "代码如诗，技术如画。在0和1的世界里，创造无限可能。"

stats:                                 # 数据统计
  - icon: "fas fa-code"
    number: "auto"                     # "auto" 自动计算文章数
    label: "技术文章"
  - icon: "fas fa-project-diagram"
    number: "auto"
    label: "技术技能"
  - icon: "fas fa-calendar-alt"
    number: "8+"
    label: "开发经验"
  - icon: "fas fa-heart"
    number: "∞"
    label: "热爱程度"

philosophy:                            # 技术理念
  title: "技术理念"
  items:
    - icon: "fas fa-feather-alt"
      title: "优雅简洁"
      description: "追求代码的简洁性和可维护性..."
    - icon: "fas fa-graduation-cap"
      title: "持续学习"
      description: "技术日新月异，保持好奇心..."
    - icon: "fas fa-share-alt"
      title: "分享共赢"
      description: "知识因分享而更有价值..."
    - icon: "fas fa-user-check"
      title: "用户体验"
      description: "技术服务于人..."

contact:                               # 联系方式
  title: "保持联系"
  subtitle: "如果你对我的工作感兴趣..."
  methods:
    - type: "email"
      icon: "fas fa-envelope"
      label: "邮箱"
      value: "admin@azxt.org"
      link: "mailto:admin@azxt.org"
    - type: "github"
      icon: "fab fa-github"
      label: "GitHub"
      value: "aizexintong"
      link: "https://github.com/aizexintong"
    - type: "website"
      icon: "fas fa-globe"
      label: "网站"
      value: "azxt.org"
      link: "https://azxt.org"
  note: "欢迎交流技术问题、项目合作或开源贡献！"
```

#### 技能页配置 (skills.yaml)

```yaml
overview:
  title: "技能总览"
  subtitle: "掌握多项技术，持续学习进步"
  categories:
    - icon: "fas fa-code"
      title: "前端开发"
      description: "HTML5、CSS3、JavaScript、React"
      progress: 90                      # 进度条百分比

skills:                                  # 详细技能
  - name: "JavaScript"
    level: 90                            # 熟练度 0-100
    description: "掌握ES6+特性、异步编程..."
    projects:                            # 关联项目
      - "个人博客系统"
      - "数据可视化平台"
  - name: "Python"
    level: 90
    description: "熟悉Django、Flask框架..."
    projects:
      - "自动化脚本工具"
      - "Web爬虫系统"

timeline:                                # 技能发展时间线
  - year: "2022"
    title: "基础学习"
    description: "掌握HTML、CSS、JavaScript基础..."
  - year: "2023"
    title: "框架掌握"
    description: "学习Vue.js和React框架..."
```

#### 友链页配置 (friends.yaml)

```yaml
page:
  title: "我的朋友们"
  subtitle: "与志同道合的朋友们互相链接"

friends:                                 # 友链列表
  - name: "示例友链"
    url: "https://example.com"
    avatar: "https://t.alcy.cc/tx"
    description: "这是一个示例友链的描述"
    category: "技术博客"

apply:                                   # 申请友链配置
  title: "申请友链"
  conditions:
    - "内容优质，原创技术文章优先"
    - "定期更新，保持活跃"
    - "无不良内容，健康向上"
    - "已添加本站链接"
  siteInfo:
    name: "爱则心痛 (azxt)"
    url: "https://azxt.org"
    description: "爱则心痛的个人博客..."
  contactTitle: "联系方式"
  contactMethods:
    - icon: "fas fa-envelope"
      label: "发送邮件"
      link: "mailto:admin@azxt.org"
    - icon: "fab fa-github"
      label: "GitHub Issues"
      link: "https://github.com/aizexintong/azxt-blog/issues"
```

#### 工具页配置 (tools.yaml)

```yaml
page:
  title: "我的工具"
  subtitle: "日常使用的效率工具集合"
  enable: true

categories:                              # 工具分类
  - name: "开发工具"
    icon: "fas fa-code"
    description: "编程开发相关的工具软件"
    tools:
      - name: "Visual Studio Code"
        url: "https://code.visualstudio.com"
        description: "强大的代码编辑器"
        icon: "https://cdn.jsdelivr.net/gh/simple-icons/simple-icons/icons/visualstudiocode.svg"
        color: "#007ACC"
      - name: "Git"
        url: "https://git-scm.com"
        description: "分布式版本控制系统"
        icon: "https://cdn.jsdelivr.net/gh/simple-icons/simple-icons/icons/git.svg"
        color: "#F05032"
```

#### 社交链接配置 (social.yaml)

```yaml
links:
  - platform: "github"
    url: "https://github.com/aizexintong"
    icon: "fab fa-github"
    label: "GitHub"
    show: true                          # 设为 false 隐藏
  - platform: "email"
    url: "mailto:admin@azxt.org"
    icon: "fas fa-envelope"
    label: "邮箱"
    show: true
  - platform: "rss"
    url: "/index.xml"
    icon: "fas fa-rss"
    label: "RSS 订阅"
    show: true

footer:
  icp: ""                               # ICP备案号
  police: ""                            # 公安备案号
  year: ""                              # 版权年份（留空自动获取）
  since: "2024"                         # 网站成立年份
```

#### 图片资源配置 (assets.yaml)

```yaml
avatar:
  url: "https://t.alcy.cc/tx"          # 站点头像
  alt: "站点头像"
  rss: "https://t.alcy.cc/tx"          # RSS头像

background:
  desktop:
    url: "https://t.alcy.cc/pc"        # 桌面端背景
    alt: "桌面端背景"
  adaptive:
    url: "https://t.alcy.cc/ycy"       # 自适应背景（推荐）
    alt: "自适应背景"
    breakpoint: "768px"

openGraph:
  default:
    url: "https://t.alcy.cc/og"        # 默认OG分享图
    width: 1200
    height: 630
  article:
    fallback: "https://t.alcy.cc/ycy"  # 文章备用OG图

defaults:
  postCover: "https://t.alcy.cc/ycy"   # 文章默认封面
  friendAvatar: "https://t.alcy.cc/tx" # 友链默认头像
  skillIcon: "fas fa-code"             # 技能默认图标

imageService:
  cdn: "https://t.alcy.cc"             # 图片CDN域名
  lazyLoad: true                       # 懒加载
  responsive: false                    # 响应式图片
```

#### 布局配置 (layout.yaml)

```yaml
hero:
  layout: "centered"                   # centered | left | right
  showAvatar: true
  showTitle: true
  showSubtitle: true
  typewriter: true

posts:
  layout: "grid"                       # grid | list | masonry
  columns: 2                           # grid模式列数
  perPage: 12                          # 每页文章数
  showDate: true
  showCategory: true
  showTags: true
  showExcerpt: true
  excerptLength: 160

skills:
  layout: "grid"                       # grid | list | radial
  showCategories: true
  showDetailed: true
  showTimeline: true
  showProjects: true

links:
  showApply: true                      # 显示申请友链区
  showCategory: true

footer:
  layout: "columns"                    # columns | simple | social
  showCopyright: true
  showPoweredBy: true                  # "由 Hugo + Illusion 驱动"
  showSocial: true
  showQuickLinks: true

sidebar:
  enable: true
  position: "right"                    # right | left
  showTOC: true                        # 文章目录
  showInfo: true
  showTags: true

codeblock:
  showLang: true                       # 语言标签
  showCopy: true                       # 复制按钮
  expandLines: 0                       # 默认展开行数
  lineNumbers: false

animations:
  scroll: true                         # 滚动动画
  particles: true                      # 粒子背景
  typewriter: true                     # 打字机
  card3D: true                         # 3D卡片效果

seo:
  schema: true
  openGraph: true
  twitterCards: true
  baiduVerification: ""                # 百度验证码
  googleVerification: ""               # Google验证码
```

#### 404页面配置 (404.yaml)

```yaml
title: "404 - 页面未找到"               # 页面标题
code: "404"
message: "你访问的页面不存在或已被移除"
button:
  text: "返回首页"
  url: "/"
```

---

### 文章 Front Matter

创建文章使用以下命令：

```bash
hugo new posts/my-article-title.md
```

文章 Front Matter 配置：

```yaml
---
title: "文章标题"
date: 2026-04-01T12:00:00+08:00
description: "文章描述"
tags: ["Hugo", "博客", "教程"]
categories: ["技术"]
cover: "/images/cover.jpg"              # 文章封面图
draft: false                            # true 为草稿
toc: true                               # 是否显示目录
---

文章正文内容...
```

---

### Shortcodes

主题提供以下短代码用于丰富文章内容：

#### 链接卡片

```markdown
{{< link-card title="链接标题" url="https://example.com" description="链接描述" >}}
```

#### 技能展示

```markdown
{{< skills >}}
```

#### 友链网格

```markdown
{{< links-grid >}}
```

---

## 开发指南

### 主题定制

如果需要修改主题样式或布局，建议通过以下方式进行避免直接修改主题文件：

| 修改目标 | 推荐方式 |
|----------|----------|
| 数据内容 | 在站点根目录 `data/` 下创建同名 YAML 文件覆盖 |
| 样式 | 在站点根目录 `assets/css/` 下添加自定义 CSS |
| 脚本 | 在站点根目录 `assets/js/` 下添加自定义 JS |
| 模板 | 在站点根目录 `layouts/` 下创建同名模板文件覆盖 |
| 翻译 | 在站点根目录 `i18n/` 下创建同名文件覆盖 |

### 第三方依赖

主题内已内置以下库（位于 `themes/illusion/static/lib/`）：

| 库 | 用途 |
|----|------|
| AOS | 滚动触发动画 |
| Typed.js | 打字机效果 |
| Font Awesome 6 | 图标库 |
| Inter / Noto Sans SC / JetBrains Mono | 字体 |

### 技术栈

| 层级 | 技术 |
|------|------|
| 静态生成 | Hugo (Go templates) |
| 样式 | CSS3 (CSS Custom Properties) |
| 脚本 | Vanilla JavaScript (无框架) |
| 配置 | TOML + YAML |
| 内容 | Markdown (YAML frontmatter) |

---

## 部署

### GitHub Pages / Vercel / Netlify

构建命令：
```bash
hugo --minify
```

输出目录：`public/`

### 手动部署

```bash
hugo --minify --cleanDestinationDir
# 将 public/ 目录上传到服务器即可
```

### Hugo 环境变量

```bash
# 指定环境
HUGO_ENV=production hugo --minify

# 指定基础URL
hugo --baseURL "https://example.com"
```

---

## 许可证

本项目基于 **GPL v3.0** 许可证开源。详见 [LICENSE](themes/illusion/LICENSE) 文件。

主题幻梦 (Illusion) 由 [爱则心痛 (azxt)](https://github.com/aizexintong) 开发维护。
