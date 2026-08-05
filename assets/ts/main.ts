// ========== 幻梦 Illusion v1.1.0 - TypeScript 脚本引擎 ==========
// 主题的完整前端脚本系统，包含 12 个独立的功能管理器模块
// 负责主题切换、Canvas 粒子特效、滚动动画、搜索、分页、日历等全部交互功能
// 所有模块在页面加载时按依赖顺序自动初始化

// ========== 全局 TypeScript 接口与类型定义 ==========
// 定义粒子对象、流星对象、光谱类型和主题配置等核心数据类型
// 所有接口在此统一声明，供各管理器模块引用使用

interface ThemeConfig {
  light: { name: string; icon: string; label: string };
  dark: { name: string; icon: string; label: string };
  system: { name: string; icon: string; label: string };
}

interface Particle {
  type: string;
  x: number;
  y: number;
  [key: string]: unknown;
}

interface ShootingStar {
  x: number;
  y: number;
  vx: number;
  vy: number;
  length: number;
  life: number;
  decay: number;
  width: number;
}

interface SpectralType {
  minSize: number;
  maxSize: number;
  colors: string[];
  weight: number;
}

// ========== I18n 国际化辅助模块 ==========
// 提供多语言翻译功能，支持从 DOM 属性（data-i18n-xxx）和全局对象（window.i18nData）读取翻译文本
// 支持 {{ 变量名 }} 模板插值语法，参数替换时自动转义处理

const I18n = {
  /**
   * 根据翻译键获取对应的多语言文本
   * 查找优先级：window.i18nData 全局对象 > DOM 元素 #i18n-data 的 data-i18n-xxx 属性 > 返回 key 本身作为回退
   * @param key - 翻译文本的唯一标识键名
   * @param params - 可选的模板参数对象，用于替换文本中的 {{ 变量名 }} 占位符
   * @returns 翻译后的文本字符串，若未找到翻译则返回 key 本身并在控制台输出警告
   */
  t(key: string, params?: Record<string, string | number>): string {
    // 第一优先级：尝试从全局 window.i18nData 对象中获取翻译文本
    const i18nData = (window as any).i18nData;
    if (i18nData && i18nData[key]) {
      return this._interpolate(i18nData[key], params);
    }
    // 第二优先级：尝试从 DOM 中的 #i18n-data 容器通过 data-i18n-xxx 属性获取
    const globalEl = document.getElementById('i18n-data');
    if (globalEl) {
      const val = globalEl.getAttribute('data-i18n-' + key);
      if (val) return this._interpolate(val, params);
    }
    // 未找到任何翻译文本：输出警告日志并返回 key 本身作为兜底文本
    console.warn('[I18n] Missing translation key:', key);
    return key;
  },

  _interpolate(text: string, params?: Record<string, string | number>): string {
    if (!params) return text;
    return text.replace(/\{\{\s*(\w+)\s*\}\}/g, (_, key) => {
      return params[key] !== undefined ? String(params[key]) : `{{${key}}}`;
    });
  }
};

// ========== 主题管理器（ThemeManager）==========
// 管理明暗主题切换，支持 light（亮色）、dark（暗色）、system（跟随系统）三种模式
// 通过 localStorage 持久化存储用户偏好的主题模式
// 使用 CustomEvent 通知所有组件主题变化，同时通过 postMessage 向 Giscus、Utterances 等 iframe 评论系统同步主题

const ThemeManager = {
  config: {
    light: {
      name: 'light',
      icon: 'fas fa-sun',
      label: ''
    },
    dark: {
      name: 'dark',
      icon: 'fas fa-moon',
      label: ''
    },
    system: {
      name: 'system',
      icon: 'fas fa-desktop',
      label: ''
    }
  } satisfies ThemeConfig,

  currentTheme: null as string | null,

  init(): void {
    this.config.light.label = I18n.t('theme_light');
    this.config.dark.label = I18n.t('theme_dark');
    this.config.system.label = I18n.t('theme_system');

    this.setThemeImmediately();

    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => this.initToggle());
    } else {
      this.initToggle();
    }

    this.watchSystemTheme();
  },

  setThemeImmediately(): void {
    const savedTheme = localStorage.getItem('theme') || 'system';
    this.currentTheme = savedTheme;
    this.applyTheme(savedTheme);
  },

  applyTheme(theme: string): void {
    let themeToApply = theme;
    if (theme === 'system') {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      themeToApply = prefersDark ? 'dark' : 'light';
    }
    document.documentElement.setAttribute('data-theme', themeToApply);
  },

  initToggle(): void {
    const toggleBtn = document.getElementById('theme-toggle');
    if (!toggleBtn) return;
    this.updateToggleButton(toggleBtn);
    toggleBtn.addEventListener('click', () => {
      this.cycleTheme();
      toggleBtn.style.transform = 'scale(0.9)';
      setTimeout(() => { toggleBtn.style.transform = ''; }, 150);
    });
  },

  cycleTheme(): void {
    const themes = ['system', 'light', 'dark'] as const;
    const currentIndex = themes.indexOf(this.currentTheme as typeof themes[number]);
    const nextIndex = (currentIndex + 1) % themes.length;
    const nextTheme = themes[nextIndex];
    this.setTheme(nextTheme);
  },

  /**
   * 设置当前主题模式并保存到 localStorage
   * 触发全局 'themeChanged' 自定义事件，通知所有组件（评论系统、Canvas 特效等）主题已切换
   * 同时向 Giscus 和 Utterances 等第三方评论系统的 iframe 发送 postMessage 同步主题
   * @param theme - 目标主题名称：'light'（亮色）| 'dark'（暗色）| 'system'（跟随系统）
   */
  setTheme(theme: string): void {
    if (!this.config[theme as keyof ThemeConfig]) return;

    const previousTheme = this.currentTheme;
    this.currentTheme = theme;
    localStorage.setItem('theme', theme);

    // 将主题值应用到 DOM 根元素的 data-theme 属性上，CSS 变量随之切换
    this.applyTheme(theme);

    // 同步更新页面上所有主题切换按钮的图标和提示标签
    this.updateAllToggleButtons();

    // 解析实际渲染的亮暗模式（当用户选择 'system' 时，根据系统色彩偏好确定最终主题）
    const appliedTheme = this.currentTheme === 'system'
      ? (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')
      : theme;

    // ========== 触发全局主题变更事件 ==========
    // 派发 themeChanged 自定义事件，所有评论组件通过监听此事件同步更新主题配色
    // event.detail.theme：用户选择的模式，event.detail.applied：实际渲染的亮暗，event.detail.previous：上一次主题
    document.dispatchEvent(new CustomEvent('themeChanged', {
      detail: {
        theme: this.currentTheme,      // 'system' | 'light' | 'dark'
        applied: appliedTheme,          // 'light' | 'dark'（实际渲染的主题）
        previous: previousTheme
      }
    }));

    // 可选：如果页面有 Giscus/Utterances 等 iframe，也可以通过 postMessage 通知
    this.notifyIframeComments(appliedTheme);
  },

  /**
   * 通过 postMessage 跨域通信，通知 iframe 内嵌入的第三方评论系统切换主题配色
   * 支持 Giscus（基于 GitHub Discussions）和 Utterances（基于 GitHub Issues）两种评论系统
   * @param theme - 实际渲染的亮暗模式：'light'（亮色）或 'dark'（暗色）
   */
  notifyIframeComments(theme: 'light' | 'dark'): void {
    // 向页面中的 Giscus 评论 iframe 发送主题配置更新消息
    const giscusFrame = document.querySelector('iframe.giscus-frame') as HTMLIFrameElement | null;
    if (giscusFrame) {
      giscusFrame.contentWindow?.postMessage({
        giscus: {
          setConfig: {
            theme: theme === 'dark' ? 'dark' : 'light'
          }
        }
      }, 'https://giscus.app');
    }

    // 向页面中的 Utterances 评论 iframe 发送主题切换消息（github-light / github-dark）
    const utterancesFrame = document.querySelector('.utterances-frame') as HTMLIFrameElement | null;
    if (utterancesFrame) {
      utterancesFrame.contentWindow?.postMessage({
        type: 'set-theme',
        theme: theme === 'dark' ? 'github-dark' : 'github-light'
      }, 'https://utteranc.es');
    }
  },

  /** 更新页面上所有主题切换按钮（头部导航栏的 #theme-toggle 和右侧滚动区的 .scroll-theme）的图标和提示文本 */
  updateAllToggleButtons(): void {
    // 遍历更新所有头部区域的切换按钮
    document.querySelectorAll('#theme-toggle').forEach(btn => this.updateToggleButton(btn as HTMLElement));
    // 遍历更新所有滚动区域的切换按钮
    document.querySelectorAll('.scroll-theme').forEach(btn => this.updateToggleButton(btn as HTMLElement));
  },

  updateToggleButton(button: HTMLElement): void {
    if (!button) return;
    const config = this.config[this.currentTheme as keyof ThemeConfig];
    const icon = button.querySelector('i');
    if (icon) {
      icon.className = config.icon;
      icon.setAttribute('aria-label', config.label);
    }
    button.setAttribute('title', config.label);
    button.setAttribute('aria-label', config.label);
  },

  watchSystemTheme(): void {
    if (!window.matchMedia) return;
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = () => {
      if (this.currentTheme === 'system') {
        const appliedTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
        this.applyTheme('system');
        // 当系统色彩偏好变化且用户选择了 'system' 模式时，自动同步更新主题并向所有评论系统发送通知
        document.dispatchEvent(new CustomEvent('themeChanged', {
          detail: {
            theme: 'system',
            applied: appliedTheme,
            previous: this.currentTheme
          }
        }));
        this.notifyIframeComments(appliedTheme);
      }
    };
    // 使用 addEventListener 监听 prefers-color-scheme 变化（替代已弃用的 .addListener 方法）
    mediaQuery.addEventListener('change', handleChange);
  }
};

// ========== Canvas 粒子特效管理器（EffectsManager）==========
// 根据当前主题模式渲染不同的全屏 Canvas 粒子特效
// - 白天模式（light）：糖果彩带雨效果，包含彩带、糖果、爱心、星星四类下落粒子
// - 夜间模式（dark）：星空闪烁 + 萤火虫飞舞效果，低概率触发流星群动画
// 低性能设备（双核以下、移动端）会自动减少粒子数量以降低 CPU 和 GPU 消耗

