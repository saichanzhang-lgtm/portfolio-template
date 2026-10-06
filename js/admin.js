/* ========================================
   admin.js — 内容管理面板
   ----------------------------------------
   入口：① 页脚"管理内容"按钮  ② Ctrl+Shift+E
   修改存于浏览器 localStorage，可导出 JSON 备份
   ======================================== */

(function () {
  'use strict';

  var TABS = [
    { id: 'hero', label: '首屏' },
    { id: 'about', label: '关于' },
    { id: 'portfolio', label: '作品集' },
    { id: 'intern', label: '实习' },
    { id: 'exp', label: '获奖' },
    { id: 'blog', label: '博客' }
  ];

  var root = null, overlay = null, panel = null, body = null;
  var draft = null, dirty = false, activeTab = 'hero';

  /* ---------- 工具 ---------- */
  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }
  function deepClone(o) { return JSON.parse(JSON.stringify(o)); }
  function setPath(obj, path, val) {
    var parts = path.split('.'), o = obj;
    for (var i = 0; i < parts.length - 1; i++) o = o[parts[i]];
    o[parts[parts.length - 1]] = val;
  }
  function getPath(obj, path) {
    return path.split('.').reduce(function (o, k) { return (o || {})[k]; }, obj);
  }

  /* ---------- 面板骨架 ---------- */
  function buildShell() {
    root = document.createElement('div');
    root.id = 'admin';
    root.innerHTML = ''
      + '<div class="adm-overlay" data-close></div>'
      + '<aside class="adm-panel" role="dialog" aria-modal="true" aria-label="内容管理">'
      +   '<header class="adm-head">'
      +     '<h2 class="adm-title">内容管理<span class="adm-dirty" title="有未保存的修改" hidden>●</span></h2>'
      +     '<button class="adm-close" data-close aria-label="关闭面板">✕</button>'
      +   '</header>'
      +   '<nav class="adm-tabs" role="tablist"></nav>'
      +   '<div class="adm-body"></div>'
      +   '<footer class="adm-actions">'
      +     '<button class="adm-btn adm-btn--primary" data-act="save">保存</button>'
      +     '<button class="adm-btn" data-act="discard">放弃更改</button>'
      +     '<button class="adm-btn" data-act="export">导出JSON</button>'
      +     '<button class="adm-btn" data-act="import">导入JSON</button>'
      +     '<button class="adm-btn adm-btn--danger" data-act="reset">恢复默认</button>'
      +     '<input type="file" id="admImportFile" accept=".json,application/json" hidden>'
      +   '</footer>'
      + '</aside>';
    document.body.appendChild(root);
    overlay = root.querySelector('.adm-overlay');
    panel = root.querySelector('.adm-panel');
    body = root.querySelector('.adm-body');
    root.querySelector('.adm-tabs').innerHTML = TABS.map(function (tb) {
      return '<button role="tab" class="adm-tab" data-tab="' + tb.id + '">' + tb.label + '</button>';
    }).join('');
  }

  function open() {
    if (!root) buildShell();
    draft = deepClone(window.Blog.content);
    dirty = false;
    syncDirty();
    root.classList.add('open');
    renderTab();
    var closeBtn = panel.querySelector('.adm-close');
    if (closeBtn) closeBtn.focus();
  }

  function close() {
    if (root) root.classList.remove('open');
    var btn = document.getElementById('adminBtn');
    if (btn) btn.focus();
  }

  function isOpen() { return !!(root && root.classList.contains('open')); }

  function syncDirty() {
    var d = panel && panel.querySelector('.adm-dirty');
    if (d) d.hidden = !dirty;
  }

  /* ---------- 字段构造器 ---------- */
  function fld(label, path, val, ph) {
    return '<label class="adm-field"><span class="adm-label">' + esc(label) + '</span>'
      + '<input class="adm-input" data-p="' + esc(path) + '" value="' + esc(val) + '" placeholder="' + esc(ph || '') + '"></label>';
  }
  function area(label, path, val) {
    return '<label class="adm-field"><span class="adm-label">' + esc(label) + '</span>'
      + '<textarea class="adm-input adm-area" rows="2" data-p="' + esc(path) + '">' + esc(val) + '</textarea></label>';
  }
  function pair(labelZh, labelEn, path, obj) {
    obj = obj || {};
    return '<div class="adm-pair">' + fld(labelZh, path + '.zh', obj.zh) + fld(labelEn, path + '.en', obj.en) + '</div>';
  }
  function group(title, listPath, addLabel) {
    var addBtn = listPath
      ? '<button class="adm-add" data-add-list="' + esc(listPath) + '">＋ ' + esc(addLabel) + '</button>'
      : '';
    return '<div class="adm-group"><div class="adm-group-head"><h3>' + esc(title) + '</h3>' + addBtn + '</div>';
  }
  function itemShell(itemPath, inner) {
    return '<div class="adm-item"><button class="adm-del" data-del="' + esc(itemPath) + '">删除</button>' + inner + '</div>';
  }

  /* ---------- 各 Tab 内容 ---------- */
  function tabHero() {
    var h = draft.hero;
    var sections = [
      { id: 'about', label: '关于' }, { id: 'portfolio', label: '作品集' },
      { id: 'internship', label: '实习' }, { id: 'experience', label: '获奖' },
      { id: 'blog', label: '博客' }, { id: 'contact', label: '联系' }
    ];
    var hidden = (draft.meta && draft.meta.hiddenSections) || [];
    var checks = sections.map(function (s) {
      var off = hidden.indexOf(s.id) > -1;
      return '<label class="adm-check"><input type="checkbox" data-section="' + s.id + '"' + (off ? '' : ' checked') + '> 显示「' + s.label + '」板块</label>';
    }).join('');
    var resume = h.resume || {};
    var tags = (h.tags || []).map(function (tg, i) {
      return itemShell('hero.tags.' + i, pair('标签（中）', '标签（英）', 'hero.tags.' + i, tg));
    }).join('');
    var stats = (h.stats || []).map(function (s, i) {
      return itemShell('hero.stats.' + i,
        fld('数值', 'hero.stats.' + i + '.value', s.value, '120+')
        + pair('说明（中）', '说明（英）', 'hero.stats.' + i + '.label', s.label));
    }).join('');
    return group('头像', '', '')
      + '<div class="adm-item adm-item--flat">'
      +   '<img class="adm-thumb" src="' + esc(h.avatar) + '" alt="头像预览">'
      +   '<button class="adm-btn" data-img="hero.avatar">更换头像</button>'
      +   '<input type="file" class="adm-file" accept="image/*" data-img-target="hero.avatar" hidden>'
      + '</div></div>'
      + group('文案', '', '')
      +   fld('问候语（中）', 'hero.greeting.zh', h.greeting.zh)
      +   fld('问候语（英）', 'hero.greeting.en', h.greeting.en)
      +   fld('姓名（中）', 'hero.name', h.name)
      +   fld('姓名（英）', 'hero.nameEn', h.nameEn)
      +   pair('求职方向（中）', '求职方向（英）', 'hero.focus', h.focus)
      +   fld('身份标签（中）', 'hero.title.zh', h.title.zh)
      +   fld('身份标签（英）', 'hero.title.en', h.title.en)
      +   fld('副标题（中）', 'hero.subtitle.zh', h.subtitle.zh)
      +   fld('副标题（英）', 'hero.subtitle.en', h.subtitle.en)
      + '</div>'
      + group('能力标签', 'hero.tags', '添加标签') + tags + '</div>'
      + group('数据速览（首屏底部数字栏）', 'hero.stats', '添加一条数据') + stats + '</div>'
      + group('简历下载按钮', '', '')
      +   '<p class="adm-hint">填上简历链接（PDF）后，首屏会自动出现下载按钮；留空则不显示。</p>'
      +   fld('简历链接', 'hero.resume.url', resume.url, 'https://…/resume.pdf')
      +   pair('按钮文案（中）', '按钮文案（英）', 'hero.resume.label', resume.label)
      + '</div>'
      + group('板块显示 / 隐藏', '', '')
      +   '<p class="adm-hint">取消勾选的板块将从页面隐藏（导航栏同步隐藏）。</p>'
      +   '<div class="adm-checks">' + checks + '</div>'
      + '</div>';
  }

  function tabPortfolio() {
    var palettes = { cd: '玫红', siemens: '墨绿', baidu: '雾蓝', plum: '紫', amber: '琥珀' };
    var cards = (draft.portfolio || []).map(function (c, i) {
      var opts = Object.keys(palettes).map(function (p) {
        return '<option value="' + p + '"' + (c.palette === p ? ' selected' : '') + '>' + palettes[p] + '</option>';
      }).join('');
      var results = (c.results || []).map(function (r, j) {
        return itemShell('portfolio.' + i + '.results.' + j,
          fld('数值', 'portfolio.' + i + '.results.' + j + '.value', r.value, '+25%')
          + pair('说明（中）', '说明（英）', 'portfolio.' + i + '.results.' + j + '.label', r.label));
      }).join('');
      return '<div class="adm-card">'
        + '<div class="adm-card-head"><strong>案例 ' + (i + 1) + '</strong>'
        + '<button class="adm-del" data-del="portfolio.' + i + '">删除案例</button></div>'
        + '<div class="adm-pair">'
        +   pair('分类标签（中）', '分类标签（英）', 'portfolio.' + i + '.tag', c.tag)
        + '</div>'
        + '<div class="adm-pair">'
        +   fld('案例名称（中）', 'portfolio.' + i + '.title.zh', c.title && c.title.zh)
        +   fld('案例名称（英）', 'portfolio.' + i + '.title.en', c.title && c.title.en)
        + '</div>'
        + '<div class="adm-pair">'
        +   fld('来源公司', 'portfolio.' + i + '.company', c.company, '示例公司')
        +   '<label class="adm-field"><span class="adm-label">卡片配色</span>'
        +     '<select class="adm-input" data-p="portfolio.' + i + '.palette">' + opts + '</select></label>'
        + '</div>'
        + area('背景（中）', 'portfolio.' + i + '.situation.zh', c.situation && c.situation.zh)
        + area('背景（英）', 'portfolio.' + i + '.situation.en', c.situation && c.situation.en)
        + area('我做了什么（中）', 'portfolio.' + i + '.action.zh', c.action && c.action.zh)
        + area('我做了什么（英）', 'portfolio.' + i + '.action.en', c.action && c.action.en)
        + '<div class="adm-subgroup"><div class="adm-group-head"><h4>数据结果</h4>'
        +   '<button class="adm-add" data-add-list="portfolio.' + i + '.results">＋ 添加一条</button></div>'
        +   results + '</div>'
        + fld('作品链接（可选）', 'portfolio.' + i + '.url', c.url, 'https://… 小红书笔记/活动页，留空则不显示按钮')
        + '</div>';
    }).join('');
    return '<p class="adm-hint">案例按 STAR 结构展示：背景 → 我做了什么 → 数据结果。建议把最亮的数据放在结果里。</p>'
      + group('项目案例', 'portfolio', '添加一个案例') + cards + '</div>';
  }

  function tabAbout() {
    var a = draft.about;
    var edu = a.edu.map(function (e, i) {
      return itemShell('about.edu.' + i,
        fld('年份', 'about.edu.' + i + '.year', e.year, '2025 – 2027')
        + pair('学历描述（中）', '学历描述（英）', 'about.edu.' + i + '.text', e.text));
    }).join('');
    var story = a.story.map(function (p, i) {
      return itemShell('about.story.' + i,
        area('段落（中）', 'about.story.' + i + '.zh', p.zh)
        + area('段落（英）', 'about.story.' + i + '.en', p.en));
    }).join('');
    var con = draft.contact;
    return group('教育经历', 'about.edu', '添加一段学历') + edu + '</div>'
      + group('我的故事', 'about.story', '添加一个段落') + story + '</div>'
      + group('联系方式（显示在"关于我"板块）', '', '')
      +   fld('邮箱', 'contact.email', con.email)
      +   pair('坐标（中）', '坐标（英）', 'contact.location', con.location)
      + '</div>';
  }

  function tabExp() {
    var e = draft.exp;
    function simpleList(title, key, addLabel) {
      var items = e[key].map(function (b, i) {
        return itemShell('exp.' + key + '.' + i, pair('中文', 'English', 'exp.' + key + '.' + i, b));
      }).join('');
      return group(title, 'exp.' + key, addLabel) + items + '</div>';
    }
    var comps = e.competitions.map(function (c, i) {
      return itemShell('exp.competitions.' + i,
        pair('级别标签（中）', '级别标签（英）', 'exp.competitions.' + i + '.tag', c.tag)
        + pair('奖项描述（中）', '奖项描述（英）', 'exp.competitions.' + i + '.text', c.text));
    }).join('');
    return simpleList('证书', 'certificates', '添加证书')
      + simpleList('奖学金', 'scholarships', '添加奖学金')
      + (group('竞赛奖项', 'exp.competitions', '添加竞赛') + comps + '</div>')
      + simpleList('荣誉称号', 'honors', '添加荣誉');
  }

  function tabIntern() {
    var palettes = { cd: '玫红', siemens: '墨绿', baidu: '雾蓝', plum: '紫', amber: '琥珀' };
    var cards = draft.internships.map(function (it, i) {
      var opts = Object.keys(palettes).map(function (p) {
        return '<option value="' + p + '"' + (it.palette === p ? ' selected' : '') + '>' + palettes[p] + '</option>';
      }).join('');
      var bullets = it.bullets.map(function (b, j) {
        return itemShell('internships.' + i + '.bullets.' + j,
          area('工作内容（中）', 'internships.' + i + '.bullets.' + j + '.zh', b.zh)
          + area('工作内容（英）', 'internships.' + i + '.bullets.' + j + '.en', b.en));
      }).join('');
      return '<div class="adm-card">'
        + '<div class="adm-card-head"><strong>实习 ' + (i + 1) + '</strong>'
        + '<button class="adm-del" data-del="internships.' + i + '">删除整段实习</button></div>'
        + '<div class="adm-pair">'
        +   fld('Logo 字母', 'internships.' + i + '.initials', it.initials, 'CD')
        +   '<label class="adm-field"><span class="adm-label">Logo 配色</span>'
        +     '<select class="adm-input" data-p="internships.' + i + '.palette">' + opts + '</select></label>'
        + '</div>'
        + fld('公司名', 'internships.' + i + '.company', it.company, '示例公司')
        + fld('时间段', 'internships.' + i + '.period', it.period, '20XX.XX – 20XX.XX')
        + pair('岗位（中）', '岗位（英）', 'internships.' + i + '.role', it.role)
        + '<div class="adm-subgroup"><div class="adm-group-head"><h4>工作内容</h4>'
        +   '<button class="adm-add" data-add-list="internships.' + i + '.bullets">＋ 添加一条</button></div>'
        +   bullets + '</div>'
        + '</div>';
    }).join('');
    return group('实习经历', 'internships', '添加一段实习') + cards + '</div>';
  }

  function tabBlog() {
    var cards = draft.blog.map(function (p, i) {
      return '<div class="adm-card">'
        + '<div class="adm-card-head"><strong>文章 ' + (i + 1) + '</strong>'
        + '<button class="adm-del" data-del="blog.' + i + '">删除文章</button></div>'
        + '<div class="adm-item adm-item--flat">'
        +   '<img class="adm-thumb adm-thumb--wide" src="' + esc(p.img) + '" alt="封面预览" onerror="this.style.opacity=.25">'
        +   '<button class="adm-btn" data-img="blog.' + i + '.img">上传封面</button>'
        +   '<input type="file" class="adm-file" accept="image/*" data-img-target="blog.' + i + '.img" hidden>'
        + '</div>'
        + fld('日期', 'blog.' + i + '.date', p.date, '2026.05')
        + pair('标题（中）', '标题（英）', 'blog.' + i + '.title', p.title)
        + area('摘要（中）', 'blog.' + i + '.excerpt.zh', p.excerpt.zh)
        + area('摘要（英）', 'blog.' + i + '.excerpt.en', p.excerpt.en)
        + fld('文章链接（可选）', 'blog.' + i + '.url', p.url, 'https://… 留空则显示"敬请期待"')
        + '</div>';
    }).join('');
    return group('博客文章', 'blog', '添加一篇文章') + cards + '</div>';
  }

  var RENDERERS = { hero: tabHero, about: tabAbout, portfolio: tabPortfolio, exp: tabExp, intern: tabIntern, blog: tabBlog };

  function renderTab() {
    if (!panel) return;
    panel.querySelectorAll('.adm-tab').forEach(function (tb) {
      var on = tb.dataset.tab === activeTab;
      tb.classList.toggle('active', on);
      tb.setAttribute('aria-selected', String(on));
    });
    body.scrollTop = 0;
    body.innerHTML = RENDERERS[activeTab]();
  }

  /* ---------- 新增 / 删除模板 ---------- */
  var TEMPLATES = {
    'about.edu': function () { return { year: '', text: { zh: '', en: '' } }; },
    'about.story': function () { return { zh: '', en: '' }; },
    'exp.certificates': function () { return { zh: '', en: '' }; },
    'exp.scholarships': function () { return { zh: '', en: '' }; },
    'exp.honors': function () { return { zh: '', en: '' }; },
    'exp.competitions': function () { return { tag: { zh: '其他', en: 'Other' }, text: { zh: '', en: '' } }; },
    'hero.tags': function () { return { zh: '', en: '' }; },
    'hero.stats': function () { return { value: '', label: { zh: '', en: '' } }; },
    'portfolio': function () {
      return {
        palette: 'plum', tag: { zh: '', en: '' }, title: { zh: '', en: '' }, company: '',
        situation: { zh: '', en: '' }, action: { zh: '', en: '' },
        results: [{ value: '', label: { zh: '', en: '' } }], url: ''
      };
    },
    'internships': function () {
      return { initials: '新', palette: 'plum', company: '', role: { zh: '', en: '' }, period: '', bullets: [{ zh: '', en: '' }] };
    },
    'blog': function () {
      return { img: '', alt: { zh: '', en: '' }, date: '', title: { zh: '', en: '' }, excerpt: { zh: '', en: '' }, url: '' };
    }
  };
  function bulletTemplate() { return { zh: '', en: '' }; }
  function resultTemplate() { return { value: '', label: { zh: '', en: '' } }; }

  /* ---------- 事件 ---------- */
  function bind() {
    root.addEventListener('click', function (e) {
      var closeEl = e.target.closest('[data-close]');
      if (closeEl) { close(); return; }

      var tab = e.target.closest('.adm-tab');
      if (tab) { activeTab = tab.dataset.tab; renderTab(); return; }

      var add = e.target.closest('[data-add-list]');
      if (add) {
        var listPath = add.dataset.addList;
        var arr = getPath(draft, listPath);
        var tpl;
        if (TEMPLATES[listPath]) tpl = TEMPLATES[listPath]();
        else if (listPath.slice(-8) === '.results') tpl = resultTemplate();
        else tpl = bulletTemplate();
        arr.push(tpl);
        markDirty(); renderTab();
        return;
      }

      var del = e.target.closest('[data-del]');
      if (del) {
        if (!del.classList.contains('arm')) {
          del.classList.add('arm');
          del.dataset.orig = del.textContent;
          del.textContent = '确认删除？';
          setTimeout(function () {
            del.classList.remove('arm');
            if (del.dataset.orig) del.textContent = del.dataset.orig;
          }, 2600);
          return;
        }
        var parts = del.dataset.del.split('.');
        var idx = parseInt(parts.pop(), 10);
        var parent = getPath(draft, parts.join('.'));
        parent.splice(idx, 1);
        markDirty(); renderTab();
        return;
      }

      var imgBtn = e.target.closest('[data-img]');
      if (imgBtn) {
        var input = root.querySelector('.adm-file[data-img-target="' + imgBtn.dataset.img + '"]');
        if (input) input.click();
        return;
      }

      var act = e.target.closest('[data-act]');
      if (act) { handleAction(act.dataset.act, act); }
    });

    root.addEventListener('input', function (e) {
      var el = e.target;
      if (el.dataset && el.dataset.p) {
        setPath(draft, el.dataset.p, el.value);
        markDirty();
      }
    });
    root.addEventListener('change', function (e) {
      var el = e.target;
      if (el.dataset && el.dataset.p && el.tagName === 'SELECT') {
        setPath(draft, el.dataset.p, el.value);
        markDirty();
      }
    });

    /* 板块显示开关 */
    root.addEventListener('click', function (e) {
      var chk = e.target.closest('[data-section]');
      if (!chk) return;
      var hidden = draft.meta.hiddenSections;
      var id = chk.dataset.section;
      var i = hidden.indexOf(id);
      if (chk.checked && i > -1) hidden.splice(i, 1);
      if (!chk.checked && i === -1) hidden.push(id);
      markDirty();
    });

    /* 图片上传（自动压缩） */
    root.addEventListener('change', function (e) {
      var el = e.target;
      if (!el.classList || !el.classList.contains('adm-file')) return;
      var file = el.files && el.files[0];
      var target = el.dataset.imgTarget;
      if (!file || !target) return;
      compressImage(file, function (dataUrl) {
        setPath(draft, target, dataUrl);
        markDirty(); renderTab();
        window.Blog.toast('图片已添加，点「保存」生效');
      });
      el.value = '';
    });

    /* 导入 JSON 文件 */
    document.getElementById('admImportFile').addEventListener('change', function (e) {
      var file = e.target.files && e.target.files[0];
      if (!file) return;
      var reader = new FileReader();
      reader.onload = function () {
        try {
          var c = JSON.parse(reader.result);
          if (!c || !c.hero) throw new Error('bad');
          draft = window.Blog.mergeDefaults(c);
          markDirty(); renderTab();
          window.Blog.toast('导入成功，点「保存」后生效');
        } catch (err) {
          window.Blog.toast('导入失败：文件格式不正确');
        }
      };
      reader.readAsText(file);
      e.target.value = '';
    });

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && isOpen()) close();
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && (e.key === 'E' || e.key === 'e')) {
        e.preventDefault();
        isOpen() ? close() : open();
      }
    });
  }

  function compressImage(file, done) {
    var reader = new FileReader();
    reader.onload = function () {
      var im = new Image();
      im.onload = function () {
        var MAX = 1000, w = im.width, h = im.height;
        if (w > MAX || h > MAX) {
          var r = Math.min(MAX / w, MAX / h);
          w = Math.round(w * r); h = Math.round(h * r);
        }
        var cv = document.createElement('canvas');
        cv.width = w; cv.height = h;
        cv.getContext('2d').drawImage(im, 0, 0, w, h);
        done(cv.toDataURL('image/jpeg', 0.82));
      };
      im.onerror = function () { window.Blog.toast('图片读取失败，换一张试试'); };
      im.src = reader.result;
    };
    reader.readAsDataURL(file);
  }

  /* ---------- 动作 ---------- */
  function handleAction(act, btn) {
    if (act === 'save') {
      window.Blog.save(deepClone(draft));
      dirty = false; syncDirty();
      pulse(btn);
      window.Blog.toast('已保存 ✔ 页面已更新');
    }
    if (act === 'discard') {
      draft = deepClone(window.Blog.content);
      dirty = false; syncDirty(); renderTab();
      window.Blog.toast('已放弃未保存的更改');
    }
    if (act === 'export') {
      var blob = new Blob([JSON.stringify(draft, null, 2)], { type: 'application/json' });
      var a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = 'blog-content.json';
      a.click();
      setTimeout(function () { URL.revokeObjectURL(a.href); }, 500);
      window.Blog.toast('已导出 blog-content.json');
    }
    if (act === 'import') {
      document.getElementById('admImportFile').click();
    }
    if (act === 'reset') {
      if (!btn.classList.contains('arm')) {
        btn.classList.add('arm');
        btn.dataset.orig = btn.textContent;
        btn.textContent = '确认恢复默认？';
        setTimeout(function () { btn.classList.remove('arm'); btn.textContent = btn.dataset.orig; }, 2600);
        return;
      }
      btn.classList.remove('arm'); btn.textContent = btn.dataset.orig || '恢复默认';
      window.Blog.reset();
      draft = deepClone(window.Blog.content);
      dirty = false; syncDirty(); renderTab();
      window.Blog.toast('已恢复为默认内容');
    }
  }

  function pulse(btn) {
    btn.classList.add('pulse');
    setTimeout(function () { btn.classList.remove('pulse'); }, 600);
  }
  function markDirty() { dirty = true; syncDirty(); }

  /* ---------- 初始化入口（面板懒构建：首次打开才插入 DOM） ---------- */
  function lazyInit() {
    var btn = document.getElementById('adminBtn');
    if (btn) btn.addEventListener('click', function () {
      if (!root) { buildShell(); bind(); }
      isOpen() ? close() : open();
    });
    document.addEventListener('keydown', function (e) {
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && (e.key === 'E' || e.key === 'e')) {
        e.preventDefault();
        if (!root) { buildShell(); bind(); }
        isOpen() ? close() : open();
      }
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', lazyInit);
  } else {
    lazyInit();
  }
})();
