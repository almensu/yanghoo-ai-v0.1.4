/**
 * Markdown Blocks System - 集成到yanghoo-ai项目
 * 为现有的Markdown系统添加块模式功能
 */

// 生成UUID的工具函数
const generateUUID = () => {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID()
  }
  // 备用方案
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0
    const v = c === 'x' ? r : ((r & 0x3) | 0x8)
    return v.toString(16)
  })
}

// ========== 块类型定义 ==========
export const BlockTypes = {
  PARAGRAPH: 'paragraph',
  HEADING: 'heading',
  CODE: 'code',
  LIST: 'list',
  IMAGE: 'image',
  TABLE: 'table',
  QUOTE: 'quote',
  DIVIDER: 'divider'
}

// ========== 块数据模型 ==========
export class Block {
  constructor(type, content, options = {}) {
    this.id = generateUUID()
    this.type = type
    this.content = content
    this.metadata = {
      created_at: new Date(),
      updated_at: new Date(),
      position: options.position || 0,
      author: options.author,
      parent_document: options.documentId,
      tags: options.tags || [],
      ai_generated: false,
      level: options.level, // for headings
      language: options.language // for code blocks
    }
    this.references = {
      referenced_by: [],
      references_to: []
    }
  }

  update(updates) {
    Object.assign(this, updates)
    this.metadata.updated_at = new Date()
    return this
  }

  clone() {
    const cloned = new Block(this.type, this.content, {
      position: this.metadata.position,
      author: this.metadata.author,
      documentId: this.metadata.parent_document,
      tags: [...this.metadata.tags],
      level: this.metadata.level,
      language: this.metadata.language
    })
    cloned.id = this.id
    cloned.metadata = { ...this.metadata }
    cloned.references = {
      referenced_by: [...this.references.referenced_by],
      references_to: [...this.references.references_to]
    }
    return cloned
  }
}

// ========== Markdown解析器 ==========
export class MarkdownParser {
  parseToBlocks(markdown, options = {}) {
    if (!markdown || typeof markdown !== 'string') {
      return []
    }

    const lines = markdown.split('\n')
    const blocks = []
    let currentBlock = null
    let position = 0

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i]
      const blockType = this.detectBlockType(line, lines, i)

      // 处理代码块
      if (blockType === 'code' && currentBlock?.type !== 'code') {
        if (currentBlock) {
          blocks.push(this.createBlock(currentBlock, position++, options))
          currentBlock = null
        }
        
        currentBlock = {
          type: 'code',
          content: [line],
          startLine: i
        }
        continue
      }

      // 结束代码块
      if (currentBlock?.type === 'code' && line.trim().startsWith('```') && i > currentBlock.startLine) {
        currentBlock.content.push(line)
        blocks.push(this.createBlock(currentBlock, position++, options))
        currentBlock = null
        continue
      }

      // 继续代码块
      if (currentBlock?.type === 'code') {
        currentBlock.content.push(line)
        continue
      }

      // 处理空行
      if (line.trim() === '') {
        if (currentBlock) {
          blocks.push(this.createBlock(currentBlock, position++, options))
          currentBlock = null
        }
        continue
      }

      // 处理列表延续
      if (currentBlock?.type === 'list' && this.isListContinuation(line)) {
        currentBlock.content.push(line)
        continue
      }

      // 处理段落延续
      if (currentBlock?.type === 'paragraph' && blockType === 'paragraph') {
        currentBlock.content.push(line)
        continue
      }

      // 处理表格延续
      if (currentBlock?.type === 'table' && this.isTableRow(line, lines, i)) {
        currentBlock.content.push(line)
        continue
      }

      // 开始新块
      if (currentBlock) {
        blocks.push(this.createBlock(currentBlock, position++, options))
      }

