/**
 * Block Enhancer - 块增强工具
 * 提供智能块合并、拆分、关系管理等功能
 */

import { calculateSimilarity, generateUUID } from './semanticBlockParser';

// ==================== 块类型定义 ====================

export const BlockType = {
  PARAGRAPH: 'paragraph',
  HEADING: 'heading',
  CODE: 'code',
  LIST: 'list',
  QUOTE: 'quote',
  TABLE: 'table',
  IMAGE: 'image',
  DIVIDER: 'divider',
  CALL: 'callout',          // 新增：标注块
  WARNING: 'warning',       // 新增：警告块
  INFO: 'info',             // 新增：信息块
  EMBEDDED: 'embedded',     // 新增：嵌入内容
  REFERENCE: 'reference'    // 新增：引用块
};

// ==================== 块合并器 ====================

/**
 * BlockMerger - 智能块合并器
 * 基于语义相似度和类型兼容性合并相邻块
 */
export class BlockMerger {
  constructor(options = {}) {
    this.options = {
      similarityThreshold: options.similarityThreshold || 0.2,
      maxMergeSize: options.maxMergeSize || 2000,
      allowDifferentTypes: options.allowDifferentTypes !== false,
      preserveHeadings: options.preserveHeadings !== false,
      preserveCode: options.preserveCode !== false,
      preserveLists: options.preserveLists !== false
    };
  }

  /**
   * 查找可合并的相邻块对
   */
  findMergeablePairs(blocks) {
    const pairs = [];

    for (let i = 0; i < blocks.length - 1; i++) {
      const current = blocks[i];
      const next = blocks[i + 1];

      if (this.canMerge(current, next)) {
        const similarity = calculateSimilarity(current.content, next.content);
        pairs.push({
          index: i,
          block1: current,
          block2: next,
          similarity: similarity,
          confidence: this.calculateMergeConfidence(current, next, similarity)
        });
      }
    }

    // 按置信度排序
    return pairs.sort((a, b) => b.confidence - a.confidence);
  }

  /**
   * 判断两个块是否可以合并
   */
  canMerge(block1, block2) {
    // 检查类型兼容性
    if (!this.areTypesCompatible(block1.metadata?.type, block2.metadata?.type)) {
      return false;
    }

    // 检查大小限制
    const mergedSize = (block1.content?.length || 0) + (block2.content?.length || 0);
    if (mergedSize > this.options.maxMergeSize) {
      return false;
    }

    return true;
  }

  /**
   * 检查类型兼容性
   */
  areTypesCompatible(type1, type2) {
    // 相同类型总是兼容
    if (type1 === type2) return true;

    // 特殊类型不与其他类型合并
    const exclusiveTypes = [BlockType.CODE, BlockType.HEADING, BlockType.DIVIDER, BlockType.IMAGE, BlockType.TABLE];
    if (exclusiveTypes.includes(type1) || exclusiveTypes.includes(type2)) {
      return false;
    }

    // 段落、引用、列表可以互相合并
    const mergeableTypes = [BlockType.PARAGRAPH, BlockType.QUOTE, BlockType.LIST];
    return mergeableTypes.includes(type1) && mergeableTypes.includes(type2);
  }

  /**
   * 计算合并置信度
   */
  calculateMergeConfidence(block1, block2, similarity) {
    let confidence = similarity;

    // 类型相同，增加置信度
    if (block1.metadata?.type === block2.metadata?.type) {
      confidence += 0.1;
    }

    // 都是短块，增加置信度
    if ((block1.content?.length || 0) < 200 && (block2.content?.length || 0) < 200) {
      confidence += 0.15;
    }

    // 标题后的第一个块，降低置信度（保留章节独立性）
    if (block1.metadata?.type === BlockType.HEADING) {
      confidence -= 0.3;
    }

    return Math.min(1, Math.max(0, confidence));
  }

