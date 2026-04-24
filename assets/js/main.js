/*
 * 幻梦 Illusion v2.2.0
 * 合并所有JS模块到单个文件
 * 包含：主题管理、特效管理、动画管理、交互管理、文档增强、通用功能
 */

// ==========================================================================
// 主题管理系统
// ==========================================================================

const ThemeManager = {
  config: {
    light: {
      name: 'light',
      icon: 'fas fa-sun',
      label: window.themeConfig?.lightLabel || '切换到深色模式'
    },
    dark: {
      name: 'dark',
      icon: 'fas fa-moon',
      label: window.themeConfig?.darkLabel || '切换到浅色模式'
    },
    system: {
      name: 'system',
      icon: 'fas fa-desktop',
      label: window.themeConfig?.systemLabel || '切换到手动模式'
    }
  },

  currentTheme: null,

  init() {
    this.setThemeImmediately();

    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => this.initToggle());
    } else {
      this.initToggle();
    }

    this.watchSystemTheme();
  },

  setThemeImmediately() {
    const savedTheme = localStorage.getItem('theme') || 'system';
    this.currentTheme = savedTheme;
    this.applyTheme(savedTheme);
  },

  applyTheme(theme) {
    let themeToApply = theme;

    if (theme === 'system') {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      themeToApply = prefersDark ? 'dark' : 'light';
    }

    document.documentElement.setAttribute('data-theme', themeToApply);
  },

  initToggle() {
    const toggleBtn = document.getElementById('theme-toggle');
    if (!toggleBtn) return;

    this.updateToggleButton(toggleBtn);

    toggleBtn.addEventListener('click', () => {
      this.cycleTheme();
      toggleBtn.style.transform = 'scale(0.9)';
      setTimeout(() => { toggleBtn.style.transform = ''; }, 150);
    });
  },

  cycleTheme() {
    const themes = ['system', 'light', 'dark'];
    const currentIndex = themes.indexOf(this.currentTheme);
    const nextIndex = (currentIndex + 1) % themes.length;
    const nextTheme = themes[nextIndex];
    this.setTheme(nextTheme);
  },

  setTheme(theme) {
    if (!this.config[theme]) return;

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

  updateAllToggleButtons() {
    document.querySelectorAll('#theme-toggle').forEach(btn => this.updateToggleButton(btn));
  },

  updateToggleButton(button) {
    if (!button) return;
    const config = this.config[this.currentTheme];
    const icon = button.querySelector('i');

    if (icon) {
      icon.className = config.icon;
      icon.setAttribute('aria-label', config.label);
    }
    button.setAttribute('title', config.label);
    button.setAttribute('aria-label', config.label);
  },

  watchSystemTheme() {
    if (!window.matchMedia) return;
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

    const handleChange = (e) => {
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
  canvas: null,
  ctx: null,
  particles: [],
  animationId: null,
  currentMode: null,
  isRunning: false,
  lastTime: 0,
  frameCount: 0,
  fps: 0,
  targetFPS: 60,
  frameInterval: 1000 / 60,
  performanceMultiplier: 1,
  offscreenCanvas: null,
  offscreenCtx: null,

  config: {
    candy: {
      ribbonCount: 20,
      candyCount: 12,
      heartCount: 5,
      starCount: 8,
      colors: ['#B3A0FF', '#9B84FF', '#FF9CB8', '#FF7A9E', '#6EE7B7', '#FCD34D', '#34D399', '#7D64FF', '#E83068', '#F59E0B'],
      candyColors: ['#B3A0FF', '#E83068', '#FCD34D', '#34D399', '#7D64FF', '#F59E0B', '#FF9CB8']
    },
    star: {
      count: 60,
      colors: ['#E8E4F5', '#E8C880', '#FFF0A0', '#D0B0FF', '#F0A0D8', '#C8A060'],
      minSize: 1,
      maxSize: 4
    },
    firefly: {
      count: 20,
      colors: ['#389068', '#50C878', '#70E0A0', '#98F0C0', '#50C878'],
      minSize: 1.5,
      maxSize: 3,
      glowSize: 8
    }
  },

  init() {
    if (this.isRunning) return;
    this.detectPerformance();
    this.createCanvas();
    this.createOffscreenCanvas();
    this.bindEvents();
    this.detectMode();
    this.isRunning = true;
  },

  detectPerformance() {
    const isLowEnd = navigator.hardwareConcurrency <= 2 || 
                     navigator.deviceMemory <= 2 ||
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

  createCanvas() {
    if (this.canvas) return;
    this.canvas = document.createElement('canvas');
    this.canvas.id = 'effects-canvas';
    this.canvas.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100vw;
      height: 100vh;
      pointer-events: none;
      z-index: -2;
      will-change: transform;
    `;
    const overlay = document.querySelector('.bg-overlay-layer');
    if (overlay && overlay.nextSibling) {
      document.body.insertBefore(this.canvas, overlay.nextSibling);
    } else {
      document.body.insertBefore(this.canvas, document.body.firstChild);
    }
    this.ctx = this.canvas.getContext('2d', { alpha: true });
    this.resize();
  },

  createOffscreenCanvas() {
    this.offscreenCanvas = document.createElement('canvas');
    this.offscreenCtx = this.offscreenCanvas.getContext('2d', { alpha: true });
  },

  resize() {
    if (!this.canvas) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    this.canvas.width = window.innerWidth * dpr;
    this.canvas.height = window.innerHeight * dpr;
    this.canvas.style.width = window.innerWidth + 'px';
    this.canvas.style.height = window.innerHeight + 'px';
    this.ctx.scale(dpr, dpr);
    
    if (this.offscreenCanvas) {
      this.offscreenCanvas.width = this.canvas.width;
      this.offscreenCanvas.height = this.canvas.height;
    }
  },

  bindEvents() {
    let resizeTimeout;
    window.addEventListener('resize', () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(() => this.resize(), 100);
    });

    const observer = new MutationObserver(() => this.detectMode());
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['data-theme']
    });
  },

  detectMode() {
    const theme = document.documentElement.getAttribute('data-theme');
    const isDark = theme === 'dark';

    if (isDark && this.currentMode !== 'night') {
      this.switchMode('night');
    } else if (!isDark && this.currentMode !== 'day') {
      this.switchMode('day');
    }
  },

  switchMode(mode) {
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
      this.animationId = null;
    }
    this.particles = [];
    this.shootingStars = [];
    this.currentMode = mode;

    if (mode === 'day') {
      this.initDayEffects();
    } else {
      this.initNightEffects();
    }

    this.lastTime = performance.now();
    this.animate();
  },

  initDayEffects() {
    const config = this.config.candy;
    for (let i = 0; i < config.ribbonCount; i++) this.particles.push(this.createRibbon(config));
    for (let i = 0; i < config.candyCount; i++) this.particles.push(this.createCandy(config));
    for (let i = 0; i < config.heartCount; i++) this.particles.push(this.createHeart(config));
    for (let i = 0; i < config.starCount; i++) this.particles.push(this.createDayStar(config));
  },

  createRibbon(config) {
    const depth = Math.random();
    return {
      type: 'ribbon',
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight * 2 - window.innerHeight,
      speed: 0.6 + depth * 1.5,
      color: config.colors[Math.floor(Math.random() * config.colors.length)],
      rotation: Math.random() * Math.PI * 2,
      rotationSpeed: (Math.random() - 0.5) * 0.06,
      wobble: Math.random() * Math.PI * 2,
      wobbleSpeed: 0.02 + Math.random() * 0.03,
      width: 4 + Math.random() * 6,
      height: 25 + Math.random() * 35,
      depth: depth
    };
  },

  createCandy(config) {
    const depth = Math.random();
    return {
      type: 'candy',
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight * 2 - window.innerHeight,
      speed: 0.5 + depth * 1.2,
      color: config.candyColors[Math.floor(Math.random() * config.candyColors.length)],
      stripeColor: config.candyColors[Math.floor(Math.random() * config.candyColors.length)],
      size: 8 + Math.random() * 12,
      rotation: Math.random() * Math.PI * 2,
      rotationSpeed: (Math.random() - 0.5) * 0.05,
      wobble: Math.random() * Math.PI * 2,
      wobbleSpeed: 0.015 + Math.random() * 0.02,
      depth: depth,
      candyType: Math.floor(Math.random() * 3)
    };
  },

  createHeart(config) {
    const depth = Math.random();
    const colors = ['#B3A0FF', '#9B84FF', '#FF9CB8', '#E83068'];
    return {
      type: 'heart',
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight * 2 - window.innerHeight,
      speed: 0.4 + depth * 0.8,
      color: colors[Math.floor(Math.random() * 4)],
      size: 6 + Math.random() * 10,
      rotation: (Math.random() - 0.5) * 0.3,
      wobble: Math.random() * Math.PI * 2,
      wobbleSpeed: 0.02 + Math.random() * 0.02,
      depth: depth,
      pulse: Math.random() * Math.PI * 2
    };
  },

  createDayStar(config) {
    const depth = Math.random();
    const colors = ['#FCD34D', '#F59E0B', '#9B84FF', '#FF9CB8'];
    return {
      type: 'dayStar',
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight * 2 - window.innerHeight,
      speed: 0.3 + depth * 0.7,
      color: colors[Math.floor(Math.random() * 4)],
      size: 5 + Math.random() * 8,
      rotation: Math.random() * Math.PI * 2,
      rotationSpeed: (Math.random() - 0.5) * 0.04,
      wobble: Math.random() * Math.PI * 2,
      wobbleSpeed: 0.01 + Math.random() * 0.02,
      depth: depth,
      points: 4 + Math.floor(Math.random() * 2)
    };
  },

  initNightEffects() {
    const starConfig = this.config.star;
    for (let i = 0; i < starConfig.count; i++) this.particles.push(this.createStar(starConfig));
    const fireflyConfig = this.config.firefly;
    for (let i = 0; i < fireflyConfig.count; i++) this.particles.push(this.createFirefly(fireflyConfig));
  },

  createStar(config) {
    return {
      type: 'star',
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight * 0.85,
      size: config.minSize + Math.random() * (config.maxSize - config.minSize),
      color: config.colors[Math.floor(Math.random() * config.colors.length)],
      twinkle: Math.random() * Math.PI * 2,
      twinkleSpeed: 0.015 + Math.random() * 0.04,
      hasRays: Math.random() > 0.5,
      rayLength: 2 + Math.random() * 5
    };
  },

  createFirefly(config) {
    const angle = Math.random() * Math.PI * 2;
    const speed = 0.3 + Math.random() * 0.8;
    return {
      type: 'firefly',
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      size: config.minSize + Math.random() * (config.maxSize - config.minSize),
      color: config.colors[Math.floor(Math.random() * config.colors.length)],
      glowSize: config.glowSize + Math.random() * 15,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      phase: Math.random() * Math.PI * 2,
      phaseSpeed: 0.03 + Math.random() * 0.05,
      wanderAngle: Math.random() * Math.PI * 2
    };
  },

  drawRibbon(p) {
    this.ctx.save();
    this.ctx.translate(p.x, p.y);
    this.ctx.rotate(p.rotation);
    const depthScale = 0.4 + p.depth * 0.6;
    this.ctx.globalAlpha = 0.6 + p.depth * 0.4;
    this.ctx.scale(depthScale, depthScale);
    const wave = Math.sin(p.wobble) * 4;
    const halfW = p.width / 2;
    const halfH = p.height / 2;
    this.ctx.beginPath();
    this.ctx.fillStyle = p.color;
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

  drawCandy(p) {
    this.ctx.save();
    this.ctx.translate(p.x, p.y);
    this.ctx.rotate(p.rotation);
    const depthScale = 0.5 + p.depth * 0.5;
    this.ctx.globalAlpha = 0.7 + p.depth * 0.3;
    this.ctx.scale(depthScale, depthScale);
    if (p.candyType === 0) {
      this.ctx.beginPath();
      this.ctx.arc(0, 0, p.size, 0, Math.PI * 2);
      this.ctx.fillStyle = p.color;
      this.ctx.fill();
      this.ctx.strokeStyle = p.stripeColor;
      this.ctx.lineWidth = 2;
      this.ctx.beginPath();
      this.ctx.arc(0, 0, p.size * 0.7, 0, Math.PI);
      this.ctx.stroke();
      this.ctx.beginPath();
      this.ctx.arc(-p.size * 0.3, -p.size * 0.3, p.size * 0.25, 0, Math.PI * 2);
      this.ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
      this.ctx.fill();
    } else if (p.candyType === 1) {
      this.ctx.fillStyle = '#E8D898';
      this.ctx.fillRect(-1.5, p.size, 3, p.size * 1.5);
      this.ctx.beginPath();
      this.ctx.arc(0, 0, p.size, 0, Math.PI * 2);
      this.ctx.fillStyle = p.color;
      this.ctx.fill();
      this.ctx.strokeStyle = p.stripeColor;
      this.ctx.lineWidth = 2;
      for (let i = 0; i < 3; i++) {
        this.ctx.beginPath();
        this.ctx.arc(0, 0, p.size * (0.4 + i * 0.2), 0, Math.PI * 1.5);
        this.ctx.stroke();
      }
    } else {
      this.ctx.beginPath();
      this.ctx.ellipse(0, 0, p.size * 1.5, p.size * 0.6, 0, 0, Math.PI * 2);
      this.ctx.fillStyle = p.color;
      this.ctx.fill();
      this.ctx.strokeStyle = p.stripeColor;
      this.ctx.lineWidth = 2;
      this.ctx.beginPath();
      this.ctx.moveTo(-p.size * 1.2, 0);
      this.ctx.quadraticCurveTo(-p.size * 0.5, -p.size * 0.5, 0, 0);
      this.ctx.quadraticCurveTo(p.size * 0.5, p.size * 0.5, p.size * 1.2, 0);
      this.ctx.stroke();
      this.ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
      this.ctx.beginPath();
      this.ctx.ellipse(-p.size * 0.5, -p.size * 0.2, p.size * 0.4, p.size * 0.2, -0.3, 0, Math.PI * 2);
      this.ctx.fill();
    }
    this.ctx.restore();
  },

  drawHeart(p) {
    this.ctx.save();
    this.ctx.translate(p.x, p.y);
    this.ctx.rotate(p.rotation);
    const depthScale = 0.5 + p.depth * 0.5;
    const pulseScale = 1 + Math.sin(p.pulse) * 0.1;
    this.ctx.globalAlpha = 0.6 + p.depth * 0.4;
    this.ctx.scale(depthScale * pulseScale, depthScale * pulseScale);
    const size = p.size;
    this.ctx.beginPath();
    this.ctx.moveTo(0, size * 0.3);
    this.ctx.bezierCurveTo(-size, -size * 0.3, -size, -size, 0, -size * 0.5);
    this.ctx.bezierCurveTo(size, -size, size, -size * 0.3, 0, size * 0.3);
    this.ctx.fillStyle = p.color;
    this.ctx.fill();
    this.ctx.beginPath();
    this.ctx.ellipse(-size * 0.3, -size * 0.4, size * 0.2, size * 0.15, -0.5, 0, Math.PI * 2);
    this.ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
    this.ctx.fill();
    this.ctx.restore();
  },

  drawDayStar(p) {
    this.ctx.save();
    this.ctx.translate(p.x, p.y);
    this.ctx.rotate(p.rotation);
    const depthScale = 0.5 + p.depth * 0.5;
    this.ctx.globalAlpha = 0.6 + p.depth * 0.4;
    this.ctx.scale(depthScale, depthScale);
    const spikes = p.points;
    const outerRadius = p.size;
    const innerRadius = p.size * 0.5;
    this.ctx.beginPath();
    for (let i = 0; i < spikes * 2; i++) {
      const radius = i % 2 === 0 ? outerRadius : innerRadius;
      const angle = (i * Math.PI) / spikes - Math.PI / 2;
      const x = Math.cos(angle) * radius;
      const y = Math.sin(angle) * radius;
      if (i === 0) this.ctx.moveTo(x, y);
      else this.ctx.lineTo(x, y);
    }
    this.ctx.closePath();
    this.ctx.fillStyle = p.color;
    this.ctx.fill();
    this.ctx.beginPath();
    this.ctx.arc(-p.size * 0.2, -p.size * 0.2, p.size * 0.2, 0, Math.PI * 2);
    this.ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
    this.ctx.fill();
    this.ctx.restore();
  },

  drawStar(p) {
    const twinkleValue = Math.sin(p.twinkle);
    const alpha = 0.15 + (twinkleValue * 0.5 + 0.5) * 0.85;
    const sizeMultiplier = 0.6 + (twinkleValue * 0.5 + 0.5) * 0.6;
    const currentSize = p.size * sizeMultiplier;
    this.ctx.save();
    this.ctx.globalAlpha = alpha;
    const glowSize = currentSize * (3 + twinkleValue * 2);
    const gradient = this.ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, glowSize);
    gradient.addColorStop(0, p.color);
    gradient.addColorStop(0.2, p.color + 'C0');
    gradient.addColorStop(0.5, p.color + '50');
    gradient.addColorStop(1, 'transparent');
    this.ctx.fillStyle = gradient;
    this.ctx.beginPath();
    this.ctx.arc(p.x, p.y, glowSize, 0, Math.PI * 2);
    this.ctx.fill();
    this.ctx.fillStyle = '#FFFFFF';
    this.ctx.beginPath();
    this.ctx.arc(p.x, p.y, currentSize, 0, Math.PI * 2);
    this.ctx.fill();
    if (p.hasRays) {
      const rayLen = p.rayLength * currentSize * (0.7 + twinkleValue * 0.5);
      this.ctx.strokeStyle = p.color;
      this.ctx.lineWidth = 0.8;
      this.ctx.globalAlpha = alpha * 0.7;
      this.ctx.beginPath();
      this.ctx.moveTo(p.x - rayLen, p.y);
      this.ctx.lineTo(p.x + rayLen, p.y);
      this.ctx.moveTo(p.x, p.y - rayLen);
      this.ctx.lineTo(p.x, p.y + rayLen);
      this.ctx.stroke();
    }
    this.ctx.restore();
  },

  drawFirefly(p) {
    const glow = 0.4 + Math.sin(p.phase) * 0.4 + 0.2;
    this.ctx.save();
    const smallGlow = p.size * 3;
    const gradient = this.ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, smallGlow);
    gradient.addColorStop(0, p.color);
    gradient.addColorStop(0.4, p.color + 'A0');
    gradient.addColorStop(1, 'transparent');
    this.ctx.globalAlpha = glow * 0.8;
    this.ctx.fillStyle = gradient;
    this.ctx.beginPath();
    this.ctx.arc(p.x, p.y, smallGlow, 0, Math.PI * 2);
    this.ctx.fill();
    this.ctx.globalAlpha = glow;
    this.ctx.fillStyle = '#FFFFF0';
    this.ctx.beginPath();
    this.ctx.arc(p.x, p.y, p.size * 0.5, 0, Math.PI * 2);
    this.ctx.fill();
    this.ctx.restore();
  },

  updateDayParticle(p) {
    const depthSpeed = 0.4 + p.depth * 0.6;
    p.y += p.speed * depthSpeed;
    p.wobble += p.wobbleSpeed;
    p.x += Math.sin(p.wobble) * 0.8;
    if (p.rotation !== undefined) p.rotation += p.rotationSpeed || 0;
    if (p.pulse !== undefined) p.pulse += 0.05;
    if (p.y > window.innerHeight + 50) {
      p.y = -50;
      p.x = Math.random() * window.innerWidth;
    }
  },

  updateNightParticle(p) {
    if (p.type === 'star') {
      p.twinkle += p.twinkleSpeed;
    } else if (p.type === 'firefly') {
      p.phase += p.phaseSpeed;
      p.wanderAngle += (Math.random() - 0.5) * 0.15;
      p.vx += Math.cos(p.wanderAngle) * 0.03;
      p.vy += Math.sin(p.wanderAngle) * 0.03;
      const maxSpeed = 1.2;
      const speed = Math.sqrt(p.vx * p.vx + p.vy * p.vy);
      if (speed > maxSpeed) {
        p.vx = (p.vx / speed) * maxSpeed;
        p.vy = (p.vy / speed) * maxSpeed;
      }
      p.x += p.vx;
      p.y += p.vy;
      if (p.x < -p.glowSize) p.x = window.innerWidth + p.glowSize;
      if (p.x > window.innerWidth + p.glowSize) p.x = -p.glowSize;
      if (p.y < -p.glowSize) p.y = window.innerHeight + p.glowSize;
      if (p.y > window.innerHeight + p.glowSize) p.y = -p.glowSize;
    }
  },

  // 流星效果
  shootingStars: [],
  lastShootingStarTime: 0,

  createShootingStar() {
    const startX = Math.random() * window.innerWidth;
    const startY = Math.random() * window.innerHeight * 0.5;
    const angle = Math.PI / 4 + (Math.random() - 0.5) * 0.5;
    const speed = 8 + Math.random() * 6;
    return {
      x: startX,
      y: startY,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      length: 80 + Math.random() * 60,
      life: 1,
      decay: 0.015 + Math.random() * 0.01,
      width: 1.5 + Math.random() * 1
    };
  },

  updateShootingStars() {
    if (this.currentMode !== 'night') return;
    
    const now = Date.now();
    if (now - this.lastShootingStarTime > 4000 + Math.random() * 6000) {
      this.shootingStars.push(this.createShootingStar());
      this.lastShootingStarTime = now;
    }
    
    for (let i = this.shootingStars.length - 1; i >= 0; i--) {
      const star = this.shootingStars[i];
      star.x += star.vx;
      star.y += star.vy;
      star.life -= star.decay;
      
      if (star.life <= 0 || star.x > window.innerWidth + 100 || star.y > window.innerHeight + 100) {
        this.shootingStars.splice(i, 1);
      }
    }
  },

  drawShootingStars() {
    for (const star of this.shootingStars) {
      this.ctx.save();
      this.ctx.globalAlpha = star.life;
      
      const gradient = this.ctx.createLinearGradient(
        star.x, star.y,
        star.x - star.vx * 0.1 * star.length / 8,
        star.y - star.vy * 0.1 * star.length / 8
      );
      gradient.addColorStop(0, 'rgba(255, 255, 255, 1)');
      gradient.addColorStop(0.3, 'rgba(208, 176, 255, 0.8)');
      gradient.addColorStop(1, 'transparent');
      
      this.ctx.strokeStyle = gradient;
      this.ctx.lineWidth = star.width;
      this.ctx.lineCap = 'round';
      this.ctx.beginPath();
      this.ctx.moveTo(star.x, star.y);
      this.ctx.lineTo(
        star.x - star.vx * 0.1 * star.length / 8,
        star.y - star.vy * 0.1 * star.length / 8
      );
      this.ctx.stroke();
      
      // 星头光晕
      const headGradient = this.ctx.createRadialGradient(star.x, star.y, 0, star.x, star.y, 4);
      headGradient.addColorStop(0, 'rgba(255, 255, 255, 0.9)');
      headGradient.addColorStop(1, 'transparent');
      this.ctx.fillStyle = headGradient;
      this.ctx.beginPath();
      this.ctx.arc(star.x, star.y, 4, 0, Math.PI * 2);
      this.ctx.fill();
      
      this.ctx.restore();
    }
  },

  animate(currentTime) {
    if (!this.ctx || !this.canvas) return;
    
    const deltaTime = currentTime - this.lastTime;
    
    if (deltaTime < this.frameInterval) {
      this.animationId = requestAnimationFrame((t) => this.animate(t));
      return;
    }
    
    this.lastTime = currentTime - (deltaTime % this.frameInterval);
    
    this.ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
    
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
    
    // 绘制流星
    this.updateShootingStars();
    this.drawShootingStars();
    
    this.animationId = requestAnimationFrame((t) => this.animate(t));
  },

  destroy() {
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
      this.animationId = null;
    }
    if (this.canvas) {
      this.canvas.remove();
      this.canvas = null;
    }
    if (this.offscreenCanvas) {
      this.offscreenCanvas = null;
      this.offscreenCtx = null;
    }
    this.particles = [];
    this.shootingStars = [];
    this.isRunning = false;
  }
};

// ==========================================================================
// 动画效果管理器
// ==========================================================================

const AnimationManager = {
  init() {
    this.initAOS();
    this.initScrollProgress();
    this.initSkillBars();
    this.initTypedJS();
    
    // Safety mechanism: ensure all data-aos elements become visible after timeout
    this.ensureVisibility();
  },

  ensureVisibility() {
    setTimeout(() => {
      const hiddenElements = document.querySelectorAll('[data-aos]:not(.aos-animate)');
      if (hiddenElements.length > 0) {
        hiddenElements.forEach(el => {
          if (getComputedStyle(el).opacity === '0') {
            el.style.opacity = '1';
            el.style.transform = 'none';
            el.style.transition = 'none';
          }
        });
      }
    }, 2000);
  },

  initAOS() {
    if (typeof AOS !== 'undefined') {
      AOS.init({
        duration: 400,
        easing: 'ease-out-cubic',
        once: true,
        offset: 80,
        delay: 50,
        disable: window.matchMedia('(prefers-reduced-motion: reduce)').matches
      });
    } else {
      // AOS not loaded yet, retry after a short delay
      setTimeout(() => {
        if (typeof AOS !== 'undefined') {
          AOS.init({
            duration: 400,
            easing: 'ease-out-cubic',
            once: true,
            offset: 80,
            delay: 50,
            disable: window.matchMedia('(prefers-reduced-motion: reduce)').matches
          });
        } else {
          // AOS still not available, use custom scroll animations
          this.initScrollAnimations();
        }
      }, 500);
    }
  },

  initScrollProgress() {
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

  initSkillBars() {
    const skillBars = document.querySelectorAll('.skill-progress[data-level]');
    if (skillBars.length === 0) return;
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const bar = entry.target;
          const level = bar.getAttribute('data-level');
          bar.style.willChange = 'width';
          bar.style.width = `${level}%`;
          bar.style.opacity = '1';
          setTimeout(() => {
            bar.style.willChange = 'auto';
          }, 1500);
          observer.unobserve(bar);
        }
      });
    }, { threshold: 0.3 });
    skillBars.forEach(bar => {
      bar.style.width = '0%';
      bar.style.opacity = '0.3';
      bar.style.transition = 'width 1s ease-out, opacity 0.5s ease-out';
      observer.observe(bar);
    });
  },

  initTypedJS() {
    const typedElements = document.querySelectorAll('.typed-text');
    if (typedElements.length === 0) return;
    if (typeof Typed !== 'undefined') {
      this.initTypedElements(typedElements);
    } else {
      // Typed.js not loaded yet, retry after a short delay
      setTimeout(() => {
        if (typeof Typed !== 'undefined') {
          this.initTypedElements(typedElements);
        } else {
          console.warn('Typed.js未加载，跳过打字机效果');
        }
      }, 500);
    }
  },

  initTypedElements(elements) {
    elements.forEach(el => {
      try {
        const data = JSON.parse(el.getAttribute('data-typed') || '[]');
        new Typed(el, {
          strings: data,
          typeSpeed: 60,
          backSpeed: 40,
          backDelay: 2000,
          startDelay: 500,
          loop: true,
          showCursor: true,
          cursorChar: '|'
        });
      } catch (e) {
        console.warn('Typed.js初始化失败:', e);
      }
    });
  },

  initScrollAnimations() {
    const animatedElements = document.querySelectorAll('[data-aos]');
    if (animatedElements.length === 0) return;
    
    // Set initial styles for all animated elements
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
          const el = entry.target;
          const delay = parseInt(el.getAttribute('data-aos-delay') || '0');
          setTimeout(() => {
            el.style.opacity = '1';
            el.style.transform = 'none';
            el.classList.add('aos-animate');
            setTimeout(() => {
              el.style.willChange = 'auto';
            }, 500);
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
  init() {
    this.initMobileMenu();
    this.initSmoothScroll();
    this.initLazyLoad();
    this.initTouchInteractions();
    this.initKeyboardNavigation();
    this.initHeaderScroll();
    this.initSearch();
    this.initCardHover();
  },

  initMobileMenu() {
    const menuToggle = document.querySelector('.mobile-menu-toggle');
    const menuClose = document.querySelector('.mobile-menu-close');
    const menu = document.querySelector('.mobile-menu');
    const overlay = document.querySelector('.mobile-menu-overlay');
    if (!menuToggle || !menu) return;
    const openMenu = () => {
      menu.classList.add('active');
      overlay?.classList.add('active');
      document.body.style.overflow = 'hidden';
    };
    const closeMenu = () => {
      menu.classList.remove('active');
      overlay?.classList.remove('active');
      document.body.style.overflow = '';
    };
    menuToggle.addEventListener('click', openMenu);
    menuClose?.addEventListener('click', closeMenu);
    overlay?.addEventListener('click', closeMenu);
    menu.querySelectorAll('a').forEach(link => link.addEventListener('click', closeMenu));
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && menu.classList.contains('active')) closeMenu();
    });
  },

  initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
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

  initLazyLoad() {
    const images = document.querySelectorAll('img[data-src]');
    if (!images.length) return;
    const imageObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const img = entry.target;
          img.src = img.dataset.src;
          img.removeAttribute('data-src');
          imageObserver.unobserve(img);
        }
      });
    });
    images.forEach(img => imageObserver.observe(img));
  },

  initTouchInteractions() {
    if (!('ontouchstart' in window || navigator.maxTouchPoints > 0)) return;
    document.body.classList.add('touch-device');
    const touchElements = document.querySelectorAll('.btn, .card, .post-card, .skill-item');
    touchElements.forEach(el => {
      el.addEventListener('touchstart', function() { this.classList.add('touch-active'); }, { passive: true });
      el.addEventListener('touchend', function() { this.classList.remove('touch-active'); }, { passive: true });
    });
  },

  initKeyboardNavigation() {
    const skipLink = document.createElement('a');
    skipLink.href = '#main';
    skipLink.className = 'skip-link';
    skipLink.textContent = '跳转到主要内容';
    document.body.insertBefore(skipLink, document.body.firstChild);
  },

  initHeaderScroll() {
    const header = document.querySelector('.site-header');
    if (!header) return;
    let lastScroll = 0;
    window.addEventListener('scroll', () => {
      const currentScroll = window.pageYOffset;
      if (currentScroll > 50) header.classList.add('scrolled');
      else header.classList.remove('scrolled');
      lastScroll = currentScroll;
    }, { passive: true });
  },

  initSearch() {
    const searchToggle = document.querySelector('.search-toggle');
    const searchModal = document.getElementById('search-modal');
    const searchClose = searchModal?.querySelector('.search-close');
    const searchInput = searchModal?.querySelector('input[type="search"]');
    if (!searchToggle || !searchModal) return;
    const openSearch = () => {
      searchModal.classList.add('active');
      searchInput?.focus();
      document.body.style.overflow = 'hidden';
    };
    const closeSearch = () => {
      searchModal.classList.remove('active');
      document.body.style.overflow = '';
    };
    searchToggle.addEventListener('click', openSearch);
    searchClose?.addEventListener('click', closeSearch);
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && searchModal.classList.contains('active')) closeSearch();
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        if (searchModal.classList.contains('active')) closeSearch();
        else openSearch();
      }
    });
    searchModal.addEventListener('click', (e) => {
      if (e.target === searchModal) closeSearch();
    });
  },

  initCardHover() {
    const cards = document.querySelectorAll('.card, .post-card, .skill-item, .link-card');
    cards.forEach(card => {
      let rafId = null;
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
          card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`;
        });
      });
      card.addEventListener('mouseleave', () => {
        if (rafId) cancelAnimationFrame(rafId);
        card.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) scale3d(1, 1, 1)';
      });
    });
  }
};

