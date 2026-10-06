/* ========================================
   content.js — 站点内容唯一数据源（模板版）
   ----------------------------------------
   · 所有可编辑内容都在这里（中英双语）
   · 当前是【示例内容】——请替换成你自己的信息
   · 另一种改法：浏览器打开页面后按 Ctrl+Shift+E
     打开可视化编辑面板（改动存在浏览器本地，
     点「导出JSON」后可贴回本文件，让所有访客看到）
   ======================================== */

const DEFAULT_CONTENT = {

  /* --- 页面设置 --- */
  meta: {
    hiddenSections: ['blog']    // 博客区默认隐藏；写了真文章后在编辑面板「首屏」标签里勾选恢复
  },

  /* --- 首屏 Hero（个人品牌定位式） --- */
  hero: {
    avatar: 'images/placeholder-avatar.svg',
    greeting: { zh: '你好，我是', en: "Hello, I'm" },
    name: '你的名字',
    nameEn: 'Your Name',
    personalStatement: {
      zh: '一句话概括你自己。',
      en: 'One sentence about you.'
    },
    keywords: [
      { zh: '关键词一', en: 'Keyword 1' },
      { zh: '关键词二', en: 'Keyword 2' },
      { zh: '关键词三', en: 'Keyword 3' }
    ],
    focus: {
      zh: '你的求职方向 · 方向二 · 方向三',
      en: 'Your Focus · Area 2 · Area 3'
    },
    title: {
      zh: '你的学校 · 你的身份（一句话背景）',
      en: 'Your School · Your Identity'
    },
    phone: '000-0000-0000',
    subtitle: {
      zh: '一句写给面试官的 slogan。',
      en: 'A tagline for recruiters.'
    },
    tags: [
      { zh: '标签一', en: 'Tag 1' },
      { zh: '标签二', en: 'Tag 2' },
      { zh: '标签三', en: 'Tag 3' },
      { zh: '标签四', en: 'Tag 4' }
    ],
    stats: null,
    resume: { label: { zh: '下载简历', en: 'Download Résumé' }, url: '' },  // url 填上 PDF 链接后自动出现按钮
    scroll: { zh: '向下探索', en: 'Scroll to explore' }
  },

  /* --- 关于我 --- */
  about: {
    intro: {
      zh: '2-3 句话介绍你的方向、兴趣和正在做的事。',
      en: 'Two or three sentences about your focus, interests and what you are working on.'
    },
    skills: [
      { zh: '技能标签一', en: 'Skill 1' },
      { zh: '技能标签二', en: 'Skill 2' },
      { zh: '技能标签三', en: 'Skill 3' },
      { zh: '技能标签四', en: 'Skill 4' },
      { zh: '技能标签五', en: 'Skill 5' },
      { zh: '技能标签六', en: 'Skill 6' },
      { zh: '技能标签七', en: 'Skill 7' },
      { zh: '技能标签八', en: 'Skill 8' }
    ],
    aiToolkit: [
      { name: 'Claude', desc: { zh: 'AI 写作与编程', en: 'AI writing & coding' } },
      { name: 'Claude Code', desc: { zh: 'AI 驱动开发', en: 'AI-powered dev' } },
      { name: 'Notion', desc: { zh: '知识管理', en: 'Knowledge base' } },
      { name: '飞书', desc: { zh: '多维表格与自动化', en: 'Base & automations' } },
      { name: 'AI Video', desc: { zh: '视频生成', en: 'AI video production' } },
      { name: 'AI Image', desc: { zh: '图像设计', en: 'AI image design' } },
      { name: 'Figma', desc: { zh: '设计协作', en: 'Design collaboration' } },
      { name: 'Analytics', desc: { zh: '数据可视化', en: 'Data analytics & BI' } }
    ],
    edu: [
      {
        year: '20XX – 20XX',
        text: {
          zh: '你的大学 · 你的专业（硕士）',
          en: 'Your University · Your Major (M.A.)'
        }
      },
      {
        year: '20XX – 20XX',
        text: {
          zh: '你的大学 · 你的专业（本科）',
          en: 'Your University · Your Major (B.A.)'
        }
      }
    ],
    story: [
      {
        zh: '【示例】这里写你的个人故事：你从哪里来、为什么选择了现在的方向。替换成你自己的经历即可。',
        en: '[Example] Your personal story: where you come from and why you chose this path. Replace with your own.'
      },
      {
        zh: '【示例】第二段：你的性格、爱好，和你的日常。',
        en: '[Example] Paragraph two: your personality, hobbies, and daily life.'
      }
    ]
  },

  /* --- 作品集 / 项目案例（STAR 结构：背景 → 动作 → 数据结果） --- */
  /* palette 可选: cd(玫红) / siemens(绿) / baidu(蓝) / plum(紫) / amber(琥珀) */
  portfolio: [
    {
      palette: 'plum',
      tag: { zh: '示例 · 数据分析', en: 'Example · Data' },
      title: { zh: '示例项目一：数据分析平台', en: 'Example Project 1: Analytics Platform' },
      company: '示例公司',
      situation: {
        zh: '【背景】用 1-2 句话交代业务问题和你的角色。',
        en: '[Context] Describe the business problem and your role in 1-2 sentences.'
      },
      action: {
        zh: '【动作】你做了什么：方法、工具、协作方式。',
        en: '[Action] What you did: methods, tools, and collaboration.'
      },
      results: [
        { value: '30%', label: { zh: '示例指标 A', en: 'Metric A' } },
        { value: '2 倍', label: { zh: '示例指标 B', en: 'Metric B' } },
        { value: '实时', label: { zh: '示例指标 C', en: 'Metric C' } }
      ],
      url: ''
    },
    {
      palette: 'amber',
      tag: { zh: '示例 · 用户增长', en: 'Example · Growth' },
      title: { zh: '示例项目二：增长活动', en: 'Example Project 2: Growth Campaign' },
      company: '示例公司',
      situation: {
        zh: '【背景】为什么要做这个活动，目标是什么。',
        en: '[Context] Why this campaign was launched and what it aimed for.'
      },
      action: {
        zh: '【动作】方案怎么设计的、你负责哪部分、怎么落地的。',
        en: '[Action] How the plan was designed and delivered, and what you owned.'
      },
      results: [
        { value: '10万+', label: { zh: '示例指标 A', en: 'Metric A' } },
        { value: '15%', label: { zh: '示例指标 B', en: 'Metric B' } },
        { value: '正向', label: { zh: '示例指标 C', en: 'Metric C' } }
      ],
      url: ''
    },
    {
      palette: 'siemens',
      tag: { zh: '示例 · 活动运营', en: 'Example · Campaign' },
      title: { zh: '示例项目三：B 端获客活动', en: 'Example Project 3: B2B Lead Campaign' },
      company: '示例公司',
      situation: {
        zh: '【背景】目标客户是谁、痛点是什么。',
        en: '[Context] Target audience and their pain points.'
      },
      action: {
        zh: '【动作】渠道怎么组合、内容怎么做、怎么触达。',
        en: '[Action] Channel mix, content, and outreach approach.'
      },
      results: [
        { value: '1,000+', label: { zh: '示例指标 A', en: 'Metric A' } },
        { value: '100+', label: { zh: '示例指标 B', en: 'Metric B' } },
        { value: '50%', label: { zh: '示例指标 C', en: 'Metric C' } }
      ],
      url: ''
    },
    {
      palette: 'cd',
      tag: { zh: '示例 · 内容运营', en: 'Example · Content' },
      title: { zh: '示例项目四：内容栏目光盘', en: 'Example Project 4: Content Series' },
      company: '示例公司',
      situation: {
        zh: '【背景】用户需要什么内容、缺口在哪里。',
        en: '[Context] What content users needed and where the gap was.'
      },
      action: {
        zh: '【动作】从 0 到 1 的内容规划、制作与数据迭代。',
        en: '[Action] Content planning, production and iteration from scratch.'
      },
      results: [
        { value: '40+期', label: { zh: '示例指标 A', en: 'Metric A' } },
        { value: '90+条', label: { zh: '示例指标 B', en: 'Metric B' } },
        { value: '<1%', label: { zh: '示例指标 C', en: 'Metric C' } }
      ],
      url: ''
    }
  ],

  /* --- 获奖与经历 --- */
  exp: {
    certificates: [
      { zh: '证书一（替换成你的）', en: 'Certificate 1' },
      { zh: '证书二', en: 'Certificate 2' },
      { zh: '证书三', en: 'Certificate 3' },
      { zh: '证书四', en: 'Certificate 4' }
    ],
    scholarships: [
      { zh: '奖学金一', en: 'Scholarship 1' },
      { zh: '奖学金二', en: 'Scholarship 2' }
    ],
    competitions: [
      {
        tag: { zh: '国家级', en: 'National' },
        text: { zh: '示例竞赛奖项一（替换成你的）', en: 'Example Award 1' }
      },
      {
        tag: { zh: '省级', en: 'Provincial' },
        text: { zh: '示例竞赛奖项二', en: 'Example Award 2' }
      }
    ],
    honors: [
      { zh: '荣誉称号一', en: 'Honor 1' },
      { zh: '荣誉称号二', en: 'Honor 2' },
      { zh: '荣誉称号三', en: 'Honor 3' }
    ]
  },

  /* --- 实习经历 --- */
  internships: [
    {
      initials: 'A',
      palette: 'plum',
      company: '示例公司一',
      role: { zh: '示例岗位（如：内容运营）', en: 'Your Role (e.g. Content Operations)' },
      period: '20XX.XX – 20XX.XX',
      bullets: [
        { zh: '【示例】一句话写清：你做了什么 + 可量化的结果（增长数字/效率/转化率）。', en: '[Example] What you did + a measurable result.' },
        { zh: '【示例】第二条工作内容。', en: '[Example] Second bullet.' }
      ]
    },
    {
      initials: 'B',
      palette: 'amber',
      company: '示例公司二',
      role: { zh: '示例岗位', en: 'Your Role' },
      period: '20XX.XX – 20XX.XX',
      bullets: [
        { zh: '【示例】把你最有含金量的一段实习放前面。', en: '[Example] Put your strongest internship first.' },
        { zh: '【示例】第二条工作内容。', en: '[Example] Second bullet.' }
      ]
    },
    {
      initials: 'C',
      palette: 'cd',
      company: '示例公司三',
      role: { zh: '示例岗位', en: 'Your Role' },
      period: '20XX.XX – 20XX.XX',
      bullets: [
        { zh: '【示例】每段实习 2-4 条即可，突出结果。', en: '[Example] 2-4 bullets per internship, highlight results.' }
      ]
    }
  ],

  /* 注意：整个博客板块当前在 meta.hiddenSections 中隐藏，写好真文章后记得恢复 */
  blog: [
    {
      img: 'images/placeholder-photo.svg',
      alt: { zh: '示例配图', en: 'Example image' },
      date: '20XX.XX',
      title: { zh: '示例文章标题一', en: 'Example Post Title 1' },
      excerpt: {
        zh: '【示例】文章摘要，一两句话。',
        en: '[Example] A short excerpt.'
      },
      url: ''
    },
    {
      img: 'images/placeholder-photo.svg',
      alt: { zh: '示例配图', en: 'Example image' },
      date: '20XX.XX',
      title: { zh: '示例文章标题二', en: 'Example Post Title 2' },
      excerpt: {
        zh: '【示例】文章摘要，一两句话。',
        en: '[Example] A short excerpt.'
      },
      url: ''
    },
    {
      img: 'images/placeholder-photo.svg',
      alt: { zh: '示例配图', en: 'Example image' },
      date: '20XX.XX',
      title: { zh: '示例文章标题三', en: 'Example Post Title 3' },
      excerpt: {
        zh: '【示例】文章摘要，一两句话。',
        en: '[Example] A short excerpt.'
      },
      url: ''
    }
  ],

  /* --- 联系我（已合并至关于我区块） --- */
  contact: {
    email: 'you@example.com',
    phone: '000-0000-0000',
    location: { zh: '你的城市', en: 'Your City' }
  }
};