  /**
   * 合并两个块
   */
  mergeBlocks(block1, block2, options = {}) {
    const { preserveType = true, separator = '\n\n' } = options;

    // 确定新块的类型
    let newType;
    if (preserveType) {
      newType = block1.metadata?.type || BlockType.PARAGRAPH;
    } else {
      // 选择更具体的类型
      const typePriority = [
        BlockType.HEADING,
        BlockType.CODE,
        BlockType.LIST,
        BlockType.QUOTE,
        BlockType.TABLE,
        BlockType.PARAGRAPH
      ];
      newType = this.selectHigherPriorityType(
        block1.metadata?.type,
        block2.metadata?.type,
        typePriority
      );
    }

    // 合并内容
    const newContent = [block1.content, block2.content]
      .filter(Boolean)
      .join(separator);

    // 创建合并后的块
    return {
      id: generateUUID(),
      content: newContent,
      metadata: {
        ...block1.metadata,
        type: newType,
        merged: true,
        mergedFrom: [block1.id, block2.id],
        mergedAt: new Date(),
        characterCount: newContent.length,
        originalBlocks: [block1, block2]
      }
    };
  }

  /**
   * 选择更高优先级的类型
   */
  selectHigherPriorityType(type1, type2, priority) {
    const index1 = type1 ? priority.indexOf(type1) : priority.length;
    const index2 = type2 ? priority.indexOf(type2) : priority.length;
    return index1 < index2 ? type1 : type2;
  }

  /**
   * 批量智能合并
   * 只合并高置信度的块对
   */
  smartMerge(blocks, minConfidence = 0.5) {
    const mergedBlocks = [...blocks];
    const mergeLog = [];

    // 找到所有可合并的对
    const pairs = this.findMergeablePairs(mergedBlocks);

    // 只合并高置信度的对
    const highConfidencePairs = pairs.filter(p => p.confidence >= minConfidence);

    // 从后往前合并（避免索引问题）
    for (const pair of highConfidencePairs.reverse()) {
      const merged = this.mergeBlocks(pair.block1, pair.block2);

      // 替换原来的两个块
      mergedBlocks.splice(pair.index, 2, merged);

      mergeLog.push({
        action: 'merge',
        blocks: [pair.block1.id, pair.block2.id],
        result: merged.id,
        confidence: pair.confidence,
        similarity: pair.similarity
      });
    }

    // 更新位置
    mergedBlocks.forEach((block, index) => {
      block.metadata.position = index;
    });

    return {
      blocks: mergedBlocks,
      log: mergeLog,
      originalCount: blocks.length,
      mergedCount: mergedBlocks.length,
      reduction: blocks.length - mergedBlocks.length
    };
  }
}

// ==================== 块拆分器 ====================

/**
 * BlockSplitter - 智能块拆分器
 * 将过大的块拆分为更小的语义单元
 */
export class BlockSplitter {
  constructor(options = {}) {
    this.options = {
      targetSize: options.targetSize || 500,
      minSize: options.minSize || 200,
      maxSize: options.maxSize || 1000,
      preserveSentences: options.preserveSentences !== false,
      preserveCode: options.preserveCode !== false,
      preserveLists: options.preserveLists !== false
    };
  }

  /**
   * 检测需要拆分的块
   */
  findSplittableBlocks(blocks) {
    return blocks
      .filter(block => {
        const size = block.content?.length || 0;
        return size > this.options.maxSize;
      })
      .map(block => ({
        block: block,
        currentSize: block.content?.length || 0,
        suggestedSplits: this.suggestSplitCount(block.content?.length || 0),
        type: block.metadata?.type
      }));
  }

  /**
   * 建议拆分数量
   */
  suggestSplitCount(size) {
    const targetSize = this.options.targetSize;
    const count = Math.ceil(size / targetSize);
    return Math.max(2, count);
  }

  /**
   * 拆分块
   */
  splitBlock(block, options = {}) {
    const { type = block.metadata?.type, content = block.content } = options;

    // 根据类型选择拆分策略
    switch (type) {
      case BlockType.CODE:
        return this.splitCodeBlock(block);
      case BlockType.LIST:
        return this.splitListBlock(block);
      case BlockType.HEADING:
        // 标题不拆分
        return [block];
      default:
        return this.splitTextBlock(block);
    }
  }

  /**
   * 拆分文本块
   */
  splitTextBlock(block) {
    const content = block.content;
    const size = content.length;

    // 如果不需要拆分
    if (size <= this.options.maxSize) {
      return [block];
    }

    // 按段落拆分
    const paragraphs = content.split(/\n\n+/);
    const splitBlocks = [];
    let currentContent = '';
    let position = block.metadata.position || 0;

    for (const para of paragraphs) {
      const testSize = currentContent.length + para.length;

      if (currentContent && testSize > this.options.maxSize) {
        // 当前内容已足够大，创建新块
        splitBlocks.push(this.createSplitBlock(currentContent, block, position++));
        currentContent = para;
      } else {
        // 继续累积
        currentContent = currentContent ? (currentContent + '\n\n' + para) : para;
      }
    }

    // 添加最后一个块
    if (currentContent) {
      splitBlocks.push(this.createSplitBlock(currentContent, block, position));
    }

    return splitBlocks;
  }

