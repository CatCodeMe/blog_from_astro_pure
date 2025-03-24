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
// import { brainDbAstro, getBrainDb } from "@braindb/astro"

// // 初始化 BrainDB
// const bdb = getBrainDb()
// await bdb.ready()


// Local integrations
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
    icon({
      include: {
        devicon: ['*'],
      }
    }),
    AstroPureIntegration(config),
    // Comment out BrainDB temporarily
    // brainDbAstro({
    //   remarkWikiLink: false,
    //   git: false,
    //   root: 'src/content',
    //   cache: true,
    //   slug: (filePath, collection) => {
    //     let slug = filePath
    //       .replace(/^\/\//, '')
    //       .replace(/^src\/content\//, '')
    //       .replace(/^\/+/, '')
    //       .replace(/\.(md|mdx)$/, '')
    //       .replace(/\/index$/, '')
    //     return slug
    //   }
    // }),
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
              .replace(/^\/\//, '')
              .replace(/^src\/content\//, '')
              .replace(/^\/+/, '')
              .replace(/\.(md|mdx)$/, '')
              .replace(/\/index$/, '')

            return {
              hName: "a",
              hProperties: {
                href: `/${normalizedSlug}`,
                class: "internal-link",
              },
              hChildren: [
                {
                  type: "text",
                  value: alias || normalizedSlug,
                },
              ],
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
