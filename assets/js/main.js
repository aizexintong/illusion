// 爱则心痛主题 - 炫技动画效果
document.addEventListener('DOMContentLoaded', function() {
  // 初始化AOS滚动动画
  AOS.init({
    duration: 1000,
    once: true,
    offset: 100
  });

  // 初始化简约粒子背景
  if (typeof particlesJS !== 'undefined') {
    particlesJS('particles-js', {
      particles: {
        number: { value: 40, density: { enable: true, value_area: 800 } },
        color: { value: ["#8a4b5a", "#7a6a5f", "#5b7e91"] },
        shape: { type: "circle" },
        opacity: { value: 0.3, random: true },
        size: { value: 2.5, random: true },
        line_linked: {
          enable: true,
          distance: 150,
          color: "#8a4b5a",
          opacity: 0.15,
          width: 1
        },
        move: {
          enable: true,
          speed: 1.2,
          direction: "none",
          random: true,
          straight: false,
          out_mode: "out",
          bounce: false
        }
      },
      interactivity: {
        detect_on: "canvas",
        events: {
          onhover: { enable: true, mode: "grab" },
          onclick: { enable: false, mode: "push" }
        }
      }
    });
  }

  // 打字机效果
  const typedElements = document.querySelectorAll('.typed-text');
  typedElements.forEach(element => {
    if (element.dataset.typed) {
      const strings = JSON.parse(element.dataset.typed);
      new Typed(element, {
        strings: strings,
        typeSpeed: 50,
        backSpeed: 30,
        backDelay: 1500,
        loop: true,
        showCursor: true,
        cursorChar: '|'
      });
    }
  });

  // 技能条动画
  const skillBars = document.querySelectorAll('.skill-progress');
  const observerOptions = {
    threshold: 0.5
  };

  const skillObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const skillBar = entry.target;
        const level = skillBar.dataset.level || '0';
        skillBar.style.width = level + '%';
        skillBar.classList.add('animated');
      }
    });
  }, observerOptions);

  skillBars.forEach(bar => {
    skillObserver.observe(bar);
    bar.style.width = '0%';
  });

  // 浮动元素
  createFloatingElements();

  // 滚动进度条
  initScrollProgress();

  // 主题切换
  initThemeToggle();
  
  // 键盘导航支持
  initKeyboardNavigation();
  
  // 可访问性增强
  initAccessibility();

  // 图片懒加载
  initLazyLoad();

  // 平滑滚动
  initSmoothScroll();

  // 移动端菜单和触摸交互
  initMobileMenu();
  
  // 触摸交互优化
  initTouchInteractions();

  // 核心动画效果
  initCoreEffects();
});

// 核心动画效果
function initCoreEffects() {
  // 卡片悬停效果
  initCardEffects();
  
  // 简约背景动画
  initBackgroundEffects();
  
  // 性能检测，低端设备减少动画
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    return;
  }
  
  // 只在性能允许时添加点击效果
  if (navigator.hardwareConcurrency && navigator.hardwareConcurrency > 2) {
    initClickEffects();
  }
}

// 简约鼠标点击效果
function initClickEffects() {
  document.addEventListener('click', function(e) {
    // 只在按钮和主要交互元素上显示点击效果
    if (!e.target.closest('button, .btn, .card')) return;
    
    const ripple = document.createElement('div');
    ripple.style.position = 'fixed';
    ripple.style.width = '8px';
    ripple.style.height = '8px';
    ripple.style.borderRadius = '50%';
    ripple.style.background = 'var(--primary)';
    ripple.style.pointerEvents = 'none';
    ripple.style.zIndex = '9999';
    ripple.style.left = e.clientX - 4 + 'px';
    ripple.style.top = e.clientY - 4 + 'px';
    ripple.style.transform = 'scale(0)';
    ripple.style.opacity = '0.3';
    
    document.body.appendChild(ripple);
    
    const animation = ripple.animate([
      { transform: 'scale(0)', opacity: 0.3 },
      { transform: 'scale(1.5)', opacity: 0 }
    ], {
      duration: 300,
      easing: 'ease-out'
    });
    
    animation.onfinish = () => ripple.remove();
  });
}