  /**
   * 拆分代码块
   */
  splitCodeBlock(block) {
    const content = block.content;
    const lines = content.split('\n');
    const size = content.length;

    if (size <= this.options.maxSize) {
      return [block];
    }

    const splitBlocks = [];
    const targetLines = Math.ceil(lines.length / Math.ceil(size / this.options.targetSize));
    let position = block.metadata.position || 0;

    for (let i = 0; i < lines.length; i += targetLines) {
      const chunk = lines.slice(i, i + targetLines).join('\n');
      splitBlocks.push(this.createSplitBlock(chunk, block, position++, {
        language: block.metadata.language,
        codeFragment: true
      }));
    }

    return splitBlocks;
  }

  /**
   * 拆分列表块
   */
  splitListBlock(block) {
    const content = block.content;
    const lines = content.split('\n');
    const size = content.length;

    if (size <= this.options.maxSize) {
      return [block];
    }

    const splitBlocks = [];
    let currentList = [];
    let position = block.metadata.position || 0;

    for (const line of lines) {
      currentList.push(line);

      // 检查是否应该开始新列表
      if (currentList.join('\n').length > this.options.targetSize) {
        splitBlocks.push(this.createSplitBlock(currentList.join('\n'), block, position++));
        currentList = [];
      }
    }

    // 添加最后一个列表
    if (currentList.length > 0) {
      splitBlocks.push(this.createSplitBlock(currentList.join('\n'), block, position));
    }

    return splitBlocks;
  }

  /**
   * 创建拆分后的块
   */
  createSplitBlock(content, originalBlock, position, extraMetadata = {}) {
    return {
      id: generateUUID(),
      content: content,
      metadata: {
        ...originalBlock.metadata,
        ...extraMetadata,
        position: position,
        split: true,
        splitFrom: originalBlock.id,
        characterCount: content.length,
        splitAt: new Date()
      }
    };
  }

  /**
   * 批量拆分
   */
  batchSplit(blocks) {
    const splittable = this.findSplittableBlocks(blocks);
    const resultBlocks = [...blocks];
    const splitLog = [];

    for (const { block, currentSize, suggestedSplits } of splittable) {
      const originalIndex = resultBlocks.findIndex(b => b.id === block.id);

      if (originalIndex === -1) continue;

      // 执行拆分
      const splitBlocks = this.splitBlock(block);

      // 替换原块
      resultBlocks.splice(originalIndex, 1, ...splitBlocks);

      splitLog.push({
        action: 'split',
        block: block.id,
        into: splitBlocks.map(b => b.id),
        originalSize: currentSize,
        newSize: splitBlocks.reduce((sum, b) => sum + (b.content?.length || 0), 0)
      });
    }

    // 更新所有块的位置
    resultBlocks.forEach((block, index) => {
      block.metadata.position = index;
    });

    return {
      blocks: resultBlocks,
      log: splitLog,
      originalCount: blocks.length,
      splitCount: resultBlocks.length,
      increase: resultBlocks.length - blocks.length
    };
  }
}

// ==================== 块关系管理器 ====================

/**
 * BlockRelationshipManager - 块关系管理器
 * 管理块之间的引用、依赖和层次关系
 */
export class BlockRelationshipManager {
  constructor() {
    this.relationships = new Map(); // blockId -> Set of related block IDs
    this.backlinks = new Map();     // blockId -> Set of blocks that reference it
    this.hierarchy = new Map();     // blockId -> parent block ID
  }

  /**
   * 添加关系
   */
  addRelationship(fromBlockId, toBlockId, type = 'reference', metadata = {}) {
    // 添加正向关系
    if (!this.relationships.has(fromBlockId)) {
      this.relationships.set(fromBlockId, new Set());
    }
    this.relationships.get(fromBlockId).add(toBlockId);

    // 添加反向关系
    if (!this.backlinks.has(toBlockId)) {
      this.backlinks.set(toBlockId, new Set());
    }
    this.backlinks.get(toBlockId).add(fromBlockId);

    return {
      from: fromBlockId,
      to: toBlockId,
      type: type,
      metadata: metadata,
      createdAt: new Date()
    };
  }

