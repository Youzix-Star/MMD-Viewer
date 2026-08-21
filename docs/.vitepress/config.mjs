import { defineConfig } from 'vitepress'

const base = process.env.DOCS_BASE || '/'

export default defineConfig({
  title: 'MMD Viewer',
  description: 'Web 端 MMD/PMX 模型查看器文档',
  lang: 'zh-CN',
  base,
  lastUpdated: true,
  head: [
    ['link', { rel: 'preconnect', href: 'https://fonts.googleapis.com' }],
    ['link', { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: '' }],
    ['link', { rel: 'stylesheet', href: 'https://fonts.googleapis.com/css2?family=Noto+Sans+SC:wght@400;500;600;700&display=swap' }],
  ],
  themeConfig: {
    logo: '/logo.png',
    nav: [
      { text: '首页', link: '/' },
      {
        text: '指南',
        items: [
          { text: '快速开始', link: '/start/' },
          { text: '部署与使用', link: '/setup/' },
          { text: '模型说明', link: '/guide/models' },
          { text: '动作播放', link: '/guide/motion' },
          { text: '物理系统', link: '/guide/physics' },
          { text: '界面说明', link: '/ui/' },
        ],
      },
      { text: 'GitHub', link: 'https://github.com/Youzix-Star/MMD-Viewer' },
    ],
    sidebar: [
      {
        text: '指南',
        items: [
          { text: '快速开始', link: '/start/' },
          { text: '部署与使用', link: '/setup/' },
          { text: '模型说明', link: '/guide/models' },
          { text: '动作播放', link: '/guide/motion' },
          { text: '物理系统', link: '/guide/physics' },
          { text: '界面说明', link: '/ui/' },
        ],
      },
    ],
    search: { provider: 'local' },
    footer: {
      message: '基于 Three.js + Ammo.js · AGPLv3',
      copyright: '感谢陌袹陌开创项目'
    },
    socialLinks: [
      { icon: 'github', link: 'https://github.com/Youzix-Star/MMD-Viewer' }
    ]
  }
})