// 移除滚动视差效果以提升性能

// 简约卡片悬停效果
function initCardEffects() {
  const cards = document.querySelectorAll('.card, .post-card, .skill-item');
  
  cards.forEach(card => {
    card.addEventListener('mouseenter', () => {
      card.style.transform = 'translateY(-4px)';
    });
    
    card.addEventListener('mouseleave', () => {
      card.style.transform = 'translateY(0)';
    });
  });
}

// 移除复杂文字动画以提升性能

// 简约背景动画效果
function initBackgroundEffects() {
  // 使用CSS变量实现简约背景渐变
  const style = document.createElement('style');
  style.textContent = `
    body::after {
      content: '';
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: linear-gradient(45deg, 
        rgba(138, 75, 90, 0.015) 0%, 
        rgba(122, 106, 95, 0.015) 50%, 
        rgba(91, 126, 145, 0.015) 100%
      );
      background-size: 200% 200%;
      animation: subtleGradient 60s ease infinite;
      pointer-events: none;
      z-index: -1;
      opacity: 0.5;
    }
    
    @keyframes subtleGradient {
      0%, 100% { background-position: 0% 50%; }
      50% { background-position: 100% 50%; }
    }
  `;
  document.head.appendChild(style);
}

// 移动端菜单功能
function initMobileMenu() {
  const toggleBtn = document.querySelector('.mobile-menu-toggle');
  const closeBtn = document.querySelector('.mobile-menu-close');
  const mobileMenu = document.querySelector('.mobile-menu');
  const overlay = document.querySelector('.mobile-menu-overlay');

  if (toggleBtn && mobileMenu) {
    toggleBtn.addEventListener('click', () => {
      mobileMenu.classList.add('active');
      overlay.classList.add('active');
      document.body.style.overflow = 'hidden';
    });

    closeBtn.addEventListener('click', closeMobileMenu);
    overlay.addEventListener('click', closeMobileMenu);

    // 点击菜单链接关闭菜单
    mobileMenu.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', closeMobileMenu);
    });
  }

  function closeMobileMenu() {
    mobileMenu.classList.remove('active');
    overlay.classList.remove('active');
    document.body.style.overflow = '';
  }
}

// 创建简约浮动元素
function createFloatingElements() {
  const colors = ['#8a4b5a', '#7a6a5f', '#5b7e91'];
  const container = document.querySelector('main') || document.body;
  
  // 进一步减少数量，降低性能消耗
  for (let i = 0; i < 2; i++) {
    const element = document.createElement('div');
    element.className = 'floating-element';
    element.style.width = '50px';
    element.style.height = '50px';
    element.style.background = colors[Math.floor(Math.random() * colors.length)];
    element.style.opacity = '0.02';
    element.style.left = Math.random() * 100 + '%';
    element.style.top = Math.random() * 100 + '%';
    element.style.animationDuration = '60s';
    element.style.animationDelay = Math.random() * 15 + 's';
    
    container.appendChild(element);
  }
}



// 滚动进度条
function initScrollProgress() {
  const progressBar = document.createElement('div');
  progressBar.className = 'scroll-progress';
  document.body.appendChild(progressBar);

  const style = document.createElement('style');
  style.textContent = `
    .scroll-progress {
      position: fixed;
      top: 0;
      left: 0;
      width: 0%;
      height: 2px;
      background: var(--gradient);
      z-index: 1001;
      transition: width 0.1s;
      opacity: 0.8;
    }
  `;
  document.head.appendChild(style);

  window.addEventListener('scroll', () => {
    const winScroll = document.body.scrollTop || document.documentElement.scrollTop;
    const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
    const scrolled = (winScroll / height) * 100;
    progressBar.style.width = scrolled + '%';
  });
}

