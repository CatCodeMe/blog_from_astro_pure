import mermaid from 'mermaid'

function initializeMermaid() {
  mermaid.initialize({
    startOnLoad: true,
    theme: document.documentElement.dataset.theme === 'dark' ? 'dark' : 'default',
    securityLevel: 'loose'
  })
}

// 重新渲染所有图表
async function reRenderAllDiagrams() {
  const diagrams = document.querySelectorAll('.mermaid')
  for (const diagram of diagrams) {
    const source = diagram.getAttribute('data-source')
    if (source) {
      try {
        // 清空当前图表
        diagram.innerHTML = ''
        // 生成一个有效的唯一 ID（只使用字母和数字）
        const id = `mermaid-${Math.random().toString(36).substring(2)}`
        // 使用原始源码重新渲染
        const { svg } = await mermaid.render(id, decodeURIComponent(source))
        diagram.innerHTML = svg
      } catch (error) {
        console.error('Failed to re-render diagram:', error)
      }
    }
  }
}

// 监听主题变化并重新渲染
function watchThemeChanges() {
  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      if (
        mutation.type === 'attributes' && 
        mutation.attributeName === 'data-theme'
      ) {
        // 重新初始化 mermaid 配置
        initializeMermaid()
        // 重新渲染所有图表
        reRenderAllDiagrams()
      }
    })
  })

  // 开始监听 HTML 元素的 data-theme 属性变化
  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ['data-theme']
  })
}

class MermaidViewer {
  constructor(diagram) {
    this.diagram = diagram
    this.scale = 1
    this.translateX = 0
    this.translateY = 0
    this.setupModal()
    this.setupActions()
    this.setupDragging()
  }

  calculateInitialScale() {
    const diagram = this.modal.querySelector('.mermaid')
    const container = this.modal.querySelector('.mermaid-modal-content')
    if (!diagram || !container) return 1

    const diagramRect = diagram.getBoundingClientRect()
    const containerRect = container.getBoundingClientRect()

    // 考虑内边距和控制按钮的空间
    const padding = 40
    const controlsHeight = 60
    const availableWidth = containerRect.width - padding * 2
    const availableHeight = containerRect.height - padding * 2 - controlsHeight

    // 计算宽度和高度的缩放比例
    const scaleX = availableWidth / diagramRect.width
    const scaleY = availableHeight / diagramRect.height

    // 使用较小的缩放比例，确保图表完全适应容器
    return Math.min(scaleX, scaleY, 1.5)
  }

  setupModal() {
    this.modal = document.createElement('div')
    this.modal.className = 'mermaid-modal'
    this.modal.innerHTML = `
      <div class="mermaid-modal-content">
        <div class="mermaid-container"></div>
        <div class="mermaid-controls">
          <div class="mermaid-control-group">
            <button class="control-btn" title="Zoom In">
              <svg viewBox="0 0 24 24" width="16" height="16"><path fill="currentColor" d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/></svg>
            </button>
            <button class="control-btn" title="Zoom Out">
              <svg viewBox="0 0 24 24" width="16" height="16"><path fill="currentColor" d="M19 13H5v-2h14v2z"/></svg>
            </button>
            <button class="control-btn" title="Reset">
              <svg viewBox="0 0 24 24" width="16" height="16"><path fill="currentColor" d="M12 5V1L7 6l5 5V7c3.31 0 6 2.69 6 6s-2.69 6-6 6-6-2.69-6-6H4c0 4.42 3.58 8 8 8s8-3.58 8-8-3.58-8-8-8z"/></svg>
            </button>
          </div>
          <div class="mermaid-control-group">
            <button class="control-btn copy-btn" title="Copy Source">
              <svg class="ready" viewBox="0 0 24 24" width="16" height="16">
                <path fill="currentColor" d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z"/>
              </svg>
              <svg class="success" viewBox="0 0 24 24" width="16" height="16">
                <path fill="currentColor" d="M9 16.2L4.8 12l-1.4 1.4L9 19 21 7l-1.4-1.4L9 16.2z"/>
              </svg>
            </button>
            <button class="control-btn close-btn" title="Close">
              <svg viewBox="0 0 24 24" width="16" height="16">
                <path fill="currentColor" d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
              </svg>
            </button>
          </div>
        </div>
      </div>
    `
    document.body.appendChild(this.modal)

    // 设置控制按钮事件
    const controls = this.modal.querySelector('.mermaid-controls')
    const zoomInBtn = controls.querySelector('[title="Zoom In"]')
    const zoomOutBtn = controls.querySelector('[title="Zoom Out"]')
    const resetBtn = controls.querySelector('[title="Reset"]')
    const copyBtn = controls.querySelector('.copy-btn')
    const closeBtn = controls.querySelector('.close-btn')

    zoomInBtn.onclick = () => this.zoom(1.2)
    zoomOutBtn.onclick = () => this.zoom(0.8)
    resetBtn.onclick = () => this.reset()
    closeBtn.onclick = () => this.hide()
    copyBtn.onclick = async () => {
      const code = this.diagram.getAttribute('data-source')
      if (code) {
        try {
          await navigator.clipboard.writeText(decodeURIComponent(code))
          copyBtn.classList.add('copied')
          setTimeout(() => {
            copyBtn.classList.remove('copied')
          }, 2000)
        } catch (err) {
          console.error('Failed to copy:', err)
        }
      }
    }
  }

