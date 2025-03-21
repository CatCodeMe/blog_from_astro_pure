// @ts-check

import { rehypeHeadingIds } from '@astrojs/markdown-remark'
import vercel from '@astrojs/vercel'
import AstroPureIntegration from './packages/pure/index.ts'
import { defineConfig } from 'astro/config'
import rehypeKatex from 'rehype-katex'
import remarkMath from 'remark-math'

// Others
// import { visualizer } from 'rollup-plugin-visualizer'
import rehypeCallouts from 'rehype-callouts'
import remarkBreaks from 'remark-breaks'
import expressiveCode from 'astro-expressive-code'

import icon from 'astro-icon'

import remarkWikiLink from "@braindb/remark-wiki-link"
import { brainDbAstro, getBrainDb } from "@braindb/astro"

// 初始化 BrainDB
const bdb = getBrainDb()
await bdb.ready()

// Local integrations
import { outputCopier } from './src/plugins/output-copier.ts'
// Local rehype & remark plugins
import rehypeAutolinkHeadings from './src/plugins/rehype-auto-link-headings.ts'

import config from './src/site.config.ts'

// https://astro.build/config
export default defineConfig({
  // Top-Level Options
  site: 'https://8cat.life',
  // base: '/docs',
  trailingSlash: 'never',

  // Adapter
  // https://docs.astro.build/en/guides/deploy/
  // 1. Vercel (serverless)
  adapter: vercel(),
  output: 'server',
  // 2. Vercel (static)
  // adapter: vercelStatic(),
  // 3. Local (standalone)
  // adapter: node({ mode: 'standalone' }),
  // output: 'server',
  // ---

  image: {
    service: {
      entrypoint: 'astro/assets/services/sharp'
    }
  },

  integrations: [
    expressiveCode(),
    // astro-pure will automatically add sitemap, mdx & unocss
    // sitemap(),
    // mdx(),
    icon({
      include: {
        devicon: ['*'],
      }
    }),
    AstroPureIntegration(config),
    // (await import('@playform/compress')).default({
    //   SVG: false,
    //   Exclude: ['index.*.js']
    // }),

    // Temporary fix vercel adapter
    // static build method is not needed
    outputCopier({
      integ: ['sitemap', 'pagefind']
    }),
    brainDbAstro({
      remarkWikiLink: false,
      git: false,
      root: 'src/content',
      slug: (filePath) => {
        let slug = filePath
          .replace(/^src\/content\//, '')
          .replace(/^\/+/, '')
          .replace(/\.(md|mdx)$/, '')
          .replace(/\/index$/, '')
        return slug
      }
    }),
  ],
  // root: './my-project-directory',

  // Prefetch Options
  prefetch: true,
  // Server Options
  server: {
    host: true
  },
  // Markdown Options
  markdown: {
    remarkPlugins: [
      remarkMath,
      [
        remarkWikiLink,
        {
          linkTemplate: ({ slug, alias }) => {
            let normalizedSlug = slug
              .replace(/^src\/content\//, '')
              .replace(/^\/+/, '')              // 移除开头的斜杠
              .replace(/\.(md|mdx)$/, '')       // 移除文件扩展名
              .replace(/\/index$/, '')          // 移除 index 结尾
              // .replace(/\/+$/, '')              // 移除结尾的斜杠
              // .replace(/^(?!blog\/|docs\/)/, 'blog/')
            
            const doc = bdb.documentsSync().find(d => d.slug() === normalizedSlug)
            
            if (doc) {
              return {
                hName: "a",
                hProperties: {
                  href: `/${doc.slug()}`,
                  class: "wiki-link",
                },
                hChildren: [
                  {
                    type: "text",
                    value: alias ?? doc.frontmatter().title ?? normalizedSlug,
                  },
                ],
              }
            }
            
            return {
              hName: "span",
              hProperties: {
                class: "broken-link",
                title: `Can't resolve link to ${normalizedSlug}`,
              },
              hChildren: [{ type: "text", value: alias || normalizedSlug }],
            }
          },
        },
      ],
      remarkBreaks
    ],
    rehypePlugins: [
      [rehypeKatex, {}],
      rehypeHeadingIds,
      [
        rehypeAutolinkHeadings,
        {
          behavior: 'append',
          properties: { className: ['anchor'] },
          content: { type: 'text', value: '#' }
        }
      ],
      [rehypeCallouts, {
        props: {
          containerProps: { class: ['callout', 'not-prose'] },
        }
      }]
    ],
  },
  experimental: {
    svg: true,
    contentIntellisense: true
  },
  vite: {
    plugins: [
      //   visualizer({
      //     emitFile: true,
      //     filename: 'stats.html'
      //   })
    ]
  }
})
