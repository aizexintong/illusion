# azxt-theme

爱则心痛的个人博客主题 - 华丽清新，炫技无限

## 主题特色

### 🎨 设计风格
- **华丽清新**：蓝紫色渐变主题，搭配粉色和青色点缀
- **现代简约**：简洁的布局，丰富的动画效果
- **响应式设计**：完美适配各种屏幕尺寸

### ⚡ 技术特性
- **粒子背景**：使用Particles.js实现的动态粒子效果
- **3D交互**：卡片3D旋转和悬停效果
- **滚动动画**：AOS库实现的滚动触发动画
- **打字机效果**：Typed.js实现的动态文字效果
- **技能进度条**：动态加载的进度条动画

### 📱 功能模块
- **首页展示**：英雄区域、技能展示、最新文章
- **技能页面**：详细技能展示、发展历程时间线
- **文章列表**：卡片式布局、分类标签、阅读时间
- **响应式导航**：移动端友好菜单
- **页脚信息**：联系方式、社交链接、技术标签

## 快速开始

### 1. 安装主题
```bash
# 在Hugo站点目录中
git submodule add https://github.com/aizexintong/azxt-theme.git themes/azxt-theme
```

### 2. 配置站点
在 `hugo.toml` 中设置主题：
```toml
theme = "azxt-theme"
baseURL = "https://your-domain.com/"
languageCode = "zh-CN"
title = "你的博客名称"

[params]
  author = "你的名字"
  description = "博客描述"
  email = "your-email@example.com"
  github = "your-github-username"
  
  # 主题颜色
  primaryColor = "#8a2be2"
  secondaryColor = "#ff69b4"
  accentColor = "#00ced1"
  
  # 图片配置
  adaptiveImage = "https://t.alcy.cc/ycy"
  horizontalImage = "https://t.alcy.cc/pc"
  verticalImage = "https://t.alcy.cc/mp"
  avatarImage = "https://t.alcy.cc/tx"
  
  # 技能配置
  skills = [
    { name = "JavaScript", level = 90 },
    { name = "HTML5", level = 90 },
    { name = "CSS3", level = 90 },
    { name = "Python", level = 90 },
    { name = "Flutter", level = 75 },
    { name = "Rust", level = 55 }
  ]
```

### 3. 创建内容
```bash
# 创建关于页面
hugo new about.md

# 创建技能页面
hugo new skills.md

# 创建文章
hugo new posts/my-first-post.md
```

## 自定义配置

### 颜色主题
主题使用CSS变量定义颜色，可以在 `assets/css/main.css` 中修改：
```css
:root {
  --primary: #8a2be2;      /* 主色调 */
  --secondary: #ff69b4;    /* 次要色调 */
  --accent: #00ced1;       /* 强调色 */
  --background: #f8f9fa;   /* 背景色 */
  --surface: #ffffff;      /* 表面色 */
  --text: #333333;         /* 文字色 */
}
```

### 动画效果
主题包含多种动画效果，可以在 `assets/js/main.js` 中调整：
- 粒子效果参数
- 滚动动画设置
- 鼠标交互效果
- 技能条动画

### 布局定制
主题使用模块化布局，可以修改以下文件：
- `layouts/_partials/` - 页面组件
- `layouts/home.html` - 首页布局
- `layouts/skills.html` - 技能页面布局
- `layouts/_default/` - 默认布局

## 高级功能

### 🎨 主题定制系统
主题提供完整的配置系统，支持通过 `hugo.toml` 自定义：

```toml
[params]
  # 颜色系统 (支持16种颜色变量)
  primaryColor = "#8a4b5a"
  primaryLight = "#b27a87"
  primaryDark = "#6a3b45"
  secondaryColor = "#7a6a5f"
  accentColor = "#5b7e91"
  
  # 功能开关
  enableParticles = true       # 粒子背景
  enable3DEffects = true       # 3D卡片效果
  enableScrollAnimations = true # 滚动动画
  enableDarkMode = true        # 暗黑模式
  enableAccessibility = true   # 可访问性增强
  
  # 布局配置
  heroLayout = "centered"      # 英雄区域布局
  postsLayout = "grid"         # 文章布局
  skillsLayout = "grid"        # 技能布局
  
  # 社交链接配置
  socialLinks = [
    { platform = "github", url = "https://github.com/username", icon = "fab fa-github" },
    { platform = "email", url = "mailto:email@example.com", icon = "fas fa-envelope" }
  ]
  
  # 评论系统 (支持 Disqus/Utterances/Giscus)
  enableComments = true
  commentsProvider = "disqus"
  disqusShortname = "your-disqus-shortname"
  
  # 搜索功能 (支持本地搜索/Algolia)
  enableSearch = true
  searchProvider = "local"
  
  # SEO增强
  enableSchema = true          # 结构化数据
  enableOpenGraph = true       # Open Graph
  enableTwitterCards = true    # Twitter Cards
```