const EffectsManager = {
  canvas: null as HTMLCanvasElement | null,
  ctx: null as CanvasRenderingContext2D | null,
  particles: [] as Particle[],
  animationId: null as number | null,
  currentMode: null as string | null,
  isRunning: false,
  lastTime: 0,
  frameInterval: 1000 / 60,
  performanceMultiplier: 1,
  shootingStars: [] as ShootingStar[],
  lastShootingStarTime: 0,
  _w: 0,
  _h: 0,

  config: {
    candy: {
      ribbonCount: 35,
      candyCount: 22,
      heartCount: 10,
      starCount: 15,
      colors: ['#FF6B6B', '#FFA94D', '#FFD43B', '#69DB7C', '#4DABF7', '#9775FA', '#F783AC', '#FF8787', '#FFC078', '#FCC419'],
      candyColors: ['#FF6B6B', '#FFA94D', '#FFD43B', '#69DB7C', '#4DABF7', '#9775FA', '#F783AC']
    },
    star: {
      count: 80,
      spectralTypes: [
        { minSize: 2.5, maxSize: 4, colors: ['#FFFFFF', '#E8F0FF', '#D0E0FF'], weight: 1 },
        { minSize: 1.5, maxSize: 3, colors: ['#FFF8F0', '#FFF0D0', '#FFE8C0'], weight: 3 },
        { minSize: 0.8, maxSize: 1.8, colors: ['#FFD8B0', '#FFC090', '#FFA870'], weight: 4 }
      ] as SpectralType[]
    },
    firefly: {
      count: 35,
      colors: ['#60FF80', '#50FF70', '#70FF90', '#40FF60', '#80FFA0'],
      minSize: 1,
      maxSize: 2,
      glowSize: 5
    }
  },

  init(): void {
    if (this.isRunning) return;
    this.detectPerformance();
    this.createCanvas();
    this.bindEvents();
    this.detectMode();
    this.isRunning = true;
  },

  detectPerformance(): void {
    const isLowEnd = navigator.hardwareConcurrency <= 2 ||
      ((navigator as Navigator & { deviceMemory?: number }).deviceMemory !== undefined &&
        (navigator as Navigator & { deviceMemory?: number }).deviceMemory! <= 2) ||
      /Mobi|Android/i.test(navigator.userAgent);
    this.performanceMultiplier = isLowEnd ? 0.5 : 1;

    if (isLowEnd) {
      this.config.candy.ribbonCount = Math.floor(this.config.candy.ribbonCount * 0.5);
      this.config.candy.candyCount = Math.floor(this.config.candy.candyCount * 0.5);
      this.config.candy.heartCount = Math.floor(this.config.candy.heartCount * 0.5);
      this.config.candy.starCount = Math.floor(this.config.candy.starCount * 0.5);
      this.config.star.count = Math.floor(this.config.star.count * 0.5);
      this.config.firefly.count = Math.floor(this.config.firefly.count * 0.5);
    }
  },

  createCanvas(): void {
    if (this.canvas) return;
    this.canvas = document.createElement('canvas');
    this.canvas.id = 'effects-canvas';
    this.canvas.style.cssText = `
      position: fixed; top: 0; left: 0; width: 100vw; height: 100vh;
      pointer-events: none; z-index: 0; will-change: transform;
    `;
    const overlay = document.querySelector('.bg-overlay-layer');
    if (overlay && overlay.nextSibling) {
      document.body.insertBefore(this.canvas, overlay.nextSibling);
    } else {
      document.body.insertBefore(this.canvas, document.body.firstChild);
    }
    const ctx = this.canvas.getContext('2d', { alpha: true });
    if (ctx) this.ctx = ctx;
    this.resize();
  },

  resize(): void {
    if (!this.canvas) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const w = window.innerWidth;
    const h = window.innerHeight;
    this.canvas.width = w * dpr;
    this.canvas.height = h * dpr;
    this.canvas.style.width = w + 'px';
    this.canvas.style.height = h + 'px';
    this._w = w;
    this._h = h;
    if (this.ctx) this.ctx.scale(dpr, dpr);
  },

  bindEvents(): void {
    let resizeTimeout: number;
    window.addEventListener('resize', () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(() => this.resize(), 100);
    });
    const observer = new MutationObserver(() => this.detectMode());
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
  },

  detectMode(): void {
    const theme = document.documentElement.getAttribute('data-theme');
    const isDark = theme === 'dark';
    if (isDark && this.currentMode !== 'night') {
      this.switchMode('night');
    } else if (!isDark && this.currentMode !== 'day') {
      this.switchMode('day');
    }
  },

  switchMode(mode: string): void {
    if (this.animationId) { cancelAnimationFrame(this.animationId); this.animationId = null; }
    this.particles = [];
    this.shootingStars = [];
    this.currentMode = mode;
    this._w = window.innerWidth;
    this._h = window.innerHeight;
    if (mode === 'day') {
      this.initDayEffects();
    } else {
      this.initNightEffects();
    }
    this.lastTime = performance.now();
    this.animate(this.lastTime);
  },

  initDayEffects(): void {
    const config = this.config.candy;
    for (let i = 0; i < config.ribbonCount; i++) this.particles.push(this.createRibbon(config));
    for (let i = 0; i < config.candyCount; i++) this.particles.push(this.createCandy(config));
    for (let i = 0; i < config.heartCount; i++) this.particles.push(this.createHeart(config));
    for (let i = 0; i < config.starCount; i++) this.particles.push(this.createDayStar(config));
  },

  createRibbon(config: typeof EffectsManager.config.candy) {
    const depth = Math.random();
    return {
      type: 'ribbon', x: Math.random() * this._w, y: Math.random() * this._h * 2 - this._h,
      speed: 0.6 + depth * 1.5,
      color: config.colors[Math.floor(Math.random() * config.colors.length)],
      rotation: Math.random() * Math.PI * 2, rotationSpeed: (Math.random() - 0.5) * 0.06,
      wobble: Math.random() * Math.PI * 2, wobbleSpeed: 0.02 + Math.random() * 0.03,
      width: 4 + Math.random() * 6, height: 25 + Math.random() * 35, depth: depth
    };
  },

  createCandy(config: typeof EffectsManager.config.candy) {
    const depth = Math.random();
    return {
      type: 'candy', x: Math.random() * this._w, y: Math.random() * this._h * 2 - this._h,
      speed: 0.5 + depth * 1.2,
      color: config.candyColors[Math.floor(Math.random() * config.candyColors.length)],
      stripeColor: config.candyColors[Math.floor(Math.random() * config.candyColors.length)],
      size: 8 + Math.random() * 12, rotation: Math.random() * Math.PI * 2,
      rotationSpeed: (Math.random() - 0.5) * 0.05, wobble: Math.random() * Math.PI * 2,
      wobbleSpeed: 0.015 + Math.random() * 0.02, depth: depth,
      candyType: Math.floor(Math.random() * 3)
    };
  },

  createHeart(config: typeof EffectsManager.config.candy) {
    const depth = Math.random();
    const colors = ['#FF6B6B', '#F783AC', '#FFA94D', '#FF8787', '#9775FA', '#4DABF7'];
    return {
      type: 'heart', x: Math.random() * this._w, y: Math.random() * this._h * 2 - this._h,
      speed: 0.4 + depth * 0.8,
      color: colors[Math.floor(Math.random() * colors.length)],
      size: 6 + Math.random() * 10, rotation: (Math.random() - 0.5) * 0.3,
      wobble: Math.random() * Math.PI * 2, wobbleSpeed: 0.02 + Math.random() * 0.02,
      depth: depth, pulse: Math.random() * Math.PI * 2
    };
  },

  createDayStar(config: typeof EffectsManager.config.candy) {
    const depth = Math.random();
    const colors = ['#FFD43B', '#FFA94D', '#FF6B6B', '#69DB7C', '#4DABF7', '#F783AC'];
    return {
      type: 'dayStar', x: Math.random() * this._w, y: Math.random() * this._h * 2 - this._h,
      speed: 0.3 + depth * 0.7,
      color: colors[Math.floor(Math.random() * 4)],
      size: 5 + Math.random() * 8, rotation: Math.random() * Math.PI * 2,
      rotationSpeed: (Math.random() - 0.5) * 0.04, wobble: Math.random() * Math.PI * 2,
      wobbleSpeed: 0.01 + Math.random() * 0.02, depth: depth,
      points: 4 + Math.floor(Math.random() * 2)
    };
  },

  initNightEffects(): void {
    const starConfig = this.config.star;
    for (let i = 0; i < starConfig.count; i++) this.particles.push(this.createStar(starConfig));
    const fireflyConfig = this.config.firefly;
    for (let i = 0; i < fireflyConfig.count; i++) this.particles.push(this.createFirefly(fireflyConfig));
  },

  createStar(config: typeof EffectsManager.config.star) {
    const totalWeight = config.spectralTypes.reduce((s, t) => s + t.weight, 0);
    let roll = Math.random() * totalWeight;
    let type = config.spectralTypes[0];
    for (const t of config.spectralTypes) { roll -= t.weight; if (roll <= 0) { type = t; break; } }
    const size = type.minSize + Math.random() * (type.maxSize - type.minSize);
    const isBright = size > 2.5;
    return {
      type: 'star', x: Math.random() * this._w, y: Math.random() * this._h * 0.85,
      size: size,
      color: type.colors[Math.floor(Math.random() * type.colors.length)],
      twinkle: Math.random() * Math.PI * 2,
      twinkleSpeed: isBright ? 0.008 + Math.random() * 0.015 : 0.02 + Math.random() * 0.06,
      hasRays: size > 2 && Math.random() > 0.4,
      rayLength: 2 + size * 1.5 + Math.random() * 3
    };
  },

  createFirefly(config: typeof EffectsManager.config.firefly) {
    const angle = Math.random() * Math.PI * 2;
    const speed = 0.3 + Math.random() * 0.8;
    return {
      type: 'firefly', x: Math.random() * this._w, y: Math.random() * this._h,
      size: config.minSize + Math.random() * (config.maxSize - config.minSize),
      color: config.colors[Math.floor(Math.random() * config.colors.length)],
      glowSize: config.glowSize + Math.random() * 15,
      vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed,
      phase: Math.random() * Math.PI * 2, phaseSpeed: 0.03 + Math.random() * 0.05,
      wanderAngle: Math.random() * Math.PI * 2
    };
  },

  drawRibbon(p: Particle): void {
    if (!this.ctx) return;
    this.ctx.save();
    this.ctx.translate(p.x as number, p.y as number);
    this.ctx.rotate(p.rotation as number);
    const depthScale = 0.4 + (p.depth as number) * 0.6;
    this.ctx.globalAlpha = 0.6 + (p.depth as number) * 0.4;
    this.ctx.scale(depthScale, depthScale);
    const wave = Math.sin(p.wobble as number) * 4;
    const halfW = (p.width as number) / 2;
    const halfH = (p.height as number) / 2;
    this.ctx.beginPath();
    this.ctx.fillStyle = p.color as string;
    this.ctx.moveTo(-halfW + wave, -halfH);
    this.ctx.bezierCurveTo(halfW * 0.5, -halfH * 0.5 + wave, halfW, halfH * 0.5 - wave, halfW + wave * 0.5, halfH);
    this.ctx.lineTo(-halfW + wave * 0.5, halfH);
    this.ctx.bezierCurveTo(-halfW * 0.8, halfH * 0.3 + wave, -halfW * 0.5, -halfH * 0.3 - wave, -halfW + wave, -halfH);
    this.ctx.closePath();
    this.ctx.fill();
    this.ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
    this.ctx.fillRect(-halfW / 2, -halfH / 2, halfW * 0.5, halfH * 0.25);
    this.ctx.restore();
  },

  drawCandy(p: Particle): void {
    if (!this.ctx) return;
    this.ctx.save();
    this.ctx.translate(p.x as number, p.y as number);
    this.ctx.rotate(p.rotation as number);
    const depthScale = 0.5 + (p.depth as number) * 0.5;
    this.ctx.globalAlpha = 0.7 + (p.depth as number) * 0.3;
    this.ctx.scale(depthScale, depthScale);
    const size = p.size as number;
    if (p.candyType === 0) {
      this.ctx.beginPath(); this.ctx.arc(0, 0, size, 0, Math.PI * 2);
      this.ctx.fillStyle = p.color as string; this.ctx.fill();
      this.ctx.strokeStyle = p.stripeColor as string; this.ctx.lineWidth = 2;
      this.ctx.beginPath(); this.ctx.arc(0, 0, size * 0.7, 0, Math.PI); this.ctx.stroke();
      this.ctx.beginPath(); this.ctx.arc(-size * 0.3, -size * 0.3, size * 0.25, 0, Math.PI * 2);
      this.ctx.fillStyle = 'rgba(255, 255, 255, 0.6)'; this.ctx.fill();
    } else if (p.candyType === 1) {
      this.ctx.fillStyle = '#E8D898';
      this.ctx.fillRect(-1.5, size, 3, size * 1.5);
      this.ctx.beginPath(); this.ctx.arc(0, 0, size, 0, Math.PI * 2);
      this.ctx.fillStyle = p.color as string; this.ctx.fill();
      this.ctx.strokeStyle = p.stripeColor as string; this.ctx.lineWidth = 2;
      for (let i = 0; i < 3; i++) {
        this.ctx.beginPath(); this.ctx.arc(0, 0, size * (0.4 + i * 0.2), 0, Math.PI * 1.5); this.ctx.stroke();
      }
    } else {
      this.ctx.beginPath(); this.ctx.ellipse(0, 0, size * 1.5, size * 0.6, 0, 0, Math.PI * 2);
      this.ctx.fillStyle = p.color as string; this.ctx.fill();
      this.ctx.strokeStyle = p.stripeColor as string; this.ctx.lineWidth = 2;
      this.ctx.beginPath();
      this.ctx.moveTo(-size * 1.2, 0);
      this.ctx.quadraticCurveTo(-size * 0.5, -size * 0.5, 0, 0);
      this.ctx.quadraticCurveTo(size * 0.5, size * 0.5, size * 1.2, 0);
      this.ctx.stroke();
      this.ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
      this.ctx.beginPath(); this.ctx.ellipse(-size * 0.5, -size * 0.2, size * 0.4, size * 0.2, -0.3, 0, Math.PI * 2);
      this.ctx.fill();
    }
    this.ctx.restore();
  },

  drawHeart(p: Particle): void {
    if (!this.ctx) return;
    this.ctx.save();
    this.ctx.translate(p.x as number, p.y as number);
    this.ctx.rotate(p.rotation as number);
    const depthScale = 0.5 + (p.depth as number) * 0.5;
    const pulseScale = 1 + Math.sin(p.pulse as number) * 0.1;
    this.ctx.globalAlpha = 0.6 + (p.depth as number) * 0.4;
    this.ctx.scale(depthScale * pulseScale, depthScale * pulseScale);
    const size = p.size as number;
    this.ctx.beginPath();
    this.ctx.moveTo(0, size * 0.3);
    this.ctx.bezierCurveTo(-size, -size * 0.3, -size, -size, 0, -size * 0.5);
    this.ctx.bezierCurveTo(size, -size, size, -size * 0.3, 0, size * 0.3);
    this.ctx.fillStyle = p.color as string; this.ctx.fill();
    this.ctx.beginPath();
    this.ctx.ellipse(-size * 0.3, -size * 0.4, size * 0.2, size * 0.15, -0.5, 0, Math.PI * 2);
    this.ctx.fillStyle = 'rgba(255, 255, 255, 0.5)'; this.ctx.fill();
    this.ctx.restore();
  },

  drawDayStar(p: Particle): void {
    if (!this.ctx) return;
    this.ctx.save();
    this.ctx.translate(p.x as number, p.y as number);
    this.ctx.rotate(p.rotation as number);
    const depthScale = 0.5 + (p.depth as number) * 0.5;
    this.ctx.globalAlpha = 0.6 + (p.depth as number) * 0.4;
    this.ctx.scale(depthScale, depthScale);
    const spikes = p.points as number;
    const outerRadius = p.size as number;
    const innerRadius = (p.size as number) * 0.5;
    this.ctx.beginPath();
    for (let i = 0; i < spikes * 2; i++) {
      const radius = i % 2 === 0 ? outerRadius : innerRadius;
      const angle = (i * Math.PI) / spikes - Math.PI / 2;
      const x = Math.cos(angle) * radius;
      const y = Math.sin(angle) * radius;
      if (i === 0) this.ctx.moveTo(x, y); else this.ctx.lineTo(x, y);
    }
    this.ctx.closePath();
    this.ctx.fillStyle = p.color as string; this.ctx.fill();
    this.ctx.beginPath();
    this.ctx.arc(-(p.size as number) * 0.2, -(p.size as number) * 0.2, (p.size as number) * 0.2, 0, Math.PI * 2);
    this.ctx.fillStyle = 'rgba(255, 255, 255, 0.6)'; this.ctx.fill();
    this.ctx.restore();
  },

  drawStar(p: Particle): void {
    if (!this.ctx) return;
    const twinkleValue = Math.sin(p.twinkle as number);
    const alpha = 0.15 + (twinkleValue * 0.5 + 0.5) * 0.85;
    const sizeMultiplier = 0.6 + (twinkleValue * 0.5 + 0.5) * 0.6;
    const currentSize = (p.size as number) * sizeMultiplier;
    this.ctx.save();
    this.ctx.globalAlpha = alpha;
    const glowSize = currentSize * (3 + twinkleValue * 2);
    const gradient = this.ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, glowSize);
    gradient.addColorStop(0, p.color as string);
    gradient.addColorStop(0.2, (p.color as string) + 'C0');
    gradient.addColorStop(0.5, (p.color as string) + '50');
    gradient.addColorStop(1, 'transparent');
    this.ctx.fillStyle = gradient;
    this.ctx.beginPath(); this.ctx.arc(p.x, p.y, glowSize, 0, Math.PI * 2); this.ctx.fill();
    this.ctx.fillStyle = '#FFFFFF';
    this.ctx.beginPath(); this.ctx.arc(p.x, p.y, currentSize, 0, Math.PI * 2); this.ctx.fill();
    if (p.hasRays) {
      const rayLen = (p.rayLength as number) * currentSize * (0.7 + twinkleValue * 0.5);
      this.ctx.strokeStyle = p.color as string; this.ctx.lineWidth = 0.8;
      this.ctx.globalAlpha = alpha * 0.7;
      this.ctx.beginPath();
      this.ctx.moveTo(p.x - rayLen, p.y); this.ctx.lineTo(p.x + rayLen, p.y);
      this.ctx.moveTo(p.x, p.y - rayLen); this.ctx.lineTo(p.x, p.y + rayLen);
      this.ctx.stroke();
    }
    this.ctx.restore();
  },

  drawFirefly(p: Particle): void {
    if (!this.ctx) return;
    const glow = 0.3 + Math.sin(p.phase as number) * 0.5 + 0.2;
    this.ctx.save();
    const glowRadius = (p.size as number) * 2.5;
    const gradient = this.ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, glowRadius);
    gradient.addColorStop(0, p.color as string);
    gradient.addColorStop(0.3, (p.color as string) + 'B0');
    gradient.addColorStop(1, 'transparent');
    this.ctx.globalAlpha = glow * 0.7; this.ctx.fillStyle = gradient;
    this.ctx.beginPath(); this.ctx.arc(p.x, p.y, glowRadius, 0, Math.PI * 2); this.ctx.fill();
    this.ctx.globalAlpha = glow;
    this.ctx.fillStyle = '#B0FFB0';
    this.ctx.beginPath(); this.ctx.arc(p.x, p.y, (p.size as number) * 0.5, 0, Math.PI * 2); this.ctx.fill();
    this.ctx.restore();
  },

  updateDayParticle(p: Particle): void {
    const depthSpeed = 0.4 + (p.depth as number) * 0.6;
    p.y = (p.y as number) + (p.speed as number) * depthSpeed;
    p.wobble = (p.wobble as number) + (p.wobbleSpeed as number);
    p.x = (p.x as number) + Math.sin(p.wobble as number) * 0.8;
    if (p.rotation !== undefined) p.rotation = (p.rotation as number) + (p.rotationSpeed as number || 0);
    if (p.pulse !== undefined) p.pulse = (p.pulse as number) + 0.05;
    if ((p.y as number) > this._h + 50) { p.y = -50; p.x = Math.random() * this._w; }
  },

  updateNightParticle(p: Particle): void {
    if (p.type === 'star') {
      p.twinkle = (p.twinkle as number) + (p.twinkleSpeed as number);
    } else if (p.type === 'firefly') {
      p.phase = (p.phase as number) + (p.phaseSpeed as number);
      p.wanderAngle = (p.wanderAngle as number) + (Math.random() - 0.5) * 0.15;
      p.vx = (p.vx as number) + Math.cos(p.wanderAngle as number) * 0.03;
      p.vy = (p.vy as number) + Math.sin(p.wanderAngle as number) * 0.03;
      const maxSpeed = 1.2;
      const speed = Math.sqrt((p.vx as number) ** 2 + (p.vy as number) ** 2);
      if (speed > maxSpeed) {
        p.vx = ((p.vx as number) / speed) * maxSpeed;
        p.vy = ((p.vy as number) / speed) * maxSpeed;
      }
      p.x = (p.x as number) + (p.vx as number);
      p.y = (p.y as number) + (p.vy as number);
      const glowSize = p.glowSize as number;
      if ((p.x as number) < -glowSize) p.x = this._w + glowSize;
      if ((p.x as number) > this._w + glowSize) p.x = -glowSize;
      if ((p.y as number) < -glowSize) p.y = this._h + glowSize;
      if ((p.y as number) > this._h + glowSize) p.y = -glowSize;
    }
  },

  createShootingStar(): ShootingStar {
    const startX = Math.random() * this._w;
    const startY = Math.random() * this._h * 0.5;
    const angle = Math.PI / 3 + (Math.random() - 0.5) * 0.8;
    const speed = 6 + Math.random() * 12;
    return {
      x: startX, y: startY, vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed,
      length: 50 + Math.random() * 100, life: 1, decay: 0.008 + Math.random() * 0.015, width: 1 + Math.random() * 1.5
    };
  },

  updateShootingStars(): void {
    if (this.currentMode !== 'night') return;
    const now = Date.now();
    const interval = 2000 + Math.random() * 10000;
    if (now - this.lastShootingStarTime > interval) {
      const count = Math.random() > 0.7 ? 2 + Math.floor(Math.random() * 3) : 1;
      for (let i = 0; i < count; i++) {
        const star = this.createShootingStar();
        if (i > 0) { star.x += (Math.random() - 0.5) * 200; star.y += (Math.random() - 0.5) * 100; }
        this.shootingStars.push(star);
      }
      this.lastShootingStarTime = now;
    }
    for (let i = this.shootingStars.length - 1; i >= 0; i--) {
      const star = this.shootingStars[i];
      star.x += star.vx; star.y += star.vy; star.life -= star.decay;
      if (star.life <= 0 || star.x > this._w + 100 || star.y > this._h + 100) {
        this.shootingStars.splice(i, 1);
      }
    }
  },

  drawShootingStars(): void {
    if (!this.ctx) return;
    for (const star of this.shootingStars) {
      this.ctx.save();
      this.ctx.globalAlpha = star.life;
      const gradient = this.ctx.createLinearGradient(
        star.x, star.y,
        star.x - star.vx * 0.1 * star.length / 8,
        star.y - star.vy * 0.1 * star.length / 8
      );
      gradient.addColorStop(0, 'rgba(255, 255, 255, 1)');
      gradient.addColorStop(0.2, 'rgba(230, 240, 255, 0.9)');
      gradient.addColorStop(1, 'transparent');
      this.ctx.strokeStyle = gradient; this.ctx.lineWidth = star.width; this.ctx.lineCap = 'round';
      this.ctx.beginPath();
      this.ctx.moveTo(star.x, star.y);
      this.ctx.lineTo(star.x - star.vx * 0.1 * star.length / 8, star.y - star.vy * 0.1 * star.length / 8);
      this.ctx.stroke();
      const headGradient = this.ctx.createRadialGradient(star.x, star.y, 0, star.x, star.y, 6);
      headGradient.addColorStop(0, 'rgba(255, 255, 255, 1)');
      headGradient.addColorStop(0.3, 'rgba(230, 240, 255, 0.6)');
      headGradient.addColorStop(1, 'transparent');
      this.ctx.fillStyle = headGradient;
      this.ctx.beginPath(); this.ctx.arc(star.x, star.y, 6, 0, Math.PI * 2); this.ctx.fill();
      this.ctx.fillStyle = '#FFFFFF';
      this.ctx.beginPath(); this.ctx.arc(star.x, star.y, 1.5, 0, Math.PI * 2); this.ctx.fill();
      this.ctx.restore();
    }
  },

  animate(currentTime: number): void {
    if (!this.ctx || !this.canvas) return;
    const deltaTime = currentTime - this.lastTime;
    if (deltaTime < this.frameInterval) {
      this.animationId = requestAnimationFrame((t) => this.animate(t));
      return;
    }
    this.lastTime = currentTime - (deltaTime % this.frameInterval);
    this.ctx.clearRect(0, 0, this._w, this._h);
    for (const p of this.particles) {
      switch (p.type) {
        case 'ribbon': this.updateDayParticle(p); this.drawRibbon(p); break;
        case 'candy': this.updateDayParticle(p); this.drawCandy(p); break;
        case 'heart': this.updateDayParticle(p); this.drawHeart(p); break;
        case 'dayStar': this.updateDayParticle(p); this.drawDayStar(p); break;
        case 'star': this.updateNightParticle(p); this.drawStar(p); break;
        case 'firefly': this.updateNightParticle(p); this.drawFirefly(p); break;
      }
    }
    this.updateShootingStars();
    this.drawShootingStars();
    this.animationId = requestAnimationFrame((t) => this.animate(t));
  },

  destroy(): void {
    if (this.animationId) { cancelAnimationFrame(this.animationId); this.animationId = null; }
    if (this.canvas) { this.canvas.remove(); this.canvas = null; }
    this.particles = []; this.shootingStars = []; this.isRunning = false;
  }
};

