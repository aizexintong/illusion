// ==========================================================================
// 幻梦 Illusion v1.0.0 - TypeScript
// 所有用户可见文字均通过 i18n 系统获取，便于多语言扩展
// ==========================================================================

// ==========================================================================
// 类型定义
// ==========================================================================

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

// ==========================================================================
// i18n 辅助函数 - 从 DOM 数据集读取翻译
// ==========================================================================

const I18n = {
  /**
   * 从 data-i18n 属性获取翻译文本
   * 优先级: data-i18n-xxx 属性 > window.i18nData > 默认英文
   */
  t(key: string, params?: Record<string, string | number>): string {
    // 尝试从 window.i18nData 获取
    const i18nData = (window as any).i18nData;
    if (i18nData && i18nData[key]) {
      return this._interpolate(i18nData[key], params);
    }
    // 尝试从 DOM 元素获取（如果有全局容器）
    const globalEl = document.getElementById('i18n-data');
    if (globalEl) {
      const val = globalEl.getAttribute('data-i18n-' + key);
      if (val) return this._interpolate(val, params);
    }
    // 返回 key 本身作为 fallback
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

// ==========================================================================
// 主题管理系统
// ==========================================================================

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

  setTheme(theme: string): void {
    if (!this.config[theme as keyof ThemeConfig]) return;
    this.currentTheme = theme;
    localStorage.setItem('theme', theme);
    this.applyTheme(theme);
    this.updateAllToggleButtons();
    document.dispatchEvent(new CustomEvent('themeChanged', {
      detail: {
        theme: this.currentTheme,
        applied: this.currentTheme === 'system'
          ? (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')
          : theme
      }
    }));
  },

  updateAllToggleButtons(): void {
    document.querySelectorAll('#theme-toggle').forEach(btn => this.updateToggleButton(btn as HTMLElement));
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
        this.applyTheme('system');
      }
    };
    mediaQuery.addEventListener('change', handleChange);
  }
};

// ==========================================================================
// 特效管理器（白天：糖果彩带雨 | 夜间：星光+萤火虫）
// ==========================================================================

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
    return { x: startX, y: startY, vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed,
      length: 50 + Math.random() * 100, life: 1, decay: 0.008 + Math.random() * 0.015, width: 1 + Math.random() * 1.5 };
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

// ==========================================================================
// 动画效果管理器
// ==========================================================================

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