  setupActions() {
    const actions = document.createElement('div')
    actions.className = 'mermaid-actions'
    
    // 复制按钮
    const copyBtn = document.createElement('button')
    copyBtn.className = 'mermaid-action-btn'
    copyBtn.title = 'Copy Source'
    copyBtn.innerHTML = `
      <svg viewBox="0 0 24 24" width="16" height="16" class="ready">
        <path fill="currentColor" d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z"/>
      </svg>
      <svg viewBox="0 0 24 24" width="16" height="16" class="success">
        <path fill="currentColor" d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z"/>
      </svg>
    `
    
    copyBtn.addEventListener('click', async () => {
      const code = this.diagram.getAttribute('data-source')
      if (code) {
        try {
          await navigator.clipboard.writeText(decodeURIComponent(code))
          copyBtn.classList.add('copied')
          setTimeout(() => copyBtn.classList.remove('copied'), 2000)
        } catch (err) {
          console.error('Failed to copy:', err)
        }
      }
    })

    // 全屏按钮
    const fullscreenBtn = document.createElement('button')
    fullscreenBtn.className = 'mermaid-action-btn'
    fullscreenBtn.title = 'View Full Screen'
    fullscreenBtn.innerHTML = `
      <svg viewBox="0 0 24 24" width="16" height="16">
        <path fill="currentColor" d="M7 14H5v5h5v-2H7v-3zm-2-4h2V7h3V5H5v5zm12 7h-3v2h5v-5h-2v3zM14 5v2h3v3h2V5h-5z"/>
      </svg>
    `
    fullscreenBtn.onclick = () => this.show()
    
    actions.appendChild(copyBtn)
    actions.appendChild(fullscreenBtn)
    this.diagram.parentNode.appendChild(actions)
  }

  setupBrand() {
    const brand = document.createElement('div')
    brand.className = 'mermaid-brand'
    brand.innerHTML = `<span>mermaid</span>`
    this.diagram.parentNode.appendChild(brand)
  }

  setupDragging() {
    let isDragging = false
    let startX = 0
    let startY = 0
    let startTranslateX = 0
    let startTranslateY = 0

    const container = this.modal.querySelector('.mermaid-container')

    // 添加鼠标滚轮缩放
    container.addEventListener('wheel', (e) => {
      if (e.ctrlKey) {
        e.preventDefault()
        const delta = e.deltaY > 0 ? 0.9 : 1.1
        this.zoom(delta)
      }
    })

    container.addEventListener('mousedown', (e) => {
      if (e.target === container || e.target.closest('.mermaid')) {
        isDragging = true
        startX = e.clientX
        startY = e.clientY
        startTranslateX = this.translateX
        startTranslateY = this.translateY
        container.style.cursor = 'grabbing'
      }
    })

    window.addEventListener('mousemove', (e) => {
      if (isDragging) {
        const dx = e.clientX - startX
        const dy = e.clientY - startY
        this.translateX = startTranslateX + dx
        this.translateY = startTranslateY + dy
        this.updateTransform()
      }
    })

    window.addEventListener('mouseup', () => {
      isDragging = false
      container.style.cursor = 'grab'
    })
  }

  show() {
    const clone = this.diagram.cloneNode(true)
    const container = this.modal.querySelector('.mermaid-container')
    container.innerHTML = ''
    container.appendChild(clone)
    
    // 添加品牌文字
    const brand = document.createElement('div')
    brand.className = 'mermaid-brand'
    brand.innerHTML = 'mermaid'
    container.appendChild(brand)
    
    this.modal.classList.add('active')
    
    // 等待下一帧确保 DOM 更新完成
    requestAnimationFrame(() => {
      this.scale = this.calculateInitialScale()
      this.translateX = 0
      this.translateY = 0
      this.updateTransform()
    })

    // 显示控制按钮
    const controls = this.modal.querySelector('.mermaid-controls')
    controls.style.bottom = '1rem'

    // 点击模态框背景关闭
    this.modal.addEventListener('click', (e) => {
      if (e.target === this.modal) this.hide()
    })
  }

  hide() {
    this.modal.classList.remove('active')
    // 隐藏控制按钮
    const controls = this.modal.querySelector('.mermaid-controls')
    controls.style.bottom = '-3rem'
  }

  reset() {
    this.scale = this.calculateInitialScale()
    this.translateX = 0
    this.translateY = 0
    this.updateTransform()
  }

  zoom(factor) {
    const newScale = this.scale * factor
    // 限制缩放范围
    if (newScale >= 0.5 && newScale <= 5) {
      this.scale = newScale
      this.updateTransform()
    }
  }

  updateTransform() {
    const diagram = this.modal.querySelector('.mermaid')
    if (diagram) {
      diagram.style.transform = `translate(-50%, -50%) translate(${this.translateX}px, ${this.translateY}px) scale(${this.scale})`
    }
  }
}

async function initAllDiagrams() {
  // 选择所有 mermaid 代码块，包括已经被 remark 插件处理过的
  const mermaidDivs = document.querySelectorAll('.mermaid-wrapper .mermaid');
  
  for (const div of mermaidDivs) {
    if (!div.hasAttribute('data-viewer-initialized')) {
      // 标记为已初始化 viewer
      div.setAttribute('data-viewer-initialized', 'true');
      new MermaidViewer(div);
    }
  }
  
  // 初始化所有 mermaid 图表
  await mermaid.init(undefined, '.mermaid');
}

// 导出初始化函数
export function initMermaid() {
  initializeMermaid()
  watchThemeChanges()
  initAllDiagrams()
}