// ========== 动画效果管理器（AnimationManager）==========
// 统一管理页面各类动画效果，包括：
// - AOS 入场动画：滚动触发元素的淡入/位移/缩放效果
// - 滚动进度条：页面顶部细线指示当前阅读进度
// - 技能进度条：滚动到可视区域时从 0% 动画过渡到目标百分比
// - Typed.js 打字机效果：模拟逐字打印的文本动画
// - 降级方案：当 AOS 库未加载时使用 IntersectionObserver 实现简易入场动画

const AnimationManager = {
  init(): void {
    this.initAOS();
    this.initScrollProgress();
    this.initSkillBars();
    this.initTypedJS();
    this.ensureVisibility();
  },

  ensureVisibility(): void {
    setTimeout(() => {
      const hiddenElements = document.querySelectorAll('[data-aos]:not(.aos-animate)');
      hiddenElements.forEach(el => {
        if (getComputedStyle(el).opacity === '0') {
          (el as HTMLElement).style.opacity = '1';
          (el as HTMLElement).style.transform = 'none';
          (el as HTMLElement).style.transition = 'none';
        }
      });
    }, 2000);
  },

  initAOS(): void {
    if (typeof AOS !== 'undefined') {
      AOS.init({
        duration: 400, easing: 'ease-out-cubic', once: true, offset: 80, delay: 50,
        disable: window.matchMedia('(prefers-reduced-motion: reduce)').matches
      });
    } else {
      setTimeout(() => {
        if (typeof AOS !== 'undefined') {
          AOS.init({
            duration: 400, easing: 'ease-out-cubic', once: true, offset: 80, delay: 50,
            disable: window.matchMedia('(prefers-reduced-motion: reduce)').matches
          });
        } else {
          this.initScrollAnimations();
        }
      }, 500);
    }
  },

  initScrollProgress(): void {
    const progressBar = document.createElement('div');
    progressBar.className = 'scroll-progress';
    document.body.appendChild(progressBar);
    let ticking = false;
    window.addEventListener('scroll', () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const winScroll = document.body.scrollTop || document.documentElement.scrollTop;
          const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
          const scrolled = (winScroll / height) * 100;
          progressBar.style.transform = `scaleX(${scrolled / 100})`;
          ticking = false;
        });
        ticking = true;
      }
    }, { passive: true });
  },

  initSkillBars(): void {
    const skillBars = document.querySelectorAll<HTMLElement>('.skill-progress[data-level]');
    if (skillBars.length === 0) return;
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const bar = entry.target as HTMLElement;
          const level = bar.getAttribute('data-level');
          bar.style.willChange = 'width';
          bar.style.width = `${level}%`;
          bar.style.opacity = '1';
          setTimeout(() => { bar.style.willChange = 'auto'; }, 1500);
          observer.unobserve(bar);
        }
      });
    }, { threshold: 0.3 });
    skillBars.forEach(bar => {
      bar.style.width = '0%'; bar.style.opacity = '0.3';
      bar.style.transition = 'width 1s ease-out, opacity 0.5s ease-out';
      observer.observe(bar);
    });
  },

  initTypedJS(): void {
    const typedElements = document.querySelectorAll('.typed-text');
    if (typedElements.length === 0) return;
    if (typeof Typed !== 'undefined') {
      this.initTypedElements(typedElements);
    } else {
      setTimeout(() => {
        if (typeof Typed !== 'undefined') { this.initTypedElements(typedElements); }
      }, 500);
    }
  },

  initTypedElements(elements: NodeListOf<Element>): void {
    elements.forEach(el => {
      try {
        const dataAttr = el.getAttribute('data-typed');
        const data = dataAttr ? JSON.parse(dataAttr) : [];
        new Typed(el, {
          strings: data, typeSpeed: 60, backSpeed: 40, backDelay: 2000,
          startDelay: 500, loop: true, showCursor: true, cursorChar: '|'
        });
      } catch (e) {
        console.warn('Typed.js initialization failed:', e);
      }
    });
  },

  initScrollAnimations(): void {
    const animatedElements = document.querySelectorAll<HTMLElement>('[data-aos]');
    if (animatedElements.length === 0) return;
    animatedElements.forEach(el => {
      el.style.opacity = '0';
      el.style.transition = 'opacity 0.4s ease, transform 0.4s ease';
      el.style.willChange = 'opacity, transform';
      const animation = el.getAttribute('data-aos');
      switch (animation) {
        case 'fade-up': el.style.transform = 'translateY(16px)'; break;
        case 'fade-down': el.style.transform = 'translateY(-16px)'; break;
        case 'fade-left': el.style.transform = 'translateX(16px)'; break;
        case 'fade-right': el.style.transform = 'translateX(-16px)'; break;
        case 'zoom-in': el.style.transform = 'scale(0.95)'; break;
        case 'zoom-out': el.style.transform = 'scale(1.05)'; break;
        default: el.style.transform = 'none';
      }
    });
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const el = entry.target as HTMLElement;
          const delay = parseInt(el.getAttribute('data-aos-delay') || '0');
          setTimeout(() => {
            el.style.opacity = '1'; el.style.transform = 'none';
            el.classList.add('aos-animate');
            setTimeout(() => { el.style.willChange = 'auto'; }, 500);
          }, delay);
          observer.unobserve(el);
        }
      });
    }, { threshold: 0.1 });
    animatedElements.forEach(el => observer.observe(el));
  }
};