// 主题管理系统 - 简化版
const ThemeManager = {
  // 主题配置
  config: {
    light: {
      name: 'light',
      icon: 'fas fa-moon',
      label: '切换到深色模式',
      title: '切换到深色模式'
    },
    dark: {
      name: 'dark',
      icon: 'fas fa-sun',
      label: '切换到浅色模式',
      title: '切换到浅色模式'
    }
  },
  
  // 当前主题
  currentTheme: null,
  
  // 初始化主题系统
  init() {
    // 在DOM加载前立即设置主题
    this.setThemeImmediately();
    
    // 等待DOM加载完成后初始化切换按钮
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => this.initToggle());
    } else {
      this.initToggle();
    }
    
    // 监听系统主题变化
    this.watchSystemTheme();
  },
  
  // 立即设置主题（在DOM加载前）
  setThemeImmediately() {
    const savedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    // 确定要使用的主题
    let theme = savedTheme || (prefersDark ? 'dark' : 'light');
    
    // 立即应用到html元素
    document.documentElement.setAttribute('data-theme', theme);
    document.documentElement.classList.add(`${theme}-theme`);
    
    this.currentTheme = theme;
    console.log('主题已立即设置:', theme);
  },
  
  // 初始化切换按钮
  initToggle() {
    const toggleBtn = document.getElementById('theme-toggle');
    
    if (!toggleBtn) {
      console.warn('主题切换按钮未找到，可能当前页面未启用暗黑模式');
      return;
    }
    
    // 更新按钮图标和状态
    this.updateToggleButton(toggleBtn);
    
    // 添加点击事件
    toggleBtn.addEventListener('click', (e) => {
      this.toggleTheme();
      
      // 添加点击反馈
      toggleBtn.style.transform = 'scale(0.9)';
      setTimeout(() => {
        toggleBtn.style.transform = '';
      }, 150);
    });
    
    // 确保按钮可点击
    toggleBtn.style.pointerEvents = 'auto';
    toggleBtn.style.cursor = 'pointer';
    
    console.log('主题切换按钮已初始化');
  },
  
  // 切换主题
  toggleTheme() {
    const newTheme = this.currentTheme === 'dark' ? 'light' : 'dark';
    this.setTheme(newTheme);
  },
  
  // 设置主题
  setTheme(theme) {
    if (!this.config[theme]) {
      console.error('未知的主题:', theme);
      return;
    }
    
    // 更新HTML属性
    document.documentElement.setAttribute('data-theme', theme);
    
    // 更新CSS类
    document.documentElement.classList.remove('light-theme', 'dark-theme');
    document.documentElement.classList.add(`${theme}-theme`);
    
    // 保存到localStorage
    localStorage.setItem('theme', theme);
    
    // 更新当前主题
    this.currentTheme = theme;
    
    // 更新所有切换按钮
    this.updateAllToggleButtons();
    
    // 触发主题变化事件
    document.dispatchEvent(new CustomEvent('themeChanged', { 
      detail: { theme } 
    }));
    
    console.log('主题已切换为:', theme);
  },
  
  // 更新所有切换按钮
  updateAllToggleButtons() {
    const toggleButtons = document.querySelectorAll('#theme-toggle');
    toggleButtons.forEach(btn => this.updateToggleButton(btn));
  },
  
  // 更新单个切换按钮
  updateToggleButton(button) {
    if (!button) return;
    
    const config = this.config[this.currentTheme];
    const icon = button.querySelector('i');
    
    if (icon) {
      icon.className = config.icon;
      icon.setAttribute('aria-label', config.label);
    }
    
    button.setAttribute('title', config.title);
    button.setAttribute('aria-label', config.label);
  },
  
  // 监听系统主题变化
  watchSystemTheme() {
    if (!window.matchMedia) return;
    
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    mediaQuery.addEventListener('change', (e) => {
      // 只有在没有手动设置主题时才跟随系统变化
      if (!localStorage.getItem('theme')) {
        const newTheme = e.matches ? 'dark' : 'light';
        this.setTheme(newTheme);
      }
    });
  },
  
  // 获取当前主题
  getCurrentTheme() {
    return this.currentTheme;
  },
  
  // 检查是否启用暗黑模式
  isDarkModeEnabled() {
    return document.documentElement.classList.contains('dark-theme');
  }
};

