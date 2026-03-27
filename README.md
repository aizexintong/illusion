# 幻梦 Illusion

> **版本**: 2.2.0 | **作者**: 爱则心痛 (azxt) | **许可**: GPL v3 | **最低 Hugo**: 0.146.0

![主题](https://img.shields.io/badge/主题-幻梦-blue) ![Hugo](https://img.shields.io/badge/Hugo-0.146.0+-green) ![License](https://img.shields.io/badge/License-GPL%20v3-yellow)

---

## 简介

幻梦（Illusion）是一个华丽清新的二次元风格 Hugo 博客主题。采用温暖柔和的配色方案，支持暗黑模式、响应式设计和丰富的动画效果（樱花飘落、萤火虫漂浮、星星闪烁）。

---

## 特性

| 分类 | 特性 |
|------|------|
| **视觉效果** | 樱花飘落、星星闪烁、光点漂浮、萤火虫动画、粒子背景 |
| **暗黑模式** | 自动跟随系统主题，支持手动切换 |
| **响应式设计** | 移动端优先，适配手机、平板、桌面 |
| **可访问性** | ARIA 标签、键盘导航、屏幕阅读器支持 |
| **SEO** | Open Graph、Twitter Cards、结构化数据 |
| **数据驱动** | 关于、技能、友链内容通过 YAML 配置 |
| **文章功能** | 阅读时间、字数统计、标签分类、上下篇导航 |
| **评论系统** | 支持 Disqus / Utterances / Giscus |
| **搜索功能** | 内置本地搜索 |
| **Shortcodes** | link-card、links-grid、skills 内嵌组件 |

---

## 快速开始

### 1. 安装主题

```bash
cd themes
git clone https://github.com/aizexintong/illusion.git
```

或使用 Git 子模块：

```bash
git submodule add https://github.com/aizexintong/illusion.git themes/illusion
```

### 2. 配置站点

在站点根目录 `hugo.toml` 中添加：

```toml
theme = "illusion"
```

### 3. 启动服务

```bash
hugo server -D
```

---

## 内容与数据优先级

### About 页面

About 页面的内容来源有明确的优先级：

```
content/about.md  >  data/about.yaml (content 字段)
```

- **优先使用**：站点根目录 `content/about.md`
- **自动回退**：若 `content/about.md` 不存在，自动使用 `data/about.yaml` 中的 `content` 字段
- **零配置可用**：主题已内置默认内容，无需创建任何文件即可显示 About 页面

如需自定义 About 页面，创建 `content/about.md`：

```yaml
---
title: "关于我"
layout: "about"
---

你的个人介绍内容...
```

### 数据文件

YAML 数据文件的优先级：

```
站点 data/  >  主题 data/
```

| 文件 | 作用 |
|------|------|
| `data/about.yaml` | About 页面的结构化数据（简介、统计、理念、联系方式） |
| `data/skills.yaml` | 技能页面数据 |
| `data/friends.yaml` | 友链页面数据 |

**自定义方式**：将主题的 `data/` 文件复制到站点根目录 `data/`，然后修改。

---

## 目录结构

```
illusion/
├── archetypes/
│   └── default.md
├── assets/
│   ├── css/
│   │   ├── main.css
│   │   ├── modules/          # CSS 模块（variables/base/layout/components/pages/effects/darkmode）
│   │   └── pages/            # 页面专用样式（about/skills/links）
│   └── js/
│       ├── main.js
│       └── modules/          # JS 模块（theme/animations/interactions/enhancements）
├── data/
│   ├── about.yaml            # About 页面数据（含默认内容）
│   ├── friends.yaml          # 友链数据
│   └── skills.yaml           # 技能数据
├── layouts/
│   ├── _default/             # 默认模板
│   ├── _partials/            # 局部模板
│   ├── partials/             # 评论、搜索组件
│   ├── shortcodes/           # 内嵌组件
│   ├── about.html            # About 页面
│   ├── home.html             # 首页
│   ├── links.html            # 友链页
│   ├── section.html          # 文章列表
│   ├── skills.html           # 技能页
│   └── taxonomy/term.html    # 标签页
├── static/
│   └── favicon.ico
├── hugo.toml                 # 主题默认配置
├── LICENSE
└── README.md
```

---

## 站点配置

### 完整配置示例

```toml
baseURL = "https://example.com/"
languageCode = "zh-CN"
title = "我的博客"
theme = "illusion"

[params]
  author = "作者名"
  description = "博客描述"
  email = "your@email.com"
  github = "your-github"
  domain = "example.com"

  # 颜色
  primaryColor = "#8a4b5a"
  primaryLight = "#b27a87"
  primaryDark = "#6a3b45"
  backgroundColor = "#fdfaf8"
  textColor = "#2e2b28"

  # 图片
  avatarImage = "https://example.com/avatar.jpg"

  # 功能开关
  enableParticles = true
  enable3DEffects = true
  enableScrollAnimations = true
  enableTypewriter = true
  enableDarkMode = true
  enableSearch = true

  # 技能
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
  commentsProvider = "giscus"
  giscusRepo = "user/repo"

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

---

## 页面说明

### 首页 (home.html)

- 英雄区域：打字机效果展示标语
- 最新文章：展示最近 6 篇文章
- 关于简介：文章数/标签数/技能数统计
- 技能展示：进度条

### 文章列表 (section.html)

- 左右分栏布局
- 奇偶文章卡片交替
- 分页导航（每页 10 篇）
- 侧栏：日历、最新文章、标签云

### 文章详情 (single.html)

- 封面大图、文章元信息
- 侧栏：标签列表、目录
- 上下篇导航、评论区

### 关于页 (about.html)

**内容来源**：

| 优先级 | 来源 | 说明 |
|--------|------|------|
| 1 | `content/about.md` | 自定义内容（推荐） |
| 2 | `data/about.yaml` 的 `content` 字段 | 主题默认内容 |

**数据配置** (`data/about.yaml`)：

| 字段 | 说明 |
|------|------|
| `intro` | 个人简介卡片（姓名、头衔、座右铭） |
| `stats` | 数据统计（文章数、技能数等） |
| `philosophy` | 技术理念 |
| `contact` | 联系方式 |
| `content` | 默认 Markdown 内容 |

### 技能页 (skills.html)

纯数据驱动，配置 `data/skills.yaml` 即可。

### 友链页 (links.html)

纯数据驱动，配置 `data/friends.yaml` 即可。

---

## Shortcodes

### link-card

```markdown
{{</* link-card
  name="博客名"
  url="https://example.com"
  avatar="https://avatar-url"
  desc="博客简介" */>}}
```

### links-grid

```markdown
{{</* links-grid */>}}
  {{</* link-card name="A" url="https://a.com" avatar="..." desc="..." */>}}
  {{</* link-card name="B" url="https://b.com" avatar="..." desc="..." */>}}
{{</* /links-grid */>}}
```

### skills

```markdown
{{</* skills */>}}
```

---

## 自定义

### 修改配色

编辑 `assets/css/modules/variables.css` 或在 `hugo.toml` 的 `[params]` 中配置颜色参数。

### 禁用装饰效果

```toml
[params]
  enableParticles = false
  enable3DEffects = false
  enableScrollAnimations = false
  enableTypewriter = false
```

### 添加评论系统

```toml
[params]
  enableComments = true
  commentsProvider = "giscus"
  giscusRepo = "user/repo"
```

---

## 更新日志

### v2.2.0

- 新增 About 页面内容回退机制
- 修正数据优先级说明
- 完善文档

### v2.1.0

- 主题更名为"幻梦 Illusion"
- 更新主题配置和文档

### v2.0.0

- 重构 CSS/JS 架构，模块化组织
- 移动端优先响应式设计
- 数据文件驱动内容配置
- 新增暗黑模式、AOS 动画、装饰效果
- 新增评论系统、本地搜索
- 优化可访问性和 SEO

---

## 许可证

GNU General Public License v3.0 - 详见 [LICENSE](LICENSE) 文件。

---

## 联系方式

- **作者**: 爱则心痛 (azxt)
- **GitHub**: [aizexintong](https://github.com/aizexintong)
- **邮箱**: admin@azxt.org
- **网站**: https://azxt.org