// ========== 交互功能管理器（InteractionManager）==========
// 管理用户交互相关的各种功能，包括：
// - 移动端汉堡菜单：打开/关闭动画与焦点管理
// - 平滑滚动：锚点链接点击时平滑滚动到目标位置并预留顶部偏移
// - 图片懒加载：基于 IntersectionObserver 的 data-src 延迟加载
// - 触摸交互增强：移动端点击时添加视觉反馈样式
// - 键盘导航：注入"跳转到主内容"的跳转链接
// - 页头滚动效果：页面滚动超过阈值时为导航栏添加阴影
// - 搜索弹窗：支持 Ctrl+K 快捷键打开/关闭搜索模态框
// - 3D 卡片悬停：鼠标在卡片上移动时产生透视旋转效果

const InteractionManager = {
  init(): void {
    this.initMobileMenu();
    this.initSmoothScroll();
    this.initLazyLoad();
    this.initTouchInteractions();
    this.initKeyboardNavigation();
    this.initHeaderScroll();
    this.initSearch();
    this.initCardHover();
  },

  initMobileMenu(): void {
    const menuToggle = document.querySelector('.mobile-menu-toggle') as HTMLElement;
    const menuClose = document.querySelector('.mobile-menu-close') as HTMLElement;
    const menu = document.querySelector('.mobile-menu') as HTMLElement;
    const overlay = document.querySelector('.mobile-menu-overlay') as HTMLElement;
    if (!menuToggle || !menu) return;
    const setMenuFocusable = (focusable: boolean): void => {
      menu.querySelectorAll('a, button, [tabindex]').forEach(el => {
        el.setAttribute('tabindex', focusable ? '0' : '-1');
      });
    };
    const openMenu = (): void => {
      menu.classList.add('active'); menu.setAttribute('aria-hidden', 'false');
      if (overlay) { overlay.classList.add('active'); overlay.setAttribute('aria-hidden', 'false'); }
      setMenuFocusable(true); document.body.style.overflow = 'hidden';
    };
    const closeMenu = (): void => {
      menu.classList.remove('active'); menu.setAttribute('aria-hidden', 'true');
      if (overlay) { overlay.classList.remove('active'); overlay.setAttribute('aria-hidden', 'true'); }
      setMenuFocusable(false); document.body.style.overflow = '';
    };
    setMenuFocusable(false);
    menuToggle.addEventListener('click', openMenu);
    if (menuClose) menuClose.addEventListener('click', closeMenu);
    if (overlay) overlay.addEventListener('click', closeMenu);
    menu.querySelectorAll('a').forEach(link => link.addEventListener('click', closeMenu));
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && menu.classList.contains('active')) closeMenu();
    });
  },

  initSmoothScroll(): void {
    document.querySelectorAll<HTMLAnchorElement>('a[href^="#"]').forEach(anchor => {
      anchor.addEventListener('click', function (e) {
        const targetId = this.getAttribute('href');
        if (targetId === '#') return;
        const targetElement = document.querySelector(targetId);
        if (targetElement) {
          e.preventDefault();
          const headerOffset = 80;
          const elementPosition = targetElement.getBoundingClientRect().top;
          const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
          window.scrollTo({ top: offsetPosition, behavior: 'smooth' });
        }
      });
    });
  },

  initLazyLoad(): void {
    const images = document.querySelectorAll<HTMLImageElement>('img[data-src]');
    if (!images.length) return;
    const imageObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const img = entry.target as HTMLImageElement;
          img.src = img.dataset.src || '';
          img.removeAttribute('data-src');
          imageObserver.unobserve(img);
        }
      });
    });
    images.forEach(img => imageObserver.observe(img));
  },

  initTouchInteractions(): void {
    if (!('ontouchstart' in window || navigator.maxTouchPoints > 0)) return;
    document.body.classList.add('touch-device');
    document.querySelectorAll('.btn, .card, .post-card, .skill-item').forEach(el => {
      el.addEventListener('touchstart', function () { this.classList.add('touch-active'); }, { passive: true });
      el.addEventListener('touchend', function () { this.classList.remove('touch-active'); }, { passive: true });
    });
  },

  initKeyboardNavigation(): void {
    const skipLink = document.createElement('a');
    skipLink.href = '#main';
    skipLink.className = 'skip-link';
    skipLink.textContent = I18n.t('a11y_skip_to_main');
    document.body.insertBefore(skipLink, document.body.firstChild);
  },

  initHeaderScroll(): void {
    const header = document.querySelector('.site-header') as HTMLElement;
    if (!header) return;
    let ticking = false;
    window.addEventListener('scroll', () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          if (window.pageYOffset > 50) header.classList.add('scrolled');
          else header.classList.remove('scrolled');
          ticking = false;
        });
        ticking = true;
      }
    }, { passive: true });
  },

  initSearch(): void {
    const searchToggle = document.querySelector('.search-toggle') as HTMLElement;
    const searchModal = document.getElementById('search-modal') as HTMLElement;
    const searchOverlay = document.getElementById('search-modal-overlay') as HTMLElement;
    const searchClose = document.getElementById('search-modal-close') as HTMLElement;
    const searchInput = searchModal?.querySelector('input[type="search"]') as HTMLInputElement;
    if (!searchToggle || !searchModal) return;
    const openSearch = (): void => {
      searchModal.classList.add('active');
      if (searchOverlay) searchOverlay.classList.add('active');
      searchModal.removeAttribute('aria-hidden');
      if (searchOverlay) searchOverlay.removeAttribute('aria-hidden');
      if (searchInput) searchInput.focus();
      document.body.style.overflow = 'hidden';
    };
    const closeSearch = (): void => {
      searchModal.classList.remove('active');
      if (searchOverlay) searchOverlay.classList.remove('active');
      searchModal.setAttribute('aria-hidden', 'true');
      if (searchOverlay) searchOverlay.setAttribute('aria-hidden', 'true');
      document.body.style.overflow = '';
    };
    searchToggle.addEventListener('click', openSearch);
    if (searchClose) searchClose.addEventListener('click', closeSearch);
    if (searchOverlay) searchOverlay.addEventListener('click', closeSearch);
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && searchModal.classList.contains('active')) closeSearch();
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        searchModal.classList.contains('active') ? closeSearch() : openSearch();
      }
    });
    searchModal.addEventListener('click', (e) => { if (e.target === searchModal) closeSearch(); });
  },

  initCardHover(): void {
    document.querySelectorAll('.card, .post-card, .skill-item, .link-card').forEach(card => {
      let rafId: number | null = null;
      card.addEventListener('mousemove', (e) => {
        if (!card.classList.contains('enable-3d')) return;
        if (rafId) cancelAnimationFrame(rafId);
        rafId = requestAnimationFrame(() => {
          const rect = card.getBoundingClientRect();
          const x = e.clientX - rect.left;
          const y = e.clientY - rect.top;
          const centerX = rect.width / 2;
          const centerY = rect.height / 2;
          const rotateY = ((x - centerX) / centerX) * 5;
          const rotateX = ((centerY - y) / centerY) * 5;
          (card as HTMLElement).style.transform =
            `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`;
        });
      });
      card.addEventListener('mouseleave', () => {
        if (rafId) cancelAnimationFrame(rafId);
        (card as HTMLElement).style.transform =
          'perspective(1000px) rotateX(0) rotateY(0) scale3d(1, 1, 1)';
      });
    });
  }
};