// 立即初始化主题管理器
if (document.documentElement) {
  ThemeManager.init();
}

// 导出到全局作用域
window.ThemeManager = ThemeManager;

// 图片懒加载
function initLazyLoad() {
  const images = document.querySelectorAll('img[data-src]');
  const imageObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const img = entry.target;
        img.src = img.dataset.src;
        img.classList.add('loaded');
        imageObserver.unobserve(img);
      }
    });
  });

  images.forEach(img => imageObserver.observe(img));
}

// 平滑滚动
function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
      e.preventDefault();
      const targetId = this.getAttribute('href');
      if (targetId === '#') return;
      
      const targetElement = document.querySelector(targetId);
      if (targetElement) {
        // 添加焦点管理
        targetElement.setAttribute('tabindex', '-1');
        targetElement.focus({ preventScroll: true });
        
        window.scrollTo({
          top: targetElement.offsetTop - 80,
          behavior: 'smooth'
        });
        
        // 滚动完成后移除tabindex
        setTimeout(() => {
          targetElement.removeAttribute('tabindex');
        }, 1000);
      }
    });
  });
}

// 键盘导航支持
function initKeyboardNavigation() {
  // 为所有交互元素添加键盘支持
  const interactiveElements = document.querySelectorAll(
    'a, button, input, textarea, select, [tabindex]:not([tabindex="-1"])'
  );
  
  interactiveElements.forEach(el => {
    // 确保所有可聚焦元素都有适当的角色
    if (!el.hasAttribute('role')) {
      if (el.tagName === 'BUTTON') {
        el.setAttribute('role', 'button');
      } else if (el.tagName === 'A' && el.getAttribute('href')) {
        el.setAttribute('role', 'link');
      }
    }
    
    // 添加键盘事件监听
    el.addEventListener('keydown', function(e) {
      // Enter键触发点击
      if (e.key === 'Enter' && !['INPUT', 'TEXTAREA', 'SELECT'].includes(e.target.tagName)) {
        e.preventDefault();
        this.click();
      }
      
      // 空格键触发按钮点击
      if (e.key === ' ' && this.tagName === 'BUTTON') {
        e.preventDefault();
        this.click();
      }
    });
  });
  
  // 跳过链接
  const skipLink = document.createElement('a');
  skipLink.href = '#main';
  skipLink.className = 'skip-link';
  skipLink.textContent = '跳转到主要内容';
  skipLink.setAttribute('tabindex', '0');
  document.body.insertBefore(skipLink, document.body.firstChild);
  
  // 焦点管理
  document.addEventListener('keydown', function(e) {
    // Tab键导航
    if (e.key === 'Tab') {
      const focusableElements = document.querySelectorAll(
        'a[href], button, input, textarea, select, [tabindex]:not([tabindex="-1"])'
      );
      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];
      
      if (e.shiftKey && document.activeElement === firstElement) {
        e.preventDefault();
        lastElement.focus();
      } else if (!e.shiftKey && document.activeElement === lastElement) {
        e.preventDefault();
        firstElement.focus();
      }
    }
  });
}

// 可访问性增强
function initAccessibility() {
  // 添加焦点可见样式
  const style = document.createElement('style');
  style.textContent = `
    :focus {
      outline: 3px solid var(--primary);
      outline-offset: 2px;
    }
    
    .skip-link {
      position: absolute;
      top: -40px;
      left: 0;
      background: var(--primary);
      color: white;
      padding: 8px;
      z-index: 10000;
      text-decoration: none;
    }
    
    .skip-link:focus {
      top: 0;
    }
    
    .sr-only {
      position: absolute;
      width: 1px;
      height: 1px;
      padding: 0;
      margin: -1px;
      overflow: hidden;
      clip: rect(0, 0, 0, 0);
      white-space: nowrap;
      border: 0;
    }
  `;
  document.head.appendChild(style);
  
  // 添加屏幕阅读器专用文本
  const srOnlyElements = document.querySelectorAll('[aria-label]');
  srOnlyElements.forEach(el => {
    const label = el.getAttribute('aria-label');
    if (label && !el.textContent.includes(label)) {
      const srText = document.createElement('span');
      srText.className = 'sr-only';
      srText.textContent = label;
      el.appendChild(srText);
    }
  });
  
  // 动态内容更新通知
  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
        // 可以在这里添加动态内容更新的通知
        console.log('内容已更新');
      }
    });
  });
  
  observer.observe(document.body, {
    childList: true,
    subtree: true
  });
}