// ==========================================================================
// Markdown文档增强管理器
// ==========================================================================

const EnhancementManager = {
  init() {
    this.enhanceCodeBlocks();
    this.enhanceTables();
    this.enhanceBlockquotes();
    this.addHeadingAnchors();
  },

  enhanceCodeBlocks() {
    const codeBlocks = document.querySelectorAll('.highlight');
    codeBlocks.forEach((highlight) => {
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
      copyBtn.setAttribute('aria-label', '复制代码');
      copyBtn.innerHTML = '<i class="fas fa-copy"></i><span>复制</span>';
      highlight.appendChild(copyBtn);
      copyBtn.addEventListener('click', async () => {
        const codeText = code.textContent;
        try {
          await navigator.clipboard.writeText(codeText);
          copyBtn.innerHTML = '<i class="fas fa-check"></i><span>已复制</span>';
          copyBtn.classList.add('copied');
          setTimeout(() => {
            copyBtn.innerHTML = '<i class="fas fa-copy"></i><span>复制</span>';
            copyBtn.classList.remove('copied');
          }, 2000);
        } catch (err) {
          const textarea = document.createElement('textarea');
          textarea.value = codeText;
          textarea.style.position = 'fixed';
          textarea.style.opacity = '0';
          document.body.appendChild(textarea);
          textarea.select();
          document.execCommand('copy');
          document.body.removeChild(textarea);
          copyBtn.innerHTML = '<i class="fas fa-check"></i><span>已复制</span>';
          copyBtn.classList.add('copied');
          setTimeout(() => {
            copyBtn.innerHTML = '<i class="fas fa-copy"></i><span>复制</span>';
            copyBtn.classList.remove('copied');
          }, 2000);
        }
      });
    });
  },

  enhanceTables() {
    const tables = document.querySelectorAll('.article-text table');
    tables.forEach(table => {
      if (table.parentNode.classList.contains('table-wrapper')) return;
      const wrapper = document.createElement('div');
      wrapper.className = 'table-wrapper';
      wrapper.style.overflowX = 'auto';
      wrapper.style.margin = '1.5rem 0';
      table.parentNode.insertBefore(wrapper, table);
      wrapper.appendChild(table);
    });
  },

  enhanceBlockquotes() {
    const blockquotes = document.querySelectorAll('.article-text blockquote');
    blockquotes.forEach(quote => {
      const text = quote.textContent.trim();
      if (text.startsWith('💡')) quote.classList.add('callout', 'callout-info');
      else if (text.startsWith('⚠️')) quote.classList.add('callout', 'callout-warning');
      else if (text.startsWith('📝')) quote.classList.add('callout', 'callout-note');
      else if (text.startsWith('❌')) quote.classList.add('callout', 'callout-error');
    });
  },

  addHeadingAnchors() {
    const headings = document.querySelectorAll('.article-text h2, .article-text h3');
    headings.forEach(heading => {
      if (!heading.id) {
        const id = heading.textContent
          .toLowerCase()
          .replace(/[^\w\u4e00-\u9fa5]+/g, '-')
          .replace(/^-+|-+$/g, '');
        heading.id = id || `heading-${Math.random().toString(36).substr(2, 9)}`;
      }
      const anchor = document.createElement('a');
      anchor.className = 'heading-anchor';
      anchor.href = `#${heading.id}`;
      anchor.innerHTML = '<i class="fas fa-link"></i>';
      anchor.setAttribute('aria-label', '链接到此标题');
      heading.appendChild(anchor);
    });
  }
};