// ========== Markdown 文档增强管理器（EnhancementManager）==========
// 增强文章正文内容的渲染效果和交互体验，包括：
// - 代码块增强：自动检测编程语言标签，添加一键复制代码按钮
// - 表格增强：为表格包裹横向滚动容器，避免移动端溢出
// - 引用块增强：根据前缀符号（💡 ⚠️ 📝 ❌）自动添加提示/警告/备注/错误样式
// - 标题锚点：为无 id 的标题元素自动生成唯一锚点 ID，支持链接跳转

const EnhancementManager = {
  init(): void {
    this.enhanceCodeBlocks();
    this.enhanceTables();
    this.enhanceBlockquotes();
    this.addHeadingAnchors();
  },

  enhanceCodeBlocks(): void {
    document.querySelectorAll('.highlight').forEach((highlight) => {
      const pre = highlight.querySelector('pre');
      const code = highlight.querySelector('code');
      if (!pre || !code) return;
      let language = 'code';
      const dataLang = code.getAttribute('data-lang');
      if (dataLang) language = dataLang;
      else if (code.className) {
        const langMatch = code.className.match(/language-(\w+)/);
        if (langMatch) language = langMatch[1];
      }
      highlight.setAttribute('data-lang', language);

      const copyBtn = document.createElement('button');
      copyBtn.className = 'code-copy-btn';
      copyBtn.setAttribute('aria-label', I18n.t('js_copy_code'));
      copyBtn.innerHTML = `<i class="fas fa-copy"></i><span>${I18n.t('js_code_copy')}</span>`;
      highlight.appendChild(copyBtn);

      copyBtn.addEventListener('click', async () => {
        const codeText = code.textContent || '';
        try {
          await navigator.clipboard.writeText(codeText);
          copyBtn.innerHTML = `<i class="fas fa-check"></i><span>${I18n.t('js_code_copied')}</span>`;
          copyBtn.classList.add('copied');
          setTimeout(() => {
            copyBtn.innerHTML = `<i class="fas fa-copy"></i><span>${I18n.t('js_code_copy')}</span>`;
            copyBtn.classList.remove('copied');
          }, 2000);
        } catch {
          const textarea = document.createElement('textarea');
          textarea.value = codeText; textarea.style.cssText = 'position:fixed;opacity:0;';
          document.body.appendChild(textarea); textarea.select();
          document.execCommand('copy'); document.body.removeChild(textarea);
          copyBtn.innerHTML = `<i class="fas fa-check"></i><span>${I18n.t('js_code_copied')}</span>`;
          copyBtn.classList.add('copied');
          setTimeout(() => {
            copyBtn.innerHTML = `<i class="fas fa-copy"></i><span>${I18n.t('js_code_copy')}</span>`;
            copyBtn.classList.remove('copied');
          }, 2000);
        }
      });
    });
  },

  enhanceTables(): void {
    document.querySelectorAll('.article-text table').forEach(table => {
      if (table.parentElement?.classList.contains('table-wrapper')) return;
      const wrapper = document.createElement('div');
      wrapper.className = 'table-wrapper';
      wrapper.style.cssText = 'overflow-x:auto;margin:1.5rem 0;';
      table.parentNode?.insertBefore(wrapper, table);
      wrapper.appendChild(table);
    });
  },

  enhanceBlockquotes(): void {
    document.querySelectorAll('.article-text blockquote').forEach(quote => {
      const text = quote.textContent?.trim() || '';
      if (text.startsWith('💡')) quote.classList.add('callout', 'callout-info');
      else if (text.startsWith('⚠️')) quote.classList.add('callout', 'callout-warning');
      else if (text.startsWith('📝')) quote.classList.add('callout', 'callout-note');
      else if (text.startsWith('❌')) quote.classList.add('callout', 'callout-error');
    });
  },

  addHeadingAnchors(): void {
    document.querySelectorAll('.article-text h2, .article-text h3').forEach(heading => {
      if (!heading.id) {
        const id = heading.textContent?.toLowerCase()
          .replace(/[^\w\u4e00-\u9fa5]+/g, '-')
          .replace(/^-+|-+$/g, '') || `heading-${Math.random().toString(36).substr(2, 9)}`;
        heading.id = id;
      }
    });
  }
};

// ========== 通用工具管理器（UtilsManager）==========
// 提供页面通用交互工具与辅助功能，包括：
// - 右侧悬浮滚动按钮组：返回顶部、到达底部、快捷搜索、主题切换
// - 图片灯箱：点击文章图片全屏放大查看，支持 Escape 键关闭
// - 文章目录高亮：根据当前滚动位置自动高亮对应目录项
// - 点击涟漪特效：全局鼠标点击产生扩散波纹动画