### ♿ 可访问性特性
- **WCAG 2.1 AA 合规**: 所有颜色对比度经过测试
- **键盘导航**: 完整的Tab键导航支持
- **屏幕阅读器优化**: ARIA属性、跳过链接、语义化HTML
- **焦点管理**: 可见焦点指示器、焦点陷阱
- **动态内容通知**: 屏幕阅读器内容更新提示

### 🌙 暗黑模式
- **自动检测**: 根据系统偏好自动切换
- **本地存储**: 记住用户选择
- **平滑过渡**: 颜色和动画的平滑切换
- **完整支持**: 所有组件都有深色主题版本

### 🔍 搜索功能
- **本地搜索**: 基于JSON索引的快速搜索
- **实时结果**: 输入时实时显示搜索结果
- **高亮显示**: 搜索关键词高亮
- **键盘支持**: 支持键盘导航搜索结果

### 💬 评论系统
- **多平台支持**: Disqus、Utterances、Giscus
- **配置简单**: 只需在配置文件中设置
- **响应式设计**: 适配各种屏幕尺寸
- **可访问性**: 评论区域ARIA标签支持

### 📱 移动端优化
- **触摸友好**: 44px最小触摸目标
- **手势支持**: 滑动关闭菜单
- **性能优化**: 触摸设备特定优化
- **响应式设计**: 完整的移动端适配

### 🏗️ 结构化数据
- **Schema.org**: 完整的结构化数据支持
- **多种类型**: Website、Person、BlogPosting、AboutPage等
- **搜索引擎优化**: 提升搜索引擎理解
- **社交分享**: 优化的Open Graph和Twitter Cards

## 浏览器支持
- Chrome 60+
- Firefox 55+
- Safari 11+
- Edge 79+
- iOS Safari 11+
- Android Chrome 60+

## 性能优化
- 使用CDN加载第三方库
- 图片懒加载
- CSS和JavaScript压缩
- 静态资源缓存

## 开发指南

### 本地开发
```bash
# 启动开发服务器
hugo server

# 构建生产版本
hugo --minify
```

### 文件结构
```
azxt-theme/
├── assets/           # 静态资源
│   ├── css/         # 样式文件
│   └── js/          # 脚本文件
├── layouts/          # 布局文件
│   ├── _partials/   # 页面组件
│   ├── _default/    # 默认布局
│   ├── home.html    # 首页布局
│   └── skills.html  # 技能页面布局
├── static/          # 静态文件
└── hugo.toml        # 主题配置
```

## 许可证
MIT License

## 作者
**爱则心痛 (azxt)**
- 邮箱：admin@azxt.org
- GitHub：[@aizexintong](https://github.com/aizexintong)
- 网站：https://azxt.org

## 更新日志

### v1.1.0 (2026-03-24)
- **增强可定制性**: 新增颜色配置系统、布局选项和功能开关
- **提升可访问性**: 完整ARIA属性支持、键盘导航、屏幕阅读器优化
- **SEO增强**: 结构化数据(Schema.org)支持、Open Graph优化
- **现代特性**: 暗黑模式支持、主题切换、本地存储偏好
- **功能扩展**: 评论系统(Disqus/Utterances/Giscus)、本地搜索功能
- **移动端优化**: 触摸交互改进、手势支持、响应式增强
- **代码质量**: 模块化CSS设计、详细注释、性能优化

### v1.0.0 (2026-03-24)
- 初始版本发布
- 完成基本主题设计
- 实现炫技动画效果
- 添加技能展示功能
- 优化响应式布局

---

**感谢使用 azxt-theme！** 🎉

如果你在使用过程中遇到任何问题，或者有改进建议，欢迎提交Issue或Pull Request。