// ==========================================================================
// 交互功能管理器
// ==========================================================================

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
      anchor.addEventListener('click', function(e) {
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
      el.addEventListener('touchstart', function() { this.classList.add('touch-active'); }, { passive: true });
      el.addEventListener('touchend', function() { this.classList.remove('touch-active'); }, { passive: true });
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

// ==========================================================================
// Markdown文档增强管理器
// ==========================================================================

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

// ==========================================================================
// 通用功能管理器
// ==========================================================================

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
    if (topBtn) topBtn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
    if (bottomBtn) bottomBtn.addEventListener('click', () => window.scrollTo({ top: document.documentElement.scrollHeight, behavior: 'smooth' }));
    let ticking = false;
    const updateButtons = (): void => {
      const scrollY = window.scrollY;
      const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
      const threshold = 300;
      if (scrollY > threshold) { buttons.classList.add('visible'); if (topBtn) topBtn.style.display = 'flex'; }
      else { if (topBtn) topBtn.style.display = 'none'; }
      if (scrollY < maxScroll - threshold) { buttons.classList.add('visible'); if (bottomBtn) bottomBtn.style.display = 'flex'; }
      else { if (bottomBtn) bottomBtn.style.display = 'none'; }
      if (scrollY <= threshold && scrollY >= maxScroll - threshold) buttons.classList.remove('visible');
      ticking = false;
    };
    window.addEventListener('scroll', () => {
      if (!ticking) { window.requestAnimationFrame(updateButtons); ticking = true; }
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

// ==========================================================================
// Font Awesome 回退检测
// ==========================================================================

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

// ==========================================================================
// 页脚管理器
// ==========================================================================

const FooterManager = {
  siteTime: '', siteUrl: '', author: '',
  uptimeColors: ['#E06050', '#E09040', '#E0A070', '#50C878', '#60A8D0', '#D08090'],
  _timer: null as ReturnType<typeof setInterval> | null,

  init(): void {
    if (!document.getElementById('footer-copyright')) return;
    const cfg = (window as any).siteConfig;
    if (!cfg) return;
    this.siteTime = cfg.siteTime || '';
    this.siteUrl = cfg.baseURL || '';
    this.author = cfg.author || '';
    this.updateFooter();
    this._timer = setInterval(() => this.updateFooter(), 1000);
  },

  updateFooter(): void {
    const now = new Date();
    const siteStart = new Date(this.siteTime);
    const currentYear = now.getFullYear();
    const siteUrl = this.siteUrl || '/';

    const copyrightEl = document.getElementById('footer-copyright');
    if (copyrightEl) {
      copyrightEl.innerHTML = `\u00A9 ${currentYear} <a href="${siteUrl}">${this.author}</a> \u535A\u5BA2 \u00B7 \u535A\u5BA2\u6240\u6709\u6743\u5F52\u4E8E <a href="${siteUrl}">${this.author}</a>`;
    }

    const poweredEl = document.getElementById('footer-powered');
    if (poweredEl) {
      poweredEl.innerHTML = `\u7531 <a href="https://gohugo.io" target="_blank" rel="noopener">Hugo</a> \u5F3A\u529B\u9A71\u52A8 \u00B7 \u4E3B\u9898\uFF1A<a href="https://github.com/aizexintong/illusion" target="_blank" rel="noopener">\u5E7B\u68A6 Illusion</a> \u00B7 \u4F5C\u8005\uFF1A<a href="https://github.com/aizexintong" target="_blank" rel="noopener">${this.author}</a>`;
    }

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

    const nums = [this.pad4(years), this.pad2(months), this.pad2(days), this.pad2(hours), this.pad2(minutes), this.pad2(seconds)];
    const seps = [
      '<span style="color:var(--c-text-subtle);margin:0 1px;">-</span>',
      '<span style="color:var(--c-text-subtle);margin:0 1px;">-</span>',
      '<span style="color:#D4B040;margin:0 1px;font-weight:var(--fw-bold);">T</span>',
      '<span style="color:var(--c-text-subtle);margin:0 1px;">:</span>',
      '<span style="color:var(--c-text-subtle);margin:0 1px;">:</span>'
    ];

    let html = `${I18n.t('js_uptime_label')} `;
    for (let i = 0; i < nums.length; i++) {
      if (i > 0) html += seps[i - 1];
      html += `<span style="color:${this.uptimeColors[i]};font-weight:var(--fw-semibold);font-variant-numeric:tabular-nums;">${nums[i]}</span>`;
    }
    displayEl.innerHTML = html;
  },

  pad2(n: number): string { return n < 10 ? '0' + n : String(n); },
  pad4(n: number): string { return String(n).padStart(4, '0'); }
};

// ==========================================================================
// 搜索引擎管理器
// ==========================================================================

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

// ==========================================================================
// 日历组件
// ==========================================================================

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

// ==========================================================================
// 归档导航器
// ==========================================================================

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

// ==========================================================================
// 导航链接点击特效
// ==========================================================================

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

// ==========================================================================
// 标签页分页管理器
// ==========================================================================

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
    if (this.totalPages <= 1) return;
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
    const startPage = Math.max(1, this.currentPage - 3);
    const endPage = Math.min(this.totalPages, this.currentPage + 3);
    if (startPage > 1) {
      this.addPageLink(pageNumbers, 1);
      if (startPage > 2) { const dots = document.createElement('span'); dots.className = 'page-link dots'; dots.textContent = '\u2026'; pageNumbers.appendChild(dots); }
    }
    for (let i = startPage; i <= endPage; i++) this.addPageLink(pageNumbers, i);
    if (endPage < this.totalPages) {
      if (endPage < this.totalPages - 1) { const dots = document.createElement('span'); dots.className = 'page-link dots'; dots.textContent = '\u2026'; pageNumbers.appendChild(dots); }
      this.addPageLink(pageNumbers, this.totalPages);
    }
  },

  addPageLink(container: HTMLElement, pageNum: number): void {
    const link = document.createElement('a');
    link.href = '#'; link.className = 'page-link';
    if (pageNum === this.currentPage) link.classList.add('current');
    link.textContent = String(pageNum);
    link.addEventListener('click', (e) => { e.preventDefault(); this.showPage(pageNum); });
    container.appendChild(link);
  },

  updateNavButtons(): void {
    const prevBtn = document.getElementById('page-prev') as HTMLElement;
    const nextBtn = document.getElementById('page-next') as HTMLElement;
    if (prevBtn) { prevBtn.style.pointerEvents = this.currentPage <= 1 ? 'none' : 'auto'; prevBtn.style.opacity = this.currentPage <= 1 ? '0.4' : '1'; }
    if (nextBtn) { nextBtn.style.pointerEvents = this.currentPage >= this.totalPages ? 'none' : 'auto'; nextBtn.style.opacity = this.currentPage >= this.totalPages ? '0.4' : '1'; }
  }
};

// ==========================================================================
// 主初始化函数
// ==========================================================================

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

  console.log('Illusion Theme v1.0.0 initialized');
}

// ==========================================================================
// 启动逻辑
// ==========================================================================

initIllusionTheme();

// 导出接口
(window as any).IllusionTheme = {
  ThemeManager, EffectsManager, AnimationManager,
  InteractionManager, EnhancementManager, UtilsManager,
  FontFallback, FooterManager, SearchEngine,
  CalendarWidget, ArchivesNavigator, NavClickEffect, TagsPagination
};

console.log('Illusion Theme v1.0.0 ready');

export {};