const UtilsManager = {
  init(): void {
    this.initScrollButtons();
    this.initImageLightbox();
    this.initTOCHighlight();
    this.initClickEffect();
  },

  initScrollButtons(): void {
    const buttons = document.getElementById('scroll-buttons');
    if (!buttons) return;

    const topBtn = buttons.querySelector('.scroll-to-top') as HTMLElement;
    const bottomBtn = buttons.querySelector('.scroll-to-bottom') as HTMLElement;
    const searchBtn = buttons.querySelector('.scroll-search') as HTMLElement;
    const themeBtn = buttons.querySelector('.scroll-theme') as HTMLElement;

    // ----- 滚动功能：绑定返回顶部和到达底部的平滑滚动 -----
    if (topBtn) {
      topBtn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
    }
    if (bottomBtn) {
      bottomBtn.addEventListener('click', () => window.scrollTo({ top: document.documentElement.scrollHeight, behavior: 'smooth' }));
    }

    // ----- 搜索：点击触发头部搜索模态框 -----
    if (searchBtn) {
      searchBtn.addEventListener('click', () => {
        const searchToggle = document.querySelector('.search-toggle') as HTMLElement;
        if (searchToggle) searchToggle.click();
      });
    }

    // ----- 主题切换：触发头部主题按钮的点击，依次循环 light -> dark -> system -----
    if (themeBtn) {
      themeBtn.addEventListener('click', () => {
        const themeToggle = document.getElementById('theme-toggle') as HTMLElement;
        if (themeToggle) themeToggle.click();
      });
    }

    // ----- 滚动显隐逻辑：根据页面滚动位置动态显示/隐藏各按钮 -----
    let ticking = false;
    const updateButtons = (): void => {
      const scrollY = window.scrollY;
      const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
      const threshold = 300;
      const centerGroup = buttons.querySelector('.scroll-center-group') as HTMLElement;

      // 顶部按钮：页面滚动距离超过 300px 阈值时显示
      if (scrollY > threshold) {
        buttons.classList.add('visible');
        if (topBtn) topBtn.style.display = 'flex';
      } else {
        if (topBtn) topBtn.style.display = 'none';
      }

      // 底部按钮：距页面底部超过 300px 时显示，已到达底部附近则隐藏
      if (scrollY < maxScroll - threshold) {
        buttons.classList.add('visible');
        if (bottomBtn) bottomBtn.style.display = 'flex';
      } else {
        if (bottomBtn) bottomBtn.style.display = 'none';
      }

      // 中间按钮组（搜索和主题切换）：只要顶部或底部按钮有一项可见，就同时显示
      const hasVisible = (topBtn?.style.display === 'flex') || (bottomBtn?.style.display === 'flex');
      if (centerGroup) {
        centerGroup.style.display = hasVisible ? 'flex' : 'none';
      }

      // 如果没有任何按钮处于可见状态，隐藏整个悬浮按钮容器
      if (!hasVisible) {
        buttons.classList.remove('visible');
      }

      ticking = false;
    };

    window.addEventListener('scroll', () => {
      if (!ticking) {
        window.requestAnimationFrame(updateButtons);
        ticking = true;
      }
    }, { passive: true });

    updateButtons();
  },

  initImageLightbox(): void {
    const lightbox = document.getElementById('img-lightbox');
    const lightboxImg = document.getElementById('img-lightbox-img') as HTMLImageElement;
    const closeBtn = lightbox?.querySelector('.img-lightbox-close') as HTMLElement;
    if (!lightbox || !lightboxImg) return;
    const closeLightbox = (): void => {
      lightbox.classList.remove('active');
      document.body.style.overflow = '';
    };
    lightbox.addEventListener('click', (e) => { if (e.target === lightbox) closeLightbox(); });
    if (closeBtn) closeBtn.addEventListener('click', closeLightbox);
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeLightbox(); });
    document.querySelectorAll('.article-text img').forEach(img => {
      img.addEventListener('click', () => {
        lightboxImg.src = img.src; lightboxImg.alt = img.alt || '';
        lightbox.classList.add('active'); document.body.style.overflow = 'hidden';
      });
    });
  },

  initTOCHighlight(): void {
    const tocLinks = document.querySelectorAll<HTMLAnchorElement>('.toc-body a');
    if (tocLinks.length === 0) return;
    const headings: { element: HTMLElement; link: HTMLAnchorElement }[] = [];
    tocLinks.forEach(link => {
      const href = link.getAttribute('href');
      if (href && href.startsWith('#')) {
        const heading = document.getElementById(href.substring(1));
        if (heading) headings.push({ element: heading, link: link });
      }
    });
    let ticking = false;
    const updateActiveTOC = (): void => {
      let current = headings[0];
      const scrollTop = window.scrollY + 100;
      headings.forEach(item => { if (item.element.offsetTop <= scrollTop) current = item; });
      tocLinks.forEach(link => link.classList.remove('active'));
      if (current) current.link.classList.add('active');
      ticking = false;
    };
    window.addEventListener('scroll', () => {
      if (!ticking) { window.requestAnimationFrame(updateActiveTOC); ticking = true; }
    }, { passive: true });
    updateActiveTOC();
  },

  initClickEffect(): void {
    if (!document.querySelector('#click-effect-style')) {
      const style = document.createElement('style');
      style.id = 'click-effect-style';
      style.textContent = `
        @keyframes clickRipple {
          0% { transform: translate(-50%, -50%) scale(0); opacity: 0.8; }
          100% { transform: translate(-50%, -50%) scale(1); opacity: 0; }
        }
      `;
      document.head.appendChild(style);
    }
    document.addEventListener('click', (e) => {
      const effect = document.createElement('div');
      effect.className = 'click-effect';
      effect.style.cssText = `
        position: fixed; left: ${e.clientX}px; top: ${e.clientY}px;
        width: 200px; height: 200px; border-radius: 50%;
        background: radial-gradient(circle, var(--c-primary-400) 0%, transparent 70%);
        transform: translate(-50%, -50%) scale(0);
        pointer-events: none; z-index: 10000;
        animation: clickRipple 0.5s ease-out forwards;
        will-change: transform, opacity;
      `;
      document.body.appendChild(effect);
      setTimeout(() => effect.remove(), 500);
    });
  }
};

// ========== Font Awesome 图标库回退检测（FontFallback）==========
// 检测 Font Awesome 图标字体是否成功加载渲染
// 通过创建一个隐藏的测试图标元素 <i class="fas fa-square">，检查其实际渲染宽度来判断字体可用性
// 若图标宽度小于 5px（加载失败），则动态注入 data-href 中指定的备用 CSS 链接

const FontFallback = {
  init(): void {
    setTimeout(() => {
      const testIcon = document.createElement('i');
      testIcon.className = 'fas fa-square';
      testIcon.style.cssText = 'position:fixed;left:-99px;top:-99px;font-size:16px;';
      document.body.appendChild(testIcon);
      if (testIcon.offsetWidth < 5) {
        const linkFallback = document.querySelector<HTMLLinkElement>('#fa-fallback-css');
        const faUrl = linkFallback?.dataset?.href || '';
        if (faUrl) {
          const link = document.createElement('link');
          link.rel = 'stylesheet'; link.href = faUrl;
          document.head.appendChild(link);
        }
      }
      document.body.removeChild(testIcon);
    }, 1000);
  }
};

// ========== 页脚信息管理器（FooterManager）==========
// 动态更新页脚区域的版权信息、驱动信息、站点运行时长，每秒刷新一次
// - 版权信息：根据建站日期自动生成年份范围（如 2020-2025）
// - 驱动信息：展示 Hugo 引擎名称、主题名称和作者链接
// - 运行时长：精确到秒的站点存活时间计数器，格式为 年-月-日 T 时:分:秒
// - 渲染耗时：显示页面从开始加载到脚本执行完成的毫秒数

const FooterManager = {
  siteTime: '',
  siteUrl: '',
  siteName: '',
  pageLoadTime: 0,
  renderTime: 0,
  uptimeColors: ['#E06050', '#E09040', '#E0A070', '#50C878', '#60A8D0', '#D08090'],
  _timer: null as ReturnType<typeof setInterval> | null,

  init(): void {
    if (!document.getElementById('footer-copyright')) return;
    const cfg = (window as any).siteConfig;
    if (!cfg) return;
    this.siteTime = cfg.siteTime || '';
    this.siteUrl = cfg.baseURL || '';
    this.siteName = cfg.siteName || '';
    this.pageLoadTime = (window as any).pageLoadTime || performance.now();
    this.renderTime = performance.now() - this.pageLoadTime;
    this.updateFooter();
    this._timer = setInterval(() => this.updateFooter(), 1000);
  },

  updateFooter(): void {
    const now = new Date();
    const siteStart = new Date(this.siteTime);
    const currentYear = now.getFullYear();
    const startYear = siteStart.getFullYear();

    // ----- 更新版权信息：根据建站日期动态生成 © 2020-2025 格式的年份范围 -----
    const copyrightEl = document.getElementById('footer-copyright');
    if (copyrightEl) {
      const prefix = I18n.t('footer_copyright_prefix');
      const separator = I18n.t('footer_copyright_separator');
      const webmaster = I18n.t('footer_copyright_webmaster');
      const reserved = I18n.t('footer_copyright_reserved');
      const rights = I18n.t('footer_copyright_rights');

      const yearPart = startYear === currentYear
        ? `${currentYear}`
        : `${startYear}${separator}${currentYear}`;

      copyrightEl.innerHTML = `${prefix} ${yearPart} <a href="${this.siteUrl}">${this.siteName}</a> ${webmaster} · ${reserved} <a href="${this.siteUrl}">${this.siteName}</a> ${rights}`;
    }

    // ----- 更新驱动信息：显示 Hugo 引擎名称、主题名称和作者 GitHub 链接 -----
    const poweredEl = document.getElementById('footer-powered');
    if (poweredEl) {
      const prefix = I18n.t('footer_powered_prefix');
      const hugo = I18n.t('footer_powered_hugo');
      const sep = I18n.t('footer_powered_separator');
      const theme = I18n.t('footer_powered_theme');
      const authorLabel = I18n.t('footer_powered_author');

      poweredEl.innerHTML = `${prefix} <a href="https://gohugo.io" target="_blank" rel="noopener">${hugo}</a> ${sep} ${theme}<a href="https://github.com/aizexintong/illusion" target="_blank" rel="noopener">幻梦 Illusion</a> ${sep} ${authorLabel}<a href="https://github.com/aizexintong" target="_blank" rel="noopener">爱则心痛</a>`;
    }

    // ----- 更新运行时长：计算自建站以来的完整时间差，渲染为 年-月-日 T 时:分:秒 格式 -----
    const displayEl = document.getElementById('uptime-display');
    if (!displayEl) return;

    const diff = now.getTime() - siteStart.getTime();
    const totalSeconds = Math.floor(diff / 1000);
    const seconds = totalSeconds % 60;
    const minutes = Math.floor(totalSeconds / 60) % 60;
    const hours = Math.floor(totalSeconds / 3600) % 24;

    let years = now.getFullYear() - siteStart.getFullYear();
    let months = now.getMonth() - siteStart.getMonth();
    let days = now.getDate() - siteStart.getDate();

    if (days < 0) { months--; const prevMonth = new Date(now.getFullYear(), now.getMonth(), 0); days += prevMonth.getDate(); }
    if (months < 0) { years--; months += 12; }

    const dateNums = [this.pad4(years), this.pad2(months), this.pad2(days), this.pad2(hours), this.pad2(minutes), this.pad2(seconds)];

    const seps = [
      '<span style="color:var(--c-text-subtle);margin:0 1px;">-</span>',
      '<span style="color:var(--c-text-subtle);margin:0 1px;">-</span>',
      '<span style="color:#D4B040;margin:0 1px;font-weight:var(--fw-bold);">T</span>',
      '<span style="color:var(--c-text-subtle);margin:0 1px;">:</span>',
      '<span style="color:var(--c-text-subtle);margin:0 1px;">:</span>'
    ];

    const label = I18n.t('footer_uptime_label');
    let html = `${label} `;
    for (let i = 0; i < dateNums.length; i++) {
      if (i > 0) html += seps[i - 1];
      html += `<span style="color:${this.uptimeColors[i]};font-weight:var(--fw-semibold);font-variant-numeric:tabular-nums;">${dateNums[i]}</span>`;
    }

    // 追加页面渲染耗时信息（从页面开始加载到当前脚本执行的时间，保留两位小数）
    const renderLabel = I18n.t('footer_render_time');
    const renderMs = this.renderTime.toFixed(2);
    html += ` · ${renderLabel} <span style="color:#90C080;font-weight:var(--fw-semibold);font-variant-numeric:tabular-nums;">${renderMs}ms</span>`;

    displayEl.innerHTML = html;
  },

  pad2(n: number): string { return n < 10 ? '0' + n : String(n); },
  pad4(n: number): string { return String(n).padStart(4, '0'); }
};