  /**
   * 移除关系
   */
  removeRelationship(fromBlockId, toBlockId) {
    if (this.relationships.has(fromBlockId)) {
      this.relationships.get(fromBlockId).delete(toBlockId);
    }
    if (this.backlinks.has(toBlockId)) {
      this.backlinks.get(toBlockId).delete(fromBlockId);
    }
  }

  /**
   * 获取块的所有关系
   */
  getRelationships(blockId) {
    const refs = this.relationships.get(blockId);
    if (!refs) return [];

    return Array.from(refs).map(toBlockId => ({
      from: blockId,
      to: toBlockId,
      type: 'reference'
    }));
  }

  /**
   * 获取指向此块的所有引用
   */
  getBacklinks(blockId) {
    const backs = this.backlinks.get(blockId);
    return backs ? Array.from(backs) : [];
  }

  /**
   * 设置父子关系
   */
  setParent(childId, parentId) {
    this.hierarchy.set(childId, parentId);
  }

  /**
   * 获取父块
   */
  getParent(blockId) {
    return this.hierarchy.get(blockId);
  }

  /**
   * 获取子块
   */
  getChildren(blockId) {
    const children = [];
    for (const [child, parent] of this.hierarchy.entries()) {
      if (parent === blockId) {
        children.push(child);
      }
    }
    return children;
  }

  /**
   * 查找块的层次结构
   */
  getHierarchy(blockId) {
    const hierarchy = [];
    let current = blockId;

    while (current) {
      hierarchy.unshift(current);
      current = this.getParent(current);
    }

    return hierarchy;
  }

  /**
   * 分析文档中的引用
   * 从 Markdown 中提取块引用
   */
  analyzeReferences(blocks) {
    const referencePattern = /\[\[([^\]]+)\]\]|@\{([^}]+)\}/g;

    for (const block of blocks) {
      const content = block.content;
      const matches = [];

      let match;
      while ((match = referencePattern.exec(content)) !== null) {
        const refId = match[1] || match[2];
        if (refId) {
          matches.push({
            id: refId,
            position: match.index,
            fullMatch: match[0]
          });
        }
      }

      // 为每个找到的引用添加关系
      for (const ref of matches) {
        // 查找被引用的块
        const targetBlock = blocks.find(b => b.id === ref.id || b.content.includes(ref.id));
        if (targetBlock) {
          this.addRelationship(block.id, targetBlock.id, 'explicit_reference', {
            match: ref.fullMatch,
            position: ref.position
          });
        }
      }
    }

    return {
      totalReferences: this.relationships.size,
      referenceDetails: Array.from(this.relationships.entries()).map(([from, toSet]) => ({
        from,
        to: Array.from(toSet)
      }))
    };
  }

  /**
   * 查找相关块
   * 基于内容相似度查找
   */
  findRelatedBlocks(block, allBlocks, options = {}) {
    const {
      limit = 5,
      minSimilarity = 0.1,
      excludeSelf = true
    } = options;

    const related = [];

    for (const other of allBlocks) {
      if (excludeSelf && other.id === block.id) continue;

      const similarity = calculateSimilarity(block.content, other.content);

      if (similarity >= minSimilarity) {
        related.push({
          block: other,
          similarity: similarity,
          relationship: 'semantic'
        });
      }
    }

    // 按相似度排序并返回前N个
    return related
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, limit);
  }

  /**
   * 构建块的图结构
   */
  buildGraph(blocks) {
    const nodes = blocks.map(block => ({
      id: block.id,
      type: block.metadata?.type,
      size: block.content?.length || 0,
      metadata: block.metadata
    }));

    const edges = [];

    // 添加关系边
    for (const [from, toSet] of this.relationships.entries()) {
      for (const to of toSet) {
        edges.push({
          from: from,
          to: to,
          type: 'reference'
        });
      }
    }

    // 添加层次边
    for (const [child, parent] of this.hierarchy.entries()) {
      edges.push({
        from: child,
        to: parent,
        type: 'parent'
      });
    }

    // 添加语义相似度边（只保留高相似度）
    for (let i = 0; i < blocks.length; i++) {
      for (let j = i + 1; j < blocks.length; j++) {
        const similarity = calculateSimilarity(blocks[i].content, blocks[j].content);
        if (similarity > 0.3) {
          edges.push({
            from: blocks[i].id,
            to: blocks[j].id,
            type: 'semantic',
            weight: similarity
          });
        }
      }
    }

    return {
      nodes: nodes,
      edges: edges,
      stats: {
        nodeCount: nodes.length,
        edgeCount: edges.length,
        referenceEdges: edges.filter(e => e.type === 'reference').length,
        semanticEdges: edges.filter(e => e.type === 'semantic').length,
        parentEdges: edges.filter(e => e.type === 'parent').length
      }
    };
  }
}

