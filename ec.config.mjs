import { defineEcConfig } from 'astro-expressive-code'
import { pluginLineNumbers } from '@expressive-code/plugin-line-numbers'
import { pluginCollapsibleSections } from '@expressive-code/plugin-collapsible-sections'
import { pluginLanguageBadge } from './src/plugins/experssive-code-language-badge.js'

export default defineEcConfig({
  plugins: [
    pluginLineNumbers(),
    pluginCollapsibleSections(),
    pluginLanguageBadge(),
  ],
  defaultProps: {
    collapseStyle: 'collapsible-auto',
  },
  frames: {
    extractFileNameFromCode: true,
  },
  themes: ['github-light','github-dark'],
  removeUnusedThemes: true,
  // themeCssRoot: '#toggleDarkMode' //可以成功切换主题,但会导致页面效果错误
})