// ========== 站内搜索引擎管理器（SearchEngine）==========
// 实现站内全文搜索功能，从 JSON 索引文件异步加载文章数据
// - 搜索结果按标题、正文、摘要三个字段进行关键词匹配
// - 关键词在结果中自动高亮标记
// - 搜索结果摘要自动提取匹配关键词附近的上下文片段
// - 支持 Escape 键清空搜索输入和结果

const SearchEngine = {
  searchIndex: [] as any[],

  init(): void {
    const searchForm = document.getElementById('search-form');
    const searchInput = document.getElementById('search-input') as HTMLInputElement | null;
    const searchResults = document.getElementById('search-results');
    if (!searchForm || !searchInput || !searchResults) return;

    const indexUrl = searchForm.dataset.indexUrl || 'index.json';

    fetch(indexUrl)
      .then(response => {
        if (!response.ok) throw new Error('HTTP error: ' + response.status);
        return response.json();
      })
      .then(data => { this.searchIndex = data; })
      .catch(() => {
        const errorMsg = I18n.t('js_search_error');
        const hintMsg = I18n.t('js_search_error_hint');
        searchResults.innerHTML = `<div class="search-error"><p><i class="fas fa-exclamation-triangle"></i> ${errorMsg}</p>${hintMsg ? `<p class="search-error-hint">${hintMsg}</p>` : ''}</div>`;
      });

    searchForm.addEventListener('submit', (e) => {
      e.preventDefault();
      this.performSearch(searchInput, searchResults, searchForm);
    });

    searchInput.addEventListener('input', () => {
      if (searchInput.value.length >= 2) this.performSearch(searchInput, searchResults, searchForm);
      else searchResults.innerHTML = '';
    });

    searchInput.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') { searchInput.value = ''; searchResults.innerHTML = ''; }
    });
  },

  performSearch(input: HTMLInputElement, results: HTMLElement, form: HTMLElement): void {
    const query = input.value;
    if (!query.trim() || this.searchIndex.length === 0) { results.innerHTML = ''; return; }

    const normalizedQuery = query.toLowerCase().trim();
    const filtered = this.searchIndex.filter((item: any) => {
      const title = (item.title || '').toLowerCase();
      const content = (item.content || '').toLowerCase();
      const summary = (item.summary || '').toLowerCase();
      return title.includes(normalizedQuery) || content.includes(normalizedQuery) || summary.includes(normalizedQuery);
    });

    if (filtered.length === 0) {
      const noResults = I18n.t('js_search_no_results');
      const resultsFor = I18n.t('js_search_results_for');
      results.innerHTML = `<div class="search-no-results"><p>${noResults} "<strong>${query}</strong>" ${resultsFor}</p></div>`;
      return;
    }

    const resultsCount = I18n.t('js_search_results_count');
    let html = `<div class="search-results-header"><p>${filtered.length} ${resultsCount}</p></div><ul class="search-results-list">`;

    filtered.forEach((result: any) => {
      const title = this.highlightText(result.title, query);
      const excerpt = this.getExcerpt(result.content || result.summary, query);
      const tags = result.tags ? `<span class="search-result-tags">${result.tags.join(', ')}</span>` : '';
      html += `<li class="search-result-item">
        <a href="${result.permalink}" class="search-result-link">
          <h3 class="search-result-title">${title}</h3>
          <div class="search-result-excerpt">${excerpt}</div>
          <div class="search-result-meta">
            <span class="search-result-date">${this.formatDate(result.date)}</span>${tags}
          </div>
        </a>
      </li>`;
    });

    html += '</ul>';
    results.innerHTML = html;
  },

  highlightText(text: string, query: string): string {
    if (!text) return '';
    const escaped = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp('(' + escaped + ')', 'gi');
    return text.replace(regex, '<mark class="search-highlight">$1</mark>');
  },

  getExcerpt(content: string, query: string, length: number = 120): string {
    if (!content) return '';
    const normalized = content.toLowerCase();
    const idx = normalized.indexOf(query.toLowerCase());
    if (idx === -1) return content.substring(0, length) + '...';
    const start = Math.max(0, idx - 40);
    const end = Math.min(content.length, idx + 80);
    let excerpt = content.substring(start, end);
    if (start > 0) excerpt = '...' + excerpt;
    if (end < content.length) excerpt = excerpt + '...';
    return this.highlightText(excerpt, query);
  },

  formatDate(dateString: string): string {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric' });
  }
};

// ========== 日历小组件（CalendarWidget）==========
// 渲染当月日历面板，包括周几标题行、日期数字网格、当前年月标签
// 当天日期使用特殊 CSS 类名 .today 进行高亮标记
// 月份名称和星期缩写均通过 I18n 模块读取多语言翻译

const CalendarWidget = {
  init(): void {
    if (!document.getElementById('calendar-days')) return;
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => this.render());
    } else {
      this.render();
    }
  },

  render(): void {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();
    const today = now.getDate();

    const weekDays = I18n.t('calendar_weekdays').split(',');

    const monthNames = [
      I18n.t('archives_month_01'), I18n.t('archives_month_02'), I18n.t('archives_month_03'),
      I18n.t('archives_month_04'), I18n.t('archives_month_05'), I18n.t('archives_month_06'),
      I18n.t('archives_month_07'), I18n.t('archives_month_08'), I18n.t('archives_month_09'),
      I18n.t('archives_month_10'), I18n.t('archives_month_11'), I18n.t('archives_month_12')
    ];

    const monthEl = document.getElementById('calendar-month');
    const yearEl = document.getElementById('calendar-year');
    if (monthEl) monthEl.textContent = monthNames[month];
    if (yearEl) yearEl.textContent = year + I18n.t('calendar_year_suffix');

    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    const daysContainer = document.getElementById('calendar-days');
    if (!daysContainer) return;
    daysContainer.innerHTML = '';

    for (let i = 0; i < firstDay; i++) {
      const emptyDay = document.createElement('span');
      emptyDay.className = 'calendar-day empty';
      daysContainer.appendChild(emptyDay);
    }

    for (let day = 1; day <= daysInMonth; day++) {
      const dayEl = document.createElement('span');
      dayEl.className = 'calendar-day' + (day === today ? ' today' : '');
      dayEl.textContent = String(day);
      daysContainer.appendChild(dayEl);
    }

    const dateEl = document.getElementById('current-date');
    if (dateEl) {
      const fmt = I18n.t('calendar_date_format');
      dateEl.textContent = fmt
        .replace('%s', String(year))
        .replace('%s', String(month + 1))
        .replace('%s', String(today))
        .replace('%s', weekDays[now.getDay()]);
    }
  }
};

// ========== 归档年份导航器（ArchivesNavigator）==========
// 解析页面中的所有归档年份分组，提供按年份切换文章列表的导航功能
// - 上一页/下一页按钮：点击切换相邻年份
// - 键盘导航：支持左右箭头键快速切换年份
// - 月份面板：显示当前年份各月份的文章数量统计
// - 月份点击：定位并平滑滚动到对应的月份分组位置