// ==========================================================================
// 通用功能管理器（滚动按钮、图片灯箱、TOC高亮、点击效果）
// ==========================================================================

const UtilsManager = {
  init() {
    this.initScrollButtons();
    this.initImageLightbox();
    this.initTOCHighlight();
    this.initClickEffect();
  },

  initScrollButtons() {
    const buttons = document.getElementById('scroll-buttons');
    if (!buttons) return;
    const topBtn = buttons.querySelector('.scroll-to-top');
    const bottomBtn = buttons.querySelector('.scroll-to-bottom');
    topBtn?.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
    bottomBtn?.addEventListener('click', () => {
      window.scrollTo({ top: document.documentElement.scrollHeight, behavior: 'smooth' });
    });
    const updateButtons = () => {
      const scrollY = window.scrollY;
      const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
      const threshold = 300;
      if (scrollY > threshold) {
        buttons.classList.add('visible');
        if (topBtn) topBtn.style.display = 'flex';
      } else {
        if (topBtn) topBtn.style.display = 'none';
      }
      if (scrollY < maxScroll - threshold) {
        buttons.classList.add('visible');
        if (bottomBtn) bottomBtn.style.display = 'flex';
      } else {
        if (bottomBtn) bottomBtn.style.display = 'none';
      }
      if (scrollY <= threshold && scrollY >= maxScroll - threshold) {
        buttons.classList.remove('visible');
      }
    };
    window.addEventListener('scroll', updateButtons, { passive: true });
    updateButtons();
  },

  initImageLightbox() {
    const lightbox = document.getElementById('img-lightbox');
    const lightboxImg = document.getElementById('img-lightbox-img');
    const closeBtn = lightbox?.querySelector('.img-lightbox-close');
    if (!lightbox || !lightboxImg) return;
    const closeLightbox = () => {
      lightbox.classList.remove('active');
      document.body.style.overflow = '';
    };
    lightbox.addEventListener('click', (e) => {
      if (e.target === lightbox) closeLightbox();
    });
    closeBtn?.addEventListener('click', closeLightbox);
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') closeLightbox();
    });
    const contentImages = document.querySelectorAll('.article-text img');
    contentImages.forEach(img => {
      img.addEventListener('click', () => {
        lightboxImg.src = img.src;
        lightboxImg.alt = img.alt || '';
        lightbox.classList.add('active');
        document.body.style.overflow = 'hidden';
      });
    });
  },

  initTOCHighlight() {
    const tocLinks = document.querySelectorAll('.toc-body a');
    if (tocLinks.length === 0) return;
    const headings = [];
    tocLinks.forEach(link => {
      const href = link.getAttribute('href');
      if (href && href.startsWith('#')) {
        const id = href.substring(1);
        const heading = document.getElementById(id);
        if (heading) headings.push({ element: heading, link: link });
      }
    });
    const updateActiveTOC = () => {
      let current = headings[0];
      const scrollTop = window.scrollY + 100;
      headings.forEach(item => {
        if (item.element.offsetTop <= scrollTop) current = item;
      });
      tocLinks.forEach(link => link.classList.remove('active'));
      if (current) current.link.classList.add('active');
    };
    window.addEventListener('scroll', updateActiveTOC, { passive: true });
    updateActiveTOC();
  },

  initClickEffect() {
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
      const x = e.clientX;
      const y = e.clientY;
      const effect = document.createElement('div');
      effect.className = 'click-effect';
      effect.style.cssText = `
        position: fixed;
        left: ${x}px;
        top: ${y}px;
        width: 200px;
        height: 200px;
        border-radius: 50%;
        background: radial-gradient(circle, var(--c-primary-400) 0%, transparent 70%);
        transform: translate(-50%, -50%) scale(0);
        pointer-events: none;
        z-index: 10000;
        animation: clickRipple 0.5s ease-out forwards;
        will-change: transform, opacity;
      `;
      document.body.appendChild(effect);
      setTimeout(() => effect.remove(), 500);
    });
  }
};

