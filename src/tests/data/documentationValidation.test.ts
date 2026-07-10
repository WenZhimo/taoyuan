import { describe, expect, it } from 'vitest'

interface RequiredDocument {
  file: string
  headings: readonly string[]
}

const REQUIRED_DOCUMENTS: readonly RequiredDocument[] = [
  {
    file: 'architecture.md',
    headings: ['## 分层职责', '## 依赖方向', '## 新功能放置决策']
  },
  {
    file: 'save-compatibility.md',
    headings: ['## 当前存档格式', '## 字段重命名', '## 禁止直接删除字段']
  },
  {
    file: 'game-rules.md',
    headings: ['## 掉落率倍率', '## 小憩', '## 睡袋', '## 物品堆叠', '## 列表分页']
  },
  {
    file: 'electron-packaging.md',
    headings: ['## 当前构建产物', '## 数据保存位置', '## 为什么不再生成单 EXE']
  },
  {
    file: 'testing-guide.md',
    headings: ['## 常用命令', '## 存档迁移测试', '## 性能测试']
  }
]

const DOCUMENT_MODULES = import.meta.glob('../../../docs-source/*.md', {
  eager: true,
  import: 'default',
  query: '?raw'
}) as Record<string, string>

const getDocumentContent = (file: string): string | undefined =>
  DOCUMENT_MODULES[`../../../docs-source/${file}`]

const readRequiredDocuments = (): Array<{ file: string; content: string }> =>
  REQUIRED_DOCUMENTS.map(document => {
    const content = getDocumentContent(document.file)
    if (content === undefined) throw new Error(`${document.file} is missing`)
    return { file: document.file, content }
  })

const findRelativeMarkdownLinks = (content: string): string[] => {
  const links: string[] = []
  for (const match of content.matchAll(/\[[^\]]+\]\(([^)]+)\)/g)) {
    const target = match[1]
    if (target && !target.startsWith('http://') && !target.startsWith('https://') && !target.startsWith('#')) {
      links.push(target.split('#')[0]!)
    }
  }
  return links
}

describe('maintenance documentation', () => {
  it('keeps every stage 10 document and required section present', () => {
    for (const document of REQUIRED_DOCUMENTS) {
      const content = getDocumentContent(document.file)
      expect(content, `${document.file} is missing`).toBeTypeOf('string')
      for (const heading of document.headings) {
        expect(content, `${document.file} is missing ${heading}`).toContain(heading)
      }
    }
  })

  it('keeps relative links between maintenance documents valid', () => {
    const missingLinks: string[] = []

    for (const document of readRequiredDocuments()) {
      for (const link of findRelativeMarkdownLinks(document.content)) {
        const targetFile = link.replace(/^\.\//, '')
        if (getDocumentContent(targetFile) === undefined) {
          missingLinks.push(`${document.file} -> ${link}`)
        }
      }
    }

    expect(missingLinks).toEqual([])
  })

  it('validates all maintenance documents within the performance boundary', () => {
    const start = performance.now()
    let checkedSections = 0

    for (let iteration = 0; iteration < 100; iteration++) {
      for (const document of readRequiredDocuments()) {
        checkedSections += document.content.match(/^## /gm)?.length ?? 0
        findRelativeMarkdownLinks(document.content)
      }
    }

    expect(checkedSections).toBeGreaterThan(0)
    expect(performance.now() - start).toBeLessThan(1000)
  })
})
