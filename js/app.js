/* ========================================
   app.js — 数据驱动渲染 + 交互逻辑
   （内容来源：优先 /api/content，降级 content.js + localStorage）
   ======================================== */

(function () {
  'use strict';

  var STORAGE_KEY = 'blog-content-v2';
  var LANG_KEY = 'blog-lang';

  var currentLang = localStorage.getItem(LANG_KEY) || 'zh';
  var effective = loadContent();  // Immediate fallback from content.js + localStorage
  var apiTheme = null;
  var useApi = false;

  /* ---------- 固定界面文案（不属于可编辑内容） ---------- */
  var UI = {
    zh: {
      pageTitle: '你的名字 | 你的方向',
      pageDesc: '个人作品集网页——展示你的项目、实习与成果。',
      nav: { home: '首页', about: '关于', portfolio: '作品集', internship: '实习', experience: '获奖', blog: '博客' },
      about: { title: '关于我', edu: '教育经历', story: '我的故事', contact: '联系方式', email: '邮箱', location: '坐标' },
      portfolio: {
        title: '项目案例',
        intro: '从内容到增长的实战案例：背景 → 我做了什么 → 数据结果。',
        situation: '背景',
        action: '我做了什么',
        viewwork: '查看作品 →'
      },
      exp: { title: '获奖与经历', certificates: '证书', scholarships: '奖学金', competitions: '竞赛奖项', honors: '荣誉称号' },
      intern: { title: '实习经历' },
      blog: { title: '博客', intro: '关于翻译、语言学习，以及日常生活中的美好。', readmore: '阅读更多 →', coming: '这篇文章还在准备中，敬请期待 ✍️' },
      hero: { ctaPortfolio: '查看作品集', ctaContact: '联系我', resumeFallback: '下载简历' }
    },
    en: {
      pageTitle: 'Your Name | Your Focus',
      pageDesc: 'Personal portfolio page — showcase your projects, internships and results.',
      nav: { home: 'Home', about: 'About', portfolio: 'Portfolio', internship: 'Internship', experience: 'Awards', blog: 'Blog' },
      about: { title: 'About Me', edu: 'Education', story: 'My Story', contact: 'Contact', email: 'Email', location: 'Location' },
      portfolio: {
        title: 'Selected Projects',
        intro: 'Real-world cases from content to growth: context → what I did → measurable results.',
        situation: 'Context',
        action: 'What I Did',
        viewwork: 'View work →'
      },
      exp: { title: 'Awards & Achievements', certificates: 'Certificates', scholarships: 'Scholarships', competitions: 'Competition Awards', honors: 'Honors' },
      intern: { title: 'Internship Experience' },
      blog: { title: 'Blog', intro: 'Thoughts on translation, language learning, and the beauty of everyday life.', readmore: 'Read more →', coming: 'This post is still brewing — coming soon ✍️' },
      hero: { ctaPortfolio: 'View My Work', ctaContact: 'Contact Me', resumeFallback: 'Download Résumé' }
    }
  };

  var ICONS = {
    book: '<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>',
    clock: '<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>',
    mail: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>',
    pin: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>',
    chevron: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><path d="M7 10l5 5 5-5"/></svg>',
    phone: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/></svg>'
  };

  /* ---------- 工具 ---------- */
  function $(sel, ctx) { return (ctx || document).querySelector(sel); }
  function $$(sel, ctx) { return Array.prototype.slice.call((ctx || document).querySelectorAll(sel)); }

  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  function t(v) { // 取双语文案
    if (v && typeof v === 'object') return v[currentLang] != null ? v[currentLang] : (v.zh != null ? v.zh : '');
    return v == null ? '' : v;
  }

  function deepClone(o) { return JSON.parse(JSON.stringify(o)); }

  function safeUrl(u) {
    if (!u) return '';
    var s = String(u).trim();
    return /^(https?:|mailto:|#)/i.test(s) ? s : '';
  }

  function loadContent() {
    try {
      var raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        var c = JSON.parse(raw);
        if (c && c.hero) return mergeDeep(DEFAULT_CONTENT, c);
      }
    } catch (e) { /* 损坏则回退默认 */ }
    return deepClone(DEFAULT_CONTENT);
  }

  /* 深度合并：旧版浏览器存档缺失的新字段（如 portfolio、hero.tags）从默认值补齐；
     已存在的值（含用户编辑过的数组）一律以存档为准 */
  function mergeDeep(base, override) {
    if (override === null || typeof override !== 'object' || Array.isArray(override)) {
      return override === undefined ? deepClone(base) : override;
    }
    var out = {};
    Object.keys(base).forEach(function (k) {
      out[k] = override[k] !== undefined ? mergeDeep(base[k], override[k]) : deepClone(base[k]);
    });
    Object.keys(override).forEach(function (k) {
      if (base[k] === undefined) out[k] = override[k];
    });
    return out;
  }

  /* ---------- Toast ---------- */
  var toastTimer = null;
  function toast(msg) {
    var el = $('#toast');
    if (!el) {
      el = document.createElement('div');
      el.id = 'toast';
      el.setAttribute('role', 'status');
      document.body.appendChild(el);
    }
    el.textContent = msg;
    el.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { el.classList.remove('show'); }, 2400);
  }

  /* ---------- 渲染 ---------- */
  function renderHero() {
    var h = effective.hero, c = effective.contact, ui = UI[currentLang].hero;
    var statementHtml = h.personalStatement
      ? '<p class="hero-statement">' + esc(t(h.personalStatement)) + '</p>'
      : '';
    var keywordsHtml = (h.keywords || []).map(function (kw) {
      return '<span class="hero-keyword">' + esc(t(kw)) + '</span>';
    }).join(' · ');
    var tags = (h.tags || []).map(function (tg) {
      return '<span class="hero-tag">' + esc(t(tg)) + '</span>';
    }).join('');
    var stats = (h.stats || []).map(function (s, i) {
      return '<div class="hero-stat"><span class="hero-stat-num">' + (s.number || ('0' + (i + 1)))
        + '</span><span class="hero-stat-value">' + esc(s.value)
        + '</span><span class="hero-stat-label">' + esc(t(s.label)) + '</span></div>';
    }).join('');
    var resumeUrl = safeUrl(h.resume && h.resume.url);
    var ctas = '';
    if (resumeUrl) {
      ctas += '<a class="hero-btn hero-btn--primary" href="' + esc(resumeUrl) + '" target="_blank" rel="noopener">'
        + esc(t(h.resume.label) || ui.resumeFallback) + '</a>';
    }
    ctas += '<a class="hero-btn ' + (resumeUrl ? 'hero-btn--solid' : 'hero-btn--primary') + '" href="#ai-projects">' + esc(ui.ctaPortfolio) + '</a>';
    ctas += '<a class="hero-btn hero-btn--ghost" href="#about">' + esc(ui.ctaContact) + '</a>';
    var phone = String(h.phone || (c && c.phone) || '').trim();
    var email = String(c && c.email || '').trim();
    var contactHtml = '';
    if (phone) contactHtml += '<a href="tel:' + esc(phone.replace(/-/g, '')) + '" class="hero-contact-item">'
      + ICONS.phone + esc(phone) + '</a>';
    if (email) contactHtml += '<a href="mailto:' + esc(email) + '" class="hero-contact-item">'
      + ICONS.mail + esc(email) + '</a>';
    return ''
      + '<div class="hero-grid">'
      +   '<div class="hero-left">'
      +     '<p class="hero-greeting">' + esc(t(h.greeting)) + '</p>'
      +     '<h1 class="hero-name">' + esc(h.name) + '</h1>'
      +     '<p class="hero-name-en">' + esc(h.nameEn) + '</p>'
      +     statementHtml
      +     (keywordsHtml ? '<p class="hero-keywords">' + keywordsHtml + '</p>' : '')
      +     '<div class="hero-divider"></div>'
      +     '<p class="hero-focus">' + esc(t(h.focus)) + '</p>'
      +     '<p class="hero-title">' + esc(t(h.title)) + '</p>'
      +     '<div class="hero-tags">' + tags + '</div>'
      +     (contactHtml ? '<div class="hero-contact">' + contactHtml + '</div>' : '')
      +     '<div class="hero-cta">' + ctas + '</div>'
      +   '</div>'
      +   '<div class="hero-avatar-wrap">'
      +     '<img src="' + esc(h.avatar) + '" alt="' + esc(h.name) + '" class="hero-avatar" width="400" height="400">'
      +   '</div>'
      + '</div>'
      + (stats ? '<div class="hero-stats">' + stats + '</div>' : '');
  }

  function renderAbout() {
    var a = effective.about, c = effective.contact, ui = UI[currentLang].about;
    var skillsHtml = (a.skills || []).map(function (sk) {
      return '<span class="skill-tag">' + esc(t(sk)) + '</span>';
    }).join('');
    var toolkitHtml = (a.aiToolkit || []).map(function (tk) {
      return '<div class="tool-item"><span class="tool-name">' + esc(tk.name) + '</span><span class="tool-desc">' + esc(t(tk.desc)) + '</span></div>';
    }).join('');
    var eduItems = a.edu.map(function (e) {
      return '<div class="about-item"><span class="about-year">' + esc(e.year) + '</span>'
        + '<p class="about-text">' + esc(t(e.text)) + '</p></div>';
    }).join('');
    var story = a.story.map(function (p) {
      return '<p class="about-text">' + esc(t(p)) + '</p>';
    }).join('');
    var introText = a.intro ? '<p class="about-intro">' + esc(t(a.intro)) + '</p>' : '';
    var email = String(c.email || '').trim();
    var phone = String(c.phone || '').trim();
    var phoneRow = phone
      ? '<div class="about-contact-row"><span class="contact-label-inline">电话</span>'
        + '<a class="contact-value-inline" href="tel:' + esc(phone.replace(/-/g,'')) + '">' + esc(phone) + '</a></div>'
      : '';
    return '<h2 class="section-title">' + esc(ui.title) + '</h2><div class="section-divider"></div>'
      + introText
      + (skillsHtml ? '<div class="about-skills"><h3 class="about-label">What I Work With</h3><div class="skills-grid">' + skillsHtml + '</div></div>' : '')
      + (toolkitHtml ? '<div class="about-toolkit"><h3 class="about-label">AI Toolkit</h3><div class="toolkit-grid">' + toolkitHtml + '</div></div>' : '')
      + '<div class="about-grid">'
      +   '<div class="about-card"><div class="about-icon">' + ICONS.book + '</div>'
      +     '<h3>' + esc(ui.edu) + '</h3>' + eduItems + '</div>'
      +   '<div class="about-card"><div class="about-icon">' + ICONS.clock + '</div>'
      +     '<h3>' + esc(ui.story) + '</h3>' + story + '</div>'
      +   '<div class="about-card about-card--contact"><div class="about-icon">' + ICONS.mail + '</div>'
      +     '<h3>' + esc(ui.contact) + '</h3>'
      +     phoneRow
      +     '<div class="about-contact-row">'
      +       '<span class="contact-label-inline">' + esc(ui.email) + '</span>'
      +       '<a class="contact-value-inline" href="mailto:' + esc(email) + '">' + esc(email) + '</a>'
      +     '</div>'
      +     '<div class="about-contact-row">'
      +       '<span class="contact-label-inline">' + esc(ui.location) + '</span>'
      +       '<span class="contact-value-inline">' + esc(t(c.location)) + '</span>'
      +     '</div>'
      +   '</div>'
      + '</div>';
  }

  function renderPortfolio() {
    var ui = UI[currentLang].portfolio;
    var cards = (effective.portfolio || []).map(function (c) {
      var results = (c.results || []).map(function (r) {
        return '<div class="case-result"><span class="case-result-value">' + esc(r.value)
          + '</span><span class="case-result-label">' + esc(t(r.label)) + '</span></div>';
      }).join('');
      var url = safeUrl(c.url);
      var link = url
        ? '<a class="case-link" href="' + esc(url) + '" target="_blank" rel="noopener">' + esc(ui.viewwork) + '</a>'
        : '';
      var paletteClass = 'project-palette-' + esc(c.palette || 'cd');
      return '<article class="project-card ' + paletteClass + '">'
        + '<div class="project-card-accent"></div>'
        + '<div class="project-card-body">'
        +   '<div class="project-card-head">'
        +     '<span class="project-card-tag">' + esc(t(c.tag)) + '</span>'
        +     '<span class="project-card-company">' + esc(c.company) + '</span>'
        +   '</div>'
        +   '<h3 class="project-card-title">' + esc(t(c.title)) + '</h3>'
        +   '<div class="project-card-section">'
        +     '<span class="project-card-label">' + esc(ui.situation) + '</span>'
        +     '<p class="project-card-text">' + esc(t(c.situation)) + '</p>'
        +   '</div>'
        +   '<div class="project-card-section">'
        +     '<span class="project-card-label">' + esc(ui.action) + '</span>'
        +     '<p class="project-card-text">' + esc(t(c.action)) + '</p>'
        +   '</div>'
        +   (results ? '<div class="case-results">' + results + '</div>' : '')
        +   link
        + '</div></article>';
    }).join('');
    return '<h2 class="section-title">' + esc(ui.title) + '</h2><div class="section-divider"></div>'
      + '<p class="portfolio-intro">' + esc(ui.intro) + '</p>'
      + '<div class="project-grid">' + (cards || '<p class="empty-hint">—</p>') + '</div>';
  }

  function badgeGrid(items, cls) {
    if (!items.length) return '<p class="empty-hint">—</p>';
    return '<div class="badge-grid">' + items.map(function (b) {
      return '<div class="badge ' + (cls || '') + '"><span class="badge-dot"></span><span>' + esc(t(b)) + '</span></div>';
    }).join('') + '</div>';
  }

  function renderExp() {
    var e = effective.exp, ui = UI[currentLang].exp;
    var timeline = e.competitions.map(function (c) {
      return '<div class="timeline-item"><div class="timeline-marker"></div>'
        + '<div class="timeline-content"><span class="timeline-tag">' + esc(t(c.tag)) + '</span>'
        + '<p>' + esc(t(c.text)) + '</p></div></div>';
    }).join('');
    return '<h2 class="section-title">' + esc(ui.title) + '</h2><div class="section-divider"></div>'
      + '<h3 class="subsection-title">' + esc(ui.scholarships) + '</h3>' + badgeGrid(e.scholarships, 'accent')
      + '<h3 class="subsection-title">' + esc(ui.competitions) + '</h3><div class="timeline">' + timeline + '</div>'
      + '<h3 class="subsection-title">' + esc(ui.honors) + '</h3>' + badgeGrid(e.honors, 'honor');
  }

  function renderIntern() {
    var ui = UI[currentLang].intern;
    var cards = effective.internships.map(function (it) {
      var bullets = it.bullets.map(function (b) { return '<li>' + esc(t(b)) + '</li>'; }).join('');
      var palette = esc(it.palette || 'cd');
      return '<article class="exp-card exp-palette-' + palette + '">'
        + '<div class="exp-card-accent"></div>'
        + '<div class="exp-card-body">'
        +   '<div class="exp-card-header">'
        +     '<div class="exp-card-logo exp-logo-' + palette + '"><span>' + esc(it.initials || '•') + '</span></div>'
        +     '<div class="exp-card-meta">'
        +       '<h3 class="exp-card-company">' + esc(it.company) + '</h3>'
        +       '<p class="exp-card-role">' + esc(t(it.role)) + '</p>'
        +       '<span class="exp-card-period">' + esc(it.period) + '</span>'
        +     '</div>'
        +   '</div>'
        +   '<ul class="exp-card-bullets">' + bullets + '</ul>'
        + '</div></article>';
    }).join('');
    return '<h2 class="section-title">' + esc(ui.title) + '</h2><div class="section-divider"></div>'
      + '<div class="exp-grid">' + (cards || '<p class="empty-hint">—</p>') + '</div>';
  }

  function renderBlog() {
    var ui = UI[currentLang].blog;
    var cards = effective.blog.map(function (p, i) {
      var url = safeUrl(p.url);
      var more = url
        ? '<a href="' + esc(url) + '" class="blog-card-link">' + esc(ui.readmore) + '</a>'
        : '<button type="button" class="blog-card-link blog-card-link--soon" data-coming>' + esc(ui.readmore) + '</button>';
      return '<article class="blog-card">'
        + '<div class="blog-card-image">'
        +   '<img src="' + esc(p.img) + '" alt="' + esc(t(p.alt) || p.title) + '" loading="' + (i === 0 ? 'eager' : 'lazy') + '" decoding="async" width="900" height="600">'
        + '</div>'
        + '<div class="blog-card-body">'
        +   '<span class="blog-card-date">' + esc(p.date) + '</span>'
        +   '<h3>' + esc(t(p.title)) + '</h3>'
        +   '<p>' + esc(t(p.excerpt)) + '</p>' + more
        + '</div></article>';
    }).join('');
    return '<h2 class="section-title">' + esc(ui.title) + '</h2><div class="section-divider"></div>'
      + '<p class="blog-intro">' + esc(ui.intro) + '</p>'
      + '<div class="blog-grid">' + (cards || '<p class="empty-hint">—</p>') + '</div>';
  }

  function renderContact() {
    var c = effective.contact, ui = UI[currentLang].contact;
    var email = String(c.email || '').trim();
    return '<h2 class="section-title">' + esc(ui.title) + '</h2><div class="section-divider"></div>'
      + '<p class="contact-intro">' + esc(ui.intro) + '</p>'
      + '<div class="contact-grid">'
      +   '<div class="contact-card">' + ICONS.mail
      +     '<span class="contact-label">' + esc(ui.email) + '</span>'
      +     '<a class="contact-value contact-value--link" href="mailto:' + esc(email) + '">' + esc(email) + '</a>'
      +   '</div>'
      +   '<div class="contact-card">' + ICONS.pin
      +     '<span class="contact-label">' + esc(ui.location) + '</span>'
      +     '<span class="contact-value">' + esc(t(c.location)) + '</span>'
      +   '</div>'
      + '</div>';
  }

  function applyHiddenSections() {
    var hidden = (effective.meta && effective.meta.hiddenSections) || [];
    ['about', 'portfolio', 'internship', 'experience', 'blog'].forEach(function (id) {
      var sec = document.getElementById(id);
      var link = $('.nav-links a[href="#' + id + '"]');
      var off = hidden.indexOf(id) > -1;
      if (sec) sec.style.display = off ? 'none' : '';
      if (link) link.style.display = off ? 'none' : '';
    });
  }

  function renderAll(instant) {
    try {
      $('.hero-content').innerHTML = renderHero();
      $('#about .container').innerHTML = renderAbout();
      $('#portfolio .container').innerHTML = renderPortfolio();
      $('#internship .container').innerHTML = renderIntern();
      $('#experience .container').innerHTML = renderExp();
      $('#blog .container').innerHTML = renderBlog();
    } catch (e) {
      // 渲染失败时保留 index.html 中的静态兜底内容
      return;
    }
    applyHiddenSections();
    updatePageMeta();
    initReveals(instant);
  }

  function updatePageMeta() {
    var ui = UI[currentLang];
    document.title = ui.pageTitle;
    document.documentElement.lang = currentLang === 'zh' ? 'zh-CN' : 'en';
    var m = $('meta[name="description"]');
    if (m) m.setAttribute('content', ui.pageDesc);
    $$('.nav-links a[data-nav]').forEach(function (a) {
      a.textContent = ui.nav[a.dataset.nav];
    });
    var btn = $('#langToggle');
    if (btn) {
      btn.setAttribute('aria-pressed', String(currentLang === 'en'));
      btn.setAttribute('title', currentLang === 'zh' ? 'Switch to English' : '切换到中文');
    }
  }

  /* ---------- 滚动浮现 ---------- */
  var observer = null;
  function initReveals(instant) {
    var targets = $$('.about-card, .blog-card, .exp-card, .project-card, .timeline-item, .badge, .hero-stat');
    if (observer) observer.disconnect();
    targets.forEach(function (el) { el.classList.add('fade-in'); });
    if (instant || !('IntersectionObserver' in window)) {
      targets.forEach(function (el) { el.classList.add('visible'); });
      return;
    }
    observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -24px 0px' });
    targets.forEach(function (el) { observer.observe(el); });
  }

  /* ---------- 语言 ---------- */
  function setLang(lang, instant) {
    currentLang = lang === 'en' ? 'en' : 'zh';
    localStorage.setItem(LANG_KEY, currentLang);
    var zh = $('.lang-zh'), en = $('.lang-en');
    if (zh) zh.classList.toggle('active', currentLang === 'zh');
    if (en) en.classList.toggle('active', currentLang === 'en');
    renderAll(instant !== false ? true : false);
  }

  /* ---------- 移动端菜单 ---------- */
  function initMobileMenu() {
    var btn = $('#mobileMenuBtn'), links = $('.nav-links');
    if (!btn || !links) return;
    function setOpen(open) {
      links.classList.toggle('open', open);
      btn.setAttribute('aria-expanded', String(open));
    }
    btn.addEventListener('click', function () { setOpen(!links.classList.contains('open')); });
    links.addEventListener('click', function (e) { if (e.target.closest('a')) setOpen(false); });
    document.addEventListener('click', function (e) {
      if (!btn.contains(e.target) && !links.contains(e.target)) setOpen(false);
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') setOpen(false);
    });
  }

  /* ---------- 滚动效果 ---------- */
  function initScrollEffects() {
    var nav = $('#nav'), ticking = false;
    // Scroll progress bar
    var progressBar = document.createElement('div');
    progressBar.className = 'scroll-progress';
    document.body.appendChild(progressBar);

    function update() {
      var scrollY = window.scrollY;
      nav.classList.toggle('scrolled', scrollY > 50);

      // Progress bar
      var docH = document.documentElement.scrollHeight - window.innerHeight;
      var pct = docH > 0 ? Math.min(scrollY / docH * 100, 100) : 0;
      progressBar.style.width = pct + '%';

      // Active nav link
      var sections = $$('section[id]');
      var current = '';
      sections.forEach(function (sec) {
        var top = sec.getBoundingClientRect().top;
        if (top < window.innerHeight * 0.4) current = sec.id;
      });
      $$('.nav-links a[data-nav]').forEach(function (a) {
        a.classList.toggle('nav-active', a.dataset.nav === current || (current === 'home' && !a.dataset.nav));
      });

      ticking = false;
    }
    window.addEventListener('scroll', function () {
      if (!ticking) { ticking = true; requestAnimationFrame(update); }
    }, { passive: true });
    update();
  }

  /* ---------- 事件委托 ---------- */
  function initDelegated() {
    document.addEventListener('click', function (e) {
      var soon = e.target.closest('[data-coming]');
      if (soon) {
        e.preventDefault();
        toast(UI[currentLang].blog.coming);
      }
    });
  }

  /* ---------- 对外 API（供 admin.js 使用） ---------- */
  window.Blog = {
    get content() { return effective; },
    defaults: function () { return deepClone(DEFAULT_CONTENT); },
    mergeDefaults: function (c) { return mergeDeep(DEFAULT_CONTENT, c); },
    save: function (c) {
      effective = c;
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(c));
      } catch (e) {
        toast('浏览器存储空间不足：图片太大了，试试少传几张');
      }
      renderAll(true);
    },
    reset: function () {
      localStorage.removeItem(STORAGE_KEY);
      effective = deepClone(DEFAULT_CONTENT);
      renderAll(true);
    },
    hasCustom: function () { return localStorage.getItem(STORAGE_KEY) != null; },
    rerender: function () { renderAll(true); },
    toast: toast,
    lang: function () { return currentLang; }
  };

  /* ---------- Theme from API ---------- */
  function applyTheme(theme) {
    if (!theme || !theme.colors) return;
    var root = document.documentElement.style;
    var c = theme.colors;
    if (c.primary) root.setProperty('--color-primary', c.primary);
    if (c.primaryLight) root.setProperty('--color-primary-light', c.primaryLight);
    if (c.primaryPale) root.setProperty('--color-primary-pale', c.primaryPale);
    if (c.primaryDeep) root.setProperty('--color-primary-deep', c.primaryDeep);
    if (c.gold) root.setProperty('--color-gold', c.gold);
    if (c.goldLight) root.setProperty('--color-gold-light', c.goldLight);
    if (c.goldPale) root.setProperty('--color-gold-pale', c.goldPale);
    if (c.rose) root.setProperty('--color-rose', c.rose);
    if (c.roseLight) root.setProperty('--color-rose-light', c.roseLight);
    if (c.rosePale) root.setProperty('--color-rose-pale', c.rosePale);
    if (c.bg) root.setProperty('--color-bg', c.bg);
    if (c.bgDeep) root.setProperty('--color-bg-deep', c.bgDeep);
    if (c.card) root.setProperty('--color-card', c.card);
    if (c.dark) root.setProperty('--color-dark', c.dark);
    if (c.text) root.setProperty('--color-text', c.text);
    if (c.textLight) root.setProperty('--color-text-light', c.textLight);
    if (c.textMuted) root.setProperty('--color-text-muted', c.textMuted);
    if (theme.typography) {
      var t = theme.typography;
      if (t.heroName) root.setProperty('--text-hero-name', t.heroName);
      if (t.sectionTitle) root.setProperty('--text-section-title', t.sectionTitle);
      if (t.cardTitle) root.setProperty('--text-card-title', t.cardTitle);
      if (t.body) root.setProperty('--text-body', t.body);
      if (t.small) root.setProperty('--text-small', t.small);
    }
    if (theme.layout) {
      var l = theme.layout;
      if (l.containerMax) root.setProperty('--container-max', l.containerMax);
      if (l.sectionSpacing) root.setProperty('--space-section', l.sectionSpacing);
      if (l.cardRadius) root.setProperty('--radius-md', l.cardRadius);
    }
  }

  /* ---------- 启动 ---------- */
  function init() {
    // Render immediately with local content.js data
    boot();
    // Clean up any injected quote/philosophy section after render
    cleanupInjectedSections();
  }

  function cleanupInjectedSections() {
    // Remove any section/element containing "运营理念" or "好的内容运营" text
    var all = document.querySelectorAll('section, div');
    for (var i = 0; i < all.length; i++) {
      var el = all[i];
      var text = el.textContent || '';
      if ((text.indexOf('运营理念') > -1 || text.indexOf('好的内容运营不是生产信息') > -1) && el.children.length < 10) {
        el.remove();
      }
    }
  }

  function boot() {
    renderAll(false);
    var zh = $('.lang-zh'), en = $('.lang-en');
    if (zh) zh.classList.toggle('active', currentLang === 'zh');
    if (en) en.classList.toggle('active', currentLang === 'en');
    initMobileMenu();
    initScrollEffects();
    initDelegated();
    var lt = $('#langToggle');
    if (lt) lt.addEventListener('click', function () { setLang(currentLang === 'zh' ? 'en' : 'zh'); });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