// ==================== 块质量分析器 ====================

/**
 * BlockQualityAnalyzer - 块质量分析器
 * 分析块的质量并提供改进建议
 */
export class BlockQualityAnalyzer {
  /**
   * 分析单个块的质量
   */
  analyzeBlock(block) {
    const issues = [];
    const suggestions = [];
    const content = block.content || '';
    const size = content.length;

    // 检查大小
    if (size === 0) {
      issues.push({ type: 'empty', severity: 'error', message: '块内容为空' });
    } else if (size < 50) {
      issues.push({ type: 'too_small', severity: 'warning', message: '块内容过短' });
      suggestions.push({ type: 'merge', message: '考虑与相邻块合并' });
    } else if (size > 2000) {
      issues.push({ type: 'too_large', severity: 'warning', message: '块内容过长' });
      suggestions.push({ type: 'split', message: '考虑拆分为多个块' });
    }

    // 检查类型
    const type = block.metadata?.type;
    if (!type) {
      issues.push({ type: 'no_type', severity: 'info', message: '块未指定类型' });
      suggestions.push({ type: 'detect_type', message: '自动检测块类型' });
    }

    // 检查代码块是否有语言标记
    if (type === BlockType.CODE && !block.metadata?.language) {
      issues.push({ type: 'no_language', severity: 'info', message: '代码块未指定语言' });
    }

    // 检查是否有时间戳
    if (!/\[\d{2}:\d{2}:\d{2}\]/.test(content) && /\d{1,2}:\d{2}/.test(content)) {
      issues.push({ type: 'timestamp_format', severity: 'info', message: '时间戳格式不标准' });
    }

    return {
      blockId: block.id,
      quality: this.calculateQualityScore(issues, size),
      issues: issues,
      suggestions: suggestions,
      metrics: {
        size: size,
        type: type,
        hasTimestamp: /\[\d{2}:\d{2}:\d{2}\]/.test(content),
        sentenceCount: this.countSentences(content),
        wordCount: this.countWords(content)
      }
    };
  }

  /**
   * 计算质量分数
   */
  calculateQualityScore(issues, size) {
    let score = 100;

    for (const issue of issues) {
      switch (issue.severity) {
        case 'error':
          score -= 30;
          break;
        case 'warning':
          score -= 15;
          break;
        case 'info':
          score -= 5;
          break;
      }
    }

    // 大小适中的块加分
    if (size >= 100 && size <= 800) {
      score += 10;
    }

    return Math.max(0, Math.min(100, score));
  }

  /**
   * 统计句子数
   */
  countSentences(text) {
    const matches = text.match(/[。！？.!?]+/g);
    return matches ? matches.length : 0;
  }

  /**
   * 统计词数
   */
  countWords(text) {
    // 中文按字，英文按词
    const chineseChars = (text.match(/[\u4e00-\u9fa5]/g) || []).length;
    const englishWords = (text.match(/[a-zA-Z]+/g) || []).length;
    return chineseChars + englishWords;
  }

  /**
   * 批量分析
   */
  batchAnalyze(blocks) {
    const results = [];
    let totalQuality = 0;

    for (const block of blocks) {
      const analysis = this.analyzeBlock(block);
      results.push(analysis);
      totalQuality += analysis.quality;
    }

    return {
      blocks: results,
      averageQuality: totalQuality / blocks.length,
      distribution: {
        excellent: results.filter(r => r.quality >= 80).length,
        good: results.filter(r => r.quality >= 60 && r.quality < 80).length,
        fair: results.filter(r => r.quality >= 40 && r.quality < 60).length,
        poor: results.filter(r => r.quality < 40).length
      }
    };
  }
}

// ==================== 导出 ====================

// 所有类已在定义时导出（使用 export class）
// 这里只导出默认对象用于兼容性
export default {
  BlockType,
  BlockMerger,
  BlockSplitter,
  BlockRelationshipManager,
  BlockQualityAnalyzer
};