      currentBlock = {
        type: blockType,
        content: [line],
        startLine: i
      }
    }

    // 处理最后一个块
    if (currentBlock) {
      blocks.push(this.createBlock(currentBlock, position++, options))
    }

    return blocks.filter(block => block.content.trim().length > 0)
  }

  detectBlockType(line, allLines, lineIndex) {
    const trimmed = line.trim()

    if (trimmed.startsWith('```')) return 'code'
    if (trimmed.match(/^#{1,6}\s+/)) return 'heading'
    if (trimmed.match(/^[*\-+]\s+/) || trimmed.match(/^\d+\.\s+/)) return 'list'
    if (trimmed.startsWith('>')) return 'quote'
          if (trimmed.match(/^[*\-_]{3,}$/)) return 'divider'
    if (trimmed.includes('|') && this.isTableRow(trimmed, allLines, lineIndex)) return 'table'
    if (trimmed.match(/^!\[.*\]\(.*\)$/)) return 'image'

    return 'paragraph'
  }

  isListContinuation(line) {
    const trimmed = line.trim()
    
    if (trimmed.match(/^[*\-+]\s+/) || trimmed.match(/^\d+\.\s+/)) {
      return true
    }

    if (line.match(/^[ \t]+/) && trimmed.length > 0) {
      return true
    }

    return false
  }

  isTableRow(line, allLines, lineIndex) {
    if (!line.includes('|')) return false

    // 检查下一行是否是表格分隔符
    if (lineIndex + 1 < allLines.length) {
      const nextLine = allLines[lineIndex + 1].trim()
      if (nextLine.match(/^\|?[\s\-|:]+\|?$/)) {
        return true
      }
    }

    // 检查是否在现有表格中
    if (lineIndex > 0) {
      const prevLine = allLines[lineIndex - 1].trim()
      if (prevLine.includes('|')) {
        return true
      }
    }

    return false
  }

  createBlock(blockData, position, options) {
    const content = blockData.content.join('\n').trim()
    
    const blockOptions = {
      position,
      author: options.author,
      documentId: options.documentId,
      tags: options.tags || []
    }

    // 添加类型特定的元数据
    if (blockData.type === 'heading') {
      const match = content.match(/^(#{1,6})\s+/)
      if (match) {
        blockOptions.level = match[1].length
      }
    }

    if (blockData.type === 'code') {
      const match = content.match(/^```(\w+)/)
      if (match) {
        blockOptions.language = match[1]
      }
    }

    return new Block(blockData.type, content, blockOptions)
  }

  // 序列化块回markdown
  serializeBlocks(blocks) {
    if (!Array.isArray(blocks)) {
      return ''
    }

    return blocks
      .sort((a, b) => a.metadata.position - b.metadata.position)
      .map(block => block.content)
      .join('\n\n')
  }

  // 提取引用
  extractReferences(content) {
    const references = []
    
    // 匹配 [[blockId]] 或 @{blockId} 模式
    const blockRefPattern = /\[\[([^\]]+)\]\]|@\{([^}]+)\}/g
    let match

    while ((match = blockRefPattern.exec(content)) !== null) {
      const refId = match[1] || match[2]
      if (refId && !references.includes(refId)) {
        references.push(refId.trim())
      }
    }

    return references
  }

  // 解析引用并替换为可点击链接
  parseReferences(content, onReferenceClick) {
    const references = this.extractReferences(content)
    let processedContent = content

    // 替换引用为可点击的组件
    references.forEach(refId => {
      const patterns = [
        new RegExp(`\\[\\[${refId}\\]\\]`, 'g'),
        new RegExp(`@\\{${refId}\\}`, 'g')
      ]

      patterns.forEach(pattern => {
        processedContent = processedContent.replace(pattern, 
          `<span class="block-reference" data-ref-id="${refId}" onclick="handleReferenceClick('${refId}')">${refId}</span>`
        )
      })
    })

    return { processedContent, references }
  }
}

// ========== 块管理器 ==========
export class BlockManager {
  constructor() {
    this.blocks = new Map()
    this.documents = new Map()
    this.references = new Map() // blockId -> Set of referenced blockIds
    this.backlinks = new Map()  // blockId -> Set of blocks that reference this
    this.parser = new MarkdownParser()
    this.eventHandlers = new Map()
  }

  // 块操作
  createBlock(content, type = BlockTypes.PARAGRAPH, options = {}) {
    const block = new Block(type, content, options)
    this.blocks.set(block.id, block)
    
    // 处理引用
    const references = this.parser.extractReferences(content)
    references.forEach(refId => {
      this.addReference(block.id, refId)
    })

    this.emit('block:created', { blockId: block.id, block })
    return block
  }

  updateBlock(id, updates) {
    const existingBlock = this.blocks.get(id)
    if (!existingBlock) {
      throw new Error(`Block not found: ${id}`)
    }

    // 处理引用变化
    if (updates.content) {
      const oldRefs = this.parser.extractReferences(existingBlock.content)
      const newRefs = this.parser.extractReferences(updates.content)
      
      // 移除旧引用
      oldRefs.forEach(refId => {
        if (!newRefs.includes(refId)) {
          this.removeReference(id, refId)
        }
      })
      
      // 添加新引用
      newRefs.forEach(refId => {
        if (!oldRefs.includes(refId)) {
          this.addReference(id, refId)
        }
      })
    }

    const updatedBlock = existingBlock.clone()
    Object.assign(updatedBlock, updates)
    updatedBlock.metadata.updated_at = new Date()

    this.blocks.set(id, updatedBlock)
    this.emit('block:updated', { blockId: id, block: updatedBlock })
    
    return updatedBlock
  }

  getBlock(id) {
    return this.blocks.get(id)
  }

  deleteBlock(id) {
    const block = this.blocks.get(id)
    if (!block) {
      throw new Error(`Block not found: ${id}`)
    }

    this.blocks.delete(id)
    this.cleanupReferences(id)
    this.emit('block:deleted', { blockId: id, block })
  }

  searchBlocks(query, filters = {}) {
    const results = []
    const lowerQuery = query.toLowerCase()
    
    for (const block of this.blocks.values()) {
      let matches = false

      // 内容匹配
      if (block.content.toLowerCase().includes(lowerQuery)) {
        matches = true
      }

      // 标签匹配
      if (block.metadata.tags?.some(tag => tag.toLowerCase().includes(lowerQuery))) {
        matches = true
      }

      if (matches) {
        // 应用过滤器
        if (filters.blockTypes && !filters.blockTypes.includes(block.type)) {
          continue
        }
        
        if (filters.tags && !filters.tags.some(tag => block.metadata.tags?.includes(tag))) {
          continue
        }

        results.push(block)
      }
    }
    
    return results
  }

  // 引用管理
  addReference(fromBlockId, toBlockId) {
    if (!this.references.has(fromBlockId)) {
      this.references.set(fromBlockId, new Set())
    }
    this.references.get(fromBlockId).add(toBlockId)

    if (!this.backlinks.has(toBlockId)) {
      this.backlinks.set(toBlockId, new Set())
    }
    this.backlinks.get(toBlockId).add(fromBlockId)

    this.emit('reference:added', { fromBlockId, toBlockId })
  }

  removeReference(fromBlockId, toBlockId) {
    const refs = this.references.get(fromBlockId)
    if (refs) {
      refs.delete(toBlockId)
      if (refs.size === 0) {
        this.references.delete(fromBlockId)
      }
    }

    const backs = this.backlinks.get(toBlockId)
    if (backs) {
      backs.delete(fromBlockId)
      if (backs.size === 0) {
        this.backlinks.delete(toBlockId)
      }
    }

    this.emit('reference:removed', { fromBlockId, toBlockId })
  }

  getReferences(blockId) {
    const refs = this.references.get(blockId)
    return refs ? Array.from(refs) : []
  }

  getBacklinks(blockId) {
    const backs = this.backlinks.get(blockId)
    return backs ? Array.from(backs) : []
  }

  cleanupReferences(blockId) {
    // 清理所有与此块相关的引用
    const refs = this.references.get(blockId)
    if (refs) {
      refs.forEach(refId => {
        const backlinksSet = this.backlinks.get(refId)
        if (backlinksSet) {
          backlinksSet.delete(blockId)
        }
      })
      this.references.delete(blockId)
    }

    const backs = this.backlinks.get(blockId)
    if (backs) {
      backs.forEach(backId => {
        const refsSet = this.references.get(backId)
        if (refsSet) {
          refsSet.delete(blockId)
        }
      })
      this.backlinks.delete(blockId)
    }
  }

  // 文档操作
  parseMarkdownToBlocks(markdown, title, options = {}) {
    const blocks = this.parser.parseToBlocks(markdown, options)
    
    // 保存所有块
    blocks.forEach(block => {
      this.blocks.set(block.id, block)
    })

    return blocks
  }

  // 加载markdown内容并创建块
  loadFromMarkdown(markdown, options = {}) {
    // 清除现有块（如果需要）
    this.clear()
    
    if (!markdown || typeof markdown !== 'string') {
      return []
    }

    const blocks = this.parser.parseToBlocks(markdown, options)
    
    // 保存所有块
    blocks.forEach(block => {
      this.blocks.set(block.id, block)
    })

    return blocks
  }

  // 将当前所有块序列化为markdown
  toMarkdown() {
    const allBlocks = this.getAllBlocks()
      .sort((a, b) => a.metadata.position - b.metadata.position)
    
    return this.parser.serializeBlocks(allBlocks)
  }

  serializeBlocksToMarkdown(blockIds) {
    const blocks = blockIds.map(id => this.getBlock(id)).filter(Boolean)
    return this.parser.serializeBlocks(blocks)
  }

  // 获取文档的所有块
  getDocumentBlocks(documentId) {
    return Array.from(this.blocks.values())
      .filter(block => block.metadata.parent_document === documentId)
      .sort((a, b) => a.metadata.position - b.metadata.position)
  }

  // 移动块位置
  moveBlock(blockId, newPosition, targetDocumentId) {
    const allBlocks = this.getAllBlocks()
    const currentIndex = allBlocks.findIndex(b => b.id === blockId)
    
    if (currentIndex === -1) {
      throw new Error(`Block not found: ${blockId}`)
    }

    // 确保新位置在有效范围内
    const maxPosition = allBlocks.length - 1
    newPosition = Math.max(0, Math.min(newPosition, maxPosition))

    if (currentIndex === newPosition) {
      return // 位置未改变
    }

    // 重新排列块
    const block = allBlocks[currentIndex]
    allBlocks.splice(currentIndex, 1) // 移除块
    allBlocks.splice(newPosition, 0, block) // 插入到新位置

    // 更新所有块的position
    allBlocks.forEach((b, index) => {
      this.updateBlock(b.id, {
        metadata: {
          ...b.metadata,
          position: index
        }
      })
    })

    this.emit('block:moved', { blockId, oldPosition: currentIndex, newPosition })
  }

  // 事件系统
  on(event, handler) {
    if (!this.eventHandlers.has(event)) {
      this.eventHandlers.set(event, [])
    }
    this.eventHandlers.get(event).push(handler)
  }

  off(event, handler) {
    const handlers = this.eventHandlers.get(event)
    if (handlers) {
      const index = handlers.indexOf(handler)
      if (index > -1) {
        handlers.splice(index, 1)
      }
    }
  }

  emit(event, data) {
    const handlers = this.eventHandlers.get(event)
    if (handlers) {
      handlers.forEach(handler => {
        try {
          handler(event, { ...data, timestamp: new Date() })
        } catch (error) {
          console.error(`Error in event handler for ${event}:`, error)
        }
      })
    }
  }

  // 工具方法
  getAllBlocks() {
    return Array.from(this.blocks.values())
  }

  clear() {
    this.blocks.clear()
    this.documents.clear()
    this.references.clear()
    this.backlinks.clear()
  }

  // 获取统计信息
  getStats() {
    return {
      totalBlocks: this.blocks.size,
      totalReferences: this.references.size,
      blockTypes: this.getAllBlocks().reduce((acc, block) => {
        acc[block.type] = (acc[block.type] || 0) + 1
        return acc
      }, {})
    }
  }
}

// ========== 全局实例 ==========
export const blockManager = new BlockManager()

// ========== 便捷导出 ==========
export const createBlock = (content, type, options) => blockManager.createBlock(content, type, options)
export const updateBlock = (id, updates) => blockManager.updateBlock(id, updates)
export const getBlock = (id) => blockManager.getBlock(id)
export const deleteBlock = (id) => blockManager.deleteBlock(id)
export const searchBlocks = (query, filters) => blockManager.searchBlocks(query, filters)
export const parseMarkdown = (markdown, title, options) => blockManager.parseMarkdownToBlocks(markdown, title, options)
export const serializeBlocks = (blockIds) => blockManager.serializeBlocksToMarkdown(blockIds)

// 工具函数
export const generateShortId = (fullId) => {
  return fullId ? fullId.substring(0, 8) : ''
}

export const formatBlockType = (type) => {
  const typeMap = {
    paragraph: '段落',
    heading: '标题',
    code: '代码',
    list: '列表',
    image: '图片',
    table: '表格',
    quote: '引用',
    divider: '分隔线'
  }
  return typeMap[type] || type
} 