const ArchivesNavigator = {
  years: [] as number[],
  currentYearIndex: 0,

  init(): void {
    if (!document.getElementById('current-year-display')) return;
    this.parseYears();
    if (this.years.length === 0) {
      const display = document.getElementById('current-year-display');
      if (display) display.textContent = I18n.t('js_archives_no_data');
      const prevBtn = document.getElementById('year-prev') as HTMLButtonElement | null;
      const nextBtn = document.getElementById('year-next') as HTMLButtonElement | null;
      if (prevBtn) prevBtn.disabled = true;
      if (nextBtn) nextBtn.disabled = true;
      return;
    }
    this.bindEvents();
    this.currentYearIndex = 0;
    this.updateYearDisplay();
  },

  parseYears(): void {
    document.querySelectorAll('.archive-year').forEach(section => {
      const y = section.getAttribute('data-year');
      if (y) this.years.push(Number(y));
    });
    this.years.sort((a, b) => b - a);
  },

  buildMonthCounts(year: string): Record<string, number> {
    const counts: Record<string, number> = {};
    for (let m = 1; m <= 12; m++) counts[String(m).padStart(2, '0')] = 0;
    document.querySelectorAll('.archive-year').forEach(section => {
      if (section.getAttribute('data-year') === year) {
        section.querySelectorAll('.archive-month').forEach(month => {
          const id = month.id;
          if (id && id.startsWith('month-')) {
            const monthNum = id.replace('month-', '');
            counts[monthNum] = month.querySelectorAll('.archive-item').length;
          }
        });
      }
    });
    return counts;
  },

  updateYearDisplay(): void {
    if (this.years.length === 0) return;
    if (this.currentYearIndex < 0) this.currentYearIndex = 0;
    if (this.currentYearIndex >= this.years.length) this.currentYearIndex = this.years.length - 1;
    const year = this.years[this.currentYearIndex];
    const yearStr = String(year);
    const yearDisplay = document.getElementById('current-year-display');
    if (yearDisplay) yearDisplay.textContent = yearStr;
    const monthCounts = this.buildMonthCounts(yearStr);
    document.querySelectorAll('.month-item').forEach(item => {
      const month = item.getAttribute('data-month');
      const countSpan = item.querySelector('.month-count');
      if (countSpan && month) countSpan.textContent = String(monthCounts[month] || 0);
      item.setAttribute('data-year', yearStr);
      item.classList.add('active');
    });
    document.querySelectorAll('.archive-year').forEach(section => {
      section.getAttribute('data-year') === yearStr
        ? ((section as HTMLElement).style.display = 'block')
        : ((section as HTMLElement).style.display = 'none');
    });
    const prevBtn = document.getElementById('year-prev') as HTMLButtonElement | null;
    const nextBtn = document.getElementById('year-next') as HTMLButtonElement | null;
    if (prevBtn) prevBtn.disabled = this.currentYearIndex <= 0;
    if (nextBtn) nextBtn.disabled = this.currentYearIndex >= this.years.length - 1;
  },

  bindEvents(): void {
    const prevBtn = document.getElementById('year-prev');
    const nextBtn = document.getElementById('year-next');
    if (prevBtn) prevBtn.addEventListener('click', () => {
      if (this.currentYearIndex > 0) { this.currentYearIndex--; this.updateYearDisplay(); }
    });
    if (nextBtn) nextBtn.addEventListener('click', () => {
      if (this.currentYearIndex < this.years.length - 1) { this.currentYearIndex++; this.updateYearDisplay(); }
    });
    document.querySelectorAll('.month-item').forEach(item => {
      item.addEventListener('click', () => {
        const month = item.getAttribute('data-month');
        const year = item.getAttribute('data-year');
        if (!year) return;
        const yearIndex = this.years.indexOf(Number(year));
        if (yearIndex !== -1 && yearIndex !== this.currentYearIndex) {
          this.currentYearIndex = yearIndex; this.updateYearDisplay();
        }
        if (month) {
          const target = document.getElementById('month-' + month);
          if (target) setTimeout(() => target.scrollIntoView({ behavior: 'smooth', block: 'start' }), 300);
        }
      });
    });
    document.addEventListener('keydown', (e) => {
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes((e.target as HTMLElement).tagName)) return;
      const prevBtnEl = document.getElementById('year-prev') as HTMLButtonElement | null;
      const nextBtnEl = document.getElementById('year-next') as HTMLButtonElement | null;
      if (e.key === 'ArrowLeft' && prevBtnEl && !prevBtnEl.disabled) { prevBtnEl.click(); e.preventDefault(); }
      if (e.key === 'ArrowRight' && nextBtnEl && !nextBtnEl.disabled) { nextBtnEl.click(); e.preventDefault(); }
    });
  }
};

// ========== 导航链接点击特效（NavClickEffect）==========
// 为导航栏链接（CSS 选择器 .nav-link）的点击事件添加星星弹出动画
// 在点击位置生成一个 ✨ 字符元素，通过 CSS 动画 starPop 播放 0.6 秒后自动销毁

const NavClickEffect = {
  init(): void {
    document.addEventListener('click', (e) => {
      if (!(e.target as HTMLElement).closest('.nav-link')) return;
      const star = document.createElement('span');
      star.style.cssText = `position:fixed;left:${e.clientX}px;top:${e.clientY}px;pointer-events:none;z-index:9999;font-size:14px;transform:translate(-50%,-50%);animation:starPop 0.6s ease-out forwards;`;
      star.textContent = '\u2728';
      document.body.appendChild(star);
      setTimeout(() => star.remove(), 600);
    });
  }
};

// ========== 标签云分页管理器（TagsPagination）==========
// 为标签云页面提供分页导航功能，将大量标签卡片按每页固定数量分组显示
// - 智能页码显示：根据总页数和当前位置自动适配页码布局（首页用省略号收尾 / 尾页省略开头 / 中间两端省略）
// - URL 参数同步：切换页码时更新浏览器地址栏查询参数，支持前进后退导航
// - 导航按钮控制：最后一页自动隐藏"下一页"按钮
// - 滚动定位：切换页码后自动滚动到标签网格顶部

const TagsPagination = {
  currentPage: 1,
  perPage: 25,
  totalPages: 1,
  wrappers: [] as HTMLElement[],

  init(): void {
    const grid = document.getElementById('tags-grid');
    const pagination = document.getElementById('tags-pagination');
    if (!grid || !pagination) return;
    this.perPage = parseInt(grid.dataset.perPage || '25');
    const total = parseInt(grid.dataset.total || '0');
    this.totalPages = Math.ceil(total / this.perPage);
    if (this.totalPages <= 1) {
      pagination.style.display = 'none'; // 标签总数不足一页时隐藏分页导航
      return;
    }
    pagination.style.display = 'flex';
    this.wrappers = Array.from(grid.querySelectorAll('.tags-card-wrapper')) as HTMLElement[];
    const prevBtn = document.getElementById('page-prev') as HTMLElement;
    const nextBtn = document.getElementById('page-next') as HTMLElement;
    prevBtn.addEventListener('click', (e) => { e.preventDefault(); if (this.currentPage > 1) this.showPage(this.currentPage - 1); });
    nextBtn.addEventListener('click', (e) => { e.preventDefault(); if (this.currentPage < this.totalPages) this.showPage(this.currentPage + 1); });
    const urlParams = new URLSearchParams(window.location.search);
    const initialPage = parseInt(urlParams.get('page') || '1');
    this.showPage(Math.min(Math.max(initialPage, 1), this.totalPages), false);
  },

  showPage(page: number, scroll: boolean = true): void {
    this.currentPage = page;
    this.wrappers.forEach((wrapper, index) => {
      const itemPage = Math.floor(index / this.perPage) + 1;
      wrapper.style.display = itemPage === page ? '' : 'none';
    });
    this.renderPageNumbers();
    this.updateNavButtons();
    history.replaceState(null, '', page === 1 ? window.location.pathname : `?page=${page}`);
    if (scroll) {
      document.getElementById('tags-grid')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  },

  renderPageNumbers(): void {
    const pageNumbers = document.getElementById('page-numbers');
    if (!pageNumbers) return;
    pageNumbers.innerHTML = '';

    const current = this.currentPage;
    const total = this.totalPages;
    const showPages = 7;
    const half = Math.floor(showPages / 2);

    // 总页数不超过 7 页时：直接列出全部页码（1 2 3 ... 7）
    if (total <= showPages) {
      for (let i = 1; i <= total; i++) {
        this.addPageLink(pageNumbers, i);
      }
      return;
    }

    // 当前页靠近开头位置：显示 1 2 3 4 ... 最后一页
    if (current <= half) {
      for (let i = 1; i <= 4; i++) {
        this.addPageLink(pageNumbers, i);
      }
      this.addDots(pageNumbers);
      this.addPageLink(pageNumbers, total);
      return;
    }

    // 当前页靠近末尾位置：显示 首页 ... n-3 n-2 n-1 n
    if (current > total - half) {
      this.addPageLink(pageNumbers, 1);
      this.addDots(pageNumbers);
      for (let i = total - 3; i <= total; i++) {
        this.addPageLink(pageNumbers, i);
      }
      return;
    }

    // 当前页在中间区域：显示 首页 ... 当前页前后各一页 ... 末页
    this.addPageLink(pageNumbers, 1);
    this.addDots(pageNumbers);
    for (let i = current - 1; i <= current + 1; i++) {
      this.addPageLink(pageNumbers, i);
    }
    this.addDots(pageNumbers);
    this.addPageLink(pageNumbers, total);
  },

  addDots(container: HTMLElement): void {
    const dots = document.createElement('span');
    dots.className = 'page-link dots';
    dots.textContent = '…';
    container.appendChild(dots);
  },

  addPageLink(container: HTMLElement, pageNum: number): void {
    const link = document.createElement('a');
    link.href = '#';
    link.className = 'page-link';
    if (pageNum === this.currentPage) link.classList.add('current');
    link.textContent = String(pageNum);
    link.addEventListener('click', (e) => {
      e.preventDefault();
      this.showPage(pageNum);
    });
    container.appendChild(link);
  },

  // ========== 更新分页导航按钮的可见性状态 ==========
  // 当前在第一页时隐藏"上一页"按钮，在最后一页时隐藏"下一页"按钮
  updateNavButtons(): void {
    const prevBtn = document.getElementById('page-prev') as HTMLElement;
    const nextBtn = document.getElementById('page-next') as HTMLElement;

    if (prevBtn) {
      if (this.currentPage <= 1) {
        prevBtn.style.display = 'none'; // 处于第一页，隐藏"上一页"按钮
      } else {
        prevBtn.style.display = 'inline-flex';
        prevBtn.style.pointerEvents = 'auto';
        prevBtn.style.opacity = '1';
      }
    }

    if (nextBtn) {
      if (this.currentPage >= this.totalPages) {
        nextBtn.style.display = 'none'; // 处于最后一页，隐藏"下一页"按钮
      } else {
        nextBtn.style.display = 'inline-flex';
        nextBtn.style.pointerEvents = 'auto';
        nextBtn.style.opacity = '1';
      }
    }
  }
};

// ========== 主初始化入口函数 ==========
// 按依赖顺序依次初始化所有管理器模块，确保各模块的 DOM 操作不会互相干扰
// 使用全局标志位 IllusionThemeInitialized 防止页面重复初始化
// 在 prefers-reduced-motion（用户偏好减少动画）模式下跳过 Canvas 粒子特效以降低性能消耗

function initIllusionTheme(): void {
  if ((window as any).IllusionThemeInitialized) return;
  (window as any).IllusionThemeInitialized = true;

  FontFallback.init();
  ThemeManager.init();
  UtilsManager.init();
  EnhancementManager.init();
  AnimationManager.init();

  if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    EffectsManager.init();
  }

  InteractionManager.init();
  FooterManager.init();
  SearchEngine.init();
  CalendarWidget.init();
  ArchivesNavigator.init();
  NavClickEffect.init();
  TagsPagination.init();

  document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => AnimationManager.initSkillBars(), 500);
  });

  console.log('Illusion Theme v1.1.0 initialized');
}

// ========== 自动启动 ==========
// 脚本文件加载完成后立即执行初始化，无需等待 DOMContentLoaded 事件
// 各管理器内部自行通过 document.readyState 检测来处理 DOM 就绪状态的时序问题

initIllusionTheme();

// 将所有管理器实例统一暴露到全局 window.IllusionTheme 对象上，便于外部脚本调用和浏览器控制台调试
(window as any).IllusionTheme = {
  ThemeManager, EffectsManager, AnimationManager,
  InteractionManager, EnhancementManager, UtilsManager,
  FontFallback, FooterManager, SearchEngine,
  CalendarWidget, ArchivesNavigator, NavClickEffect, TagsPagination
};

console.log('Illusion Theme v1.1.0 ready');

export { };