// 触摸交互优化
function initTouchInteractions() {
  // 检测触摸设备
  const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
  
  if (isTouchDevice) {
    // 为触摸设备添加特定优化
    document.body.classList.add('touch-device');
    
    // 优化按钮触摸反馈
    const buttons = document.querySelectorAll('.btn, .nav-link, .social-link');
    buttons.forEach(button => {
      button.addEventListener('touchstart', function() {
        this.classList.add('touch-active');
      }, { passive: true });
      
      button.addEventListener('touchend', function() {
        this.classList.remove('touch-active');
      }, { passive: true });
    });
    
    // 防止双击缩放
    let lastTouchEnd = 0;
    document.addEventListener('touchend', function(event) {
      const now = Date.now();
      if (now - lastTouchEnd <= 300) {
        event.preventDefault();
      }
      lastTouchEnd = now;
    }, { passive: false });
    
    // 优化长按行为
    document.addEventListener('contextmenu', function(event) {
      if (event.target.tagName === 'IMG' || event.target.tagName === 'A') {
        event.preventDefault();
      }
    });
    
    // 滑动菜单支持
    let touchStartX = 0;
    let touchStartY = 0;
    
    document.addEventListener('touchstart', function(event) {
      touchStartX = event.touches[0].clientX;
      touchStartY = event.touches[0].clientY;
    }, { passive: true });
    
    document.addEventListener('touchmove', function(event) {
      if (!touchStartX || !touchStartY) return;
      
      const touchEndX = event.touches[0].clientX;
      const touchEndY = event.touches[0].clientY;
      const diffX = touchStartX - touchEndX;
      const diffY = touchStartY - touchEndY;
      
      // 水平滑动超过50px且垂直滑动小于30px时关闭移动菜单
      if (Math.abs(diffX) > 50 && Math.abs(diffY) < 30) {
        const mobileMenu = document.querySelector('.mobile-menu');
        if (mobileMenu && mobileMenu.classList.contains('active')) {
          closeMobileMenu();
        }
      }
    }, { passive: true });
  }
  
  // 添加触摸激活样式
  const style = document.createElement('style');
  style.textContent = `
    .touch-device .touch-active {
      opacity: 0.8;
      transform: scale(0.98);
    }
    
    .touch-device .card:active,
    .touch-device .skill-item:active,
    .touch-device .post-card:active {
      transform: scale(0.98);
    }
    
    .touch-device .btn:active::after {
      content: '';
      position: absolute;
      top: 50%;
      left: 50%;
      width: 100%;
      height: 100%;
      background: rgba(255, 255, 255, 0.1);
      border-radius: inherit;
      transform: translate(-50%, -50%) scale(0);
      animation: ripple 0.6s ease-out;
    }
    
    @keyframes ripple {
      to {
        transform: translate(-50%, -50%) scale(4);
        opacity: 0;
      }
    }
  `;
  document.head.appendChild(style);
}

// 添加一些实用函数
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

// 窗口调整大小时重新初始化
window.addEventListener('resize', debounce(() => {
  // 可以在这里添加响应式调整逻辑
}, 250));

// 控制台欢迎信息
console.log('%c🎨 爱则心痛主题已加载', 'color: #8a4b5a; font-size: 16px; font-weight: bold;');
console.log('%c✨ 华丽清新，炫技无限', 'color: #7a6a5f; font-size: 14px;');
console.log('%c👨‍💻 开发者：爱则心痛 (azxt)', 'color: #5b7e91; font-size: 12px;');
console.log('%c🔧 版本: 1.1.0 | 功能: 可访问性增强、暗黑模式、触摸优化', 'color: #666; font-size: 11px;');