// ==========================================================================
// 主初始化函数
// ==========================================================================

function initIllusionTheme() {
  // Prevent multiple initializations
  if (window.IllusionThemeInitialized) return;
  window.IllusionThemeInitialized = true;

  // 1. 初始化主题管理系统
  ThemeManager.init();
  
  // 2. 初始化通用交互功能 (不依赖外部库)
  UtilsManager.init();
  
  // 3. 初始化增强功能 (不依赖外部库)
  EnhancementManager.init();

  // 4. 初始化动画和特效 (依赖外部库，需要确保它们已加载)
  AnimationManager.init();
  
  // 只有在用户没有开启减少动画偏好时才初始化特效
  if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    EffectsManager.init();
  }
  
  InteractionManager.init();

  // 5. 确保某些延迟加载功能在 DOMContentLoaded 后运行
  document.addEventListener('DOMContentLoaded', () => {
    // 技能进度条需要等待DOM渲染
    setTimeout(() => {
      AnimationManager.initSkillBars();
    }, 500);
  });

  console.log('幻梦主题 v2.2.0 初始化完成');
}

// ==========================================================================
// 启动逻辑优化：使用 window.onload 确保所有脚本都已加载
// ==========================================================================
window.addEventListener('load', initIllusionTheme);

// 保留 DOMContentLoaded 监听器作为备用，但主要逻辑现在依赖 window.onload
document.addEventListener('DOMContentLoaded', () => {
  // 如果 window.onload 尚未触发 (极少见)，则调用
  if (!window.IllusionThemeInitialized) {
      initIllusionTheme();
      window.IllusionThemeInitialized = true;
  }
});

// 导出接口 (保持不变)
window.IllusionTheme = {
  ThemeManager,
  EffectsManager,
  AnimationManager,
  InteractionManager,
  EnhancementManager,
  UtilsManager
};

console.log('幻梦主题 v2.2.0 启动逻辑已切换至 window.onload.');