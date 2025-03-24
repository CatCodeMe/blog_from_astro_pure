
import type { Root } from 'mdast'
import type { Plugin } from 'unified'
import { visit } from 'unist-util-visit'

/** 优先处理 mermaid, 不受代码高亮组件影响 */
export const remarkMermaid: Plugin<[], Root> = function () {
  return function (tree) {
    visit(tree, 'code', (node, index, parent) => {
      if (node.lang === 'mermaid') {
        const htmlNode = {
          type: 'html',
          value: `
            <div class="mermaid-wrapper">
              <div class="mermaid-container">
                <pre class="mermaid" data-source="${encodeURIComponent(node.value.trim())}">${node.value.trim()}</pre>
                <div class="mermaid-brand">
                  <svg viewBox="0 0 24 24" width="16" height="16">
                    <path fill="currentColor" d="M12 2L2 19h20L12 2zm0 3.8L18.5 17H5.5L12 5.8z"/>
                  </svg>
                  <span>Mermaid</span>
                </div>
              </div>
            </div>`
        };

        if (parent && typeof index === 'number') {
          parent.children[index] = htmlNode;
        }
      }
    });
  };
};

