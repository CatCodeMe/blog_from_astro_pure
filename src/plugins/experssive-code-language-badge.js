import { definePlugin } from '@expressive-code/core'

export function pluginLanguageBadge() {
  return definePlugin({
    name: 'Language Badge',
    baseStyles: ({ cssVar }) => `
      [data-language]::before {
        position: absolute;
        z-index: 2;
        right: calc(${cssVar('borderWidth')} + ${cssVar('uiPaddingInline')} / 2);
        top: calc(${cssVar('borderWidth')} + 0.35rem);
        height: 1.5rem;
        padding: 0 0 0 2rem;
        content: attr(data-language);
        font-size: 0.75rem;
        color: hsl(var(--primary));
        background-color: transparent;
        pointer-events: none;
        transition: opacity 0.2s;
        display: inline-flex;
        align-items: center;
        line-height: 1;
        background-position: 0.5rem 50%;
        background-repeat: no-repeat;
        background-size: 0.9rem 0.9rem;
      }
      
      /* 为不同语言设置背景图标 */
      [data-language="javascript"]::before {
        background-image: url('https://cdn.jsdelivr.net/gh/devicons/devicon/icons/javascript/javascript-original.svg');
      }
      [data-language="typescript"]::before {
        background-image: url('https://cdn.jsdelivr.net/gh/devicons/devicon/icons/typescript/typescript-original.svg');
      }
      [data-language="python"]::before {
        background-image: url('https://cdn.jsdelivr.net/gh/devicons/devicon/icons/python/python-original.svg');
      }
      [data-language="rust"]::before {
        background-image: url('https://cdn.jsdelivr.net/gh/devicons/devicon/icons/rust/rust-plain.svg');
      }
      [data-language="java"]::before {
        background-image: url('https://cdn.jsdelivr.net/gh/devicons/devicon/icons/java/java-original.svg');
      }
      [data-language="go"]::before {
        background-image: url('https://cdn.jsdelivr.net/gh/devicons/devicon/icons/go/go-original.svg');
      }

      /* 保持原有的复制按钮交互逻辑 */
      .frame:not(.has-title):not(.is-terminal) {
        @media not (hover: hover) {
          .copy {
            margin-right: 3rem;
          }
        }
        @media (hover: hover) {
          &:hover [data-language]::before {
            opacity: 0;
          }
        }
      }
    `,
  })
}
