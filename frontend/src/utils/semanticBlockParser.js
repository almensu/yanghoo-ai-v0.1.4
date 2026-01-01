/**
 * Semantic Block Parser - 智能语义分块解析器
 * 基于NLP和语义分析的智能文档分块系统
 *
 * 核心功能：
 * 1. 句子级别的分词和分割
 * 2. 语义相似度计算
 * 3. 智能边界检测
 * 4. 上下文感知的块合并
 */

// ==================== 工具函数 ====================

/**
 * 生成UUID
 */
const generateUUID = () => {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : ((r & 0x3) | 0x8);
    return v.toString(16);
  });
};

/**
 * 计算两个字符串之间的余弦相似度
 * 基于词频向量的简单实现
 */
const calculateSimilarity = (text1, text2) => {
  // 预处理：分词并统计词频
  const getWordFrequency = (text) => {
    const words = text
      .toLowerCase()
      .replace(/[^\u4e00-\u9fa5a-z0-9\s]/g, '') // 保留中文、英文、数字
      .split(/\s+/)
      .filter(w => w.length > 0);

    const freq = {};
    words.forEach(word => {
      // 对于中文，按字符切分；对于英文，按单词
      if (/[\u4e00-\u9fa5]/.test(word)) {
        // 中文文本，按字符处理
        for (const char of word) {
          freq[char] = (freq[char] || 0) + 1;
        }
      } else {
        freq[word] = (freq[word] || 0) + 1;
      }
    });
    return freq;
  };

  const freq1 = getWordFrequency(text1);
  const freq2 = getWordFrequency(text2);

  // 获取所有唯一词
  const allWords = new Set([...Object.keys(freq1), ...Object.keys(freq2)]);

  // 计算点积和模
  let dotProduct = 0;
  let norm1 = 0;
  let norm2 = 0;

  allWords.forEach(word => {
    const f1 = freq1[word] || 0;
    const f2 = freq2[word] || 0;
    dotProduct += f1 * f2;
    norm1 += f1 * f1;
    norm2 += f2 * f2;
  });

  // 避免除零
  if (norm1 === 0 || norm2 === 0) return 0;

  return dotProduct / (Math.sqrt(norm1) * Math.sqrt(norm2));
};

/**
 * 判断两个句子是否属于同一个语义单元
 */
const isSemanticallyRelated = (sentence1, sentence2, threshold = 0.15) => {
  const similarity = calculateSimilarity(sentence1, sentence2);
  return similarity >= threshold;
};

// ==================== 句子分词器 ====================

/**
 * SentenceTokenizer - 句子分割器
 * 支持中文和英文的智能句子边界检测
 */
class SentenceTokenizer {
  constructor() {
    // 中文句子结束符
    this.chineseEndings = ['。', '！', '？', '；', '…'];
    // 英文句子结束符
    this.englishEndings = ['.', '!', '?', ';'];
    // 引号模式
    this.quotePatterns = [
      /"[^"]*"/g,
      /'[^']*'/g,
      /「[^」]*」/g,
      /『[^』]*』/g,
      /"[^"]*"/g,
      /'[^']*'/g,
    ];
  }

  /**
   * 将文本分割成句子列表
   */
  tokenize(text) {
    if (!text || typeof text !== 'string') {
      return [];
    }

    const sentences = [];
    let currentSentence = '';
    let inQuote = false;
    let quoteChar = null;

    // 按字符遍历
    for (let i = 0; i < text.length; i++) {
      const char = text[i];
      const nextChar = text[i + 1];

      // 检测引号开始
      if ((char === '"' || char === '"' || char === '\'') && !inQuote) {
        inQuote = true;
        quoteChar = char;
        currentSentence += char;
        continue;
      }

      // 检测引号结束
      if (inQuote && char === quoteChar) {
        inQuote = false;
        quoteChar = null;
        currentSentence += char;
        continue;
      }

      currentSentence += char;

      // 如果在引号内，继续
      if (inQuote) continue;

      // 检测句子结束
      const isEndOfSentence = this.isSentenceEnd(char, nextChar);

      if (isEndOfSentence) {
        const trimmed = currentSentence.trim();
        if (trimmed.length > 0) {
          sentences.push(trimmed);
        }
        currentSentence = '';
      }
    }

    // 处理最后一个句子
    const lastTrimmed = currentSentence.trim();
    if (lastTrimmed.length > 0) {
      sentences.push(lastTrimmed);
    }

    return sentences;
  }

  /**
   * 判断是否是句子结束位置
   */
  isSentenceEnd(char, nextChar) {
    // 检查中文结束符
    if (this.chineseEndings.includes(char)) {
      return true;
    }

    // 检查英文结束符（后面跟空格或引号）
    if (this.englishEndings.includes(char)) {
      if (!nextChar || nextChar === ' ' || nextChar === '\n' || nextChar === '\r') {
        return true;
      }
    }

    return false;
  }

  /**
   * 将句子列表重新组合成段落
   * 基于语义相似度进行分组
   */
  groupIntoParagraphs(sentences, options = {}) {
    const {
      minSentences = 2,           // 段落最少句子数
      maxSentences = 8,           // 段落最多句子数
      similarityThreshold = 0.15, // 相似度阈值
      maxParagraphLength = 500    // 段落最大字符数
    } = options;

    if (sentences.length === 0) {
      return [];
    }

    const paragraphs = [];
    let currentParagraph = [sentences[0]];
    let currentLength = sentences[0].length;

    for (let i = 1; i < sentences.length; i++) {
      const sentence = sentences[i];
      const lastSentence = currentParagraph[currentParagraph.length - 1];

      // 计算与上一句的相似度
      const similarity = calculateSimilarity(lastSentence, sentence);

      // 判断是否应该开始新段落
      const shouldStartNew =
        currentParagraph.length >= maxSentences ||
        currentLength + sentence.length > maxParagraphLength ||
        (currentParagraph.length >= minSentences && similarity < similarityThreshold);

      if (shouldStartNew) {
        // 开始新段落
        paragraphs.push(currentParagraph.join(' '));
        currentParagraph = [sentence];
        currentLength = sentence.length;
      } else {
        // 继续当前段落
        currentParagraph.push(sentence);
        currentLength += sentence.length;
      }
    }

    // 添加最后一个段落
    if (currentParagraph.length > 0) {
      paragraphs.push(currentParagraph.join(' '));
    }

    return paragraphs;
  }
}

// ==================== 语义分析器 ====================

/**
 * SemanticAnalyzer - 语义分析器
 * 分析文本的语义结构和主题连贯性
 */
class SemanticAnalyzer {
  constructor(options = {}) {
    this.options = {
      similarityThreshold: options.similarityThreshold || 0.15,
      minChunkSize: options.minChunkSize || 100,
      maxChunkSize: options.maxChunkSize || 1000,
      contextOverlap: options.contextOverlap || 0.1, // 10% 重叠
    };
  }

  /**
   * 分析文档的语义结构
   * 返回语义边界和主题段落
   */
  analyzeDocument(text) {
    const tokenizer = new SentenceTokenizer();
    const sentences = tokenizer.tokenize(text);

    // 计算相邻句子之间的相似度
    const similarities = [];
    for (let i = 0; i < sentences.length - 1; i++) {
      const similarity = calculateSimilarity(sentences[i], sentences[i + 1]);
      similarities.push({
        index: i,
        similarity: similarity,
        sentence1: sentences[i],
        sentence2: sentences[i + 1]
      });
    }

    // 找到语义边界（相似度显著下降的位置）
    const boundaries = this.findSemanticBoundaries(similarities);

    // 根据边界创建主题段落
    const chunks = this.createSemanticChunks(sentences, boundaries);

    return {
      sentences,
      similarities,
      boundaries,
      chunks,
      stats: {
        totalSentences: sentences.length,
        totalBoundaries: boundaries.length,
        totalChunks: chunks.length,
        avgSimilarity: similarities.reduce((sum, s) => sum + s.similarity, 0) / similarities.length
      }
    };
  }

  /**
   * 找到语义边界
   * 相似度显著下降的位置
   */
  findSemanticBoundaries(similarities) {
    const boundaries = [];

    for (let i = 0; i < similarities.length; i++) {
      const current = similarities[i];
      const prev = similarities[i - 1];
      const next = similarities[i + 1];

      // 检测相似度显著下降
      let isBoundary = false;

      if (prev && next) {
        // 局部最小值检测
        const avgNeighbors = (prev.similarity + next.similarity) / 2;
        if (current.similarity < this.options.similarityThreshold &&
            current.similarity < avgNeighbors * 0.7) {
          isBoundary = true;
        }
      } else if (current.similarity < this.options.similarityThreshold) {
        // 低相似度阈值
        isBoundary = true;
      }

      if (isBoundary) {
        boundaries.push({
          index: current.index,
          similarity: current.similarity,
          reason: 'semantic_shift'
        });
      }
    }

    return boundaries;
  }

  /**
   * 根据语义边界创建内容块
   */
  createSemanticChunks(sentences, boundaries) {
    const chunks = [];
    let start = 0;

    for (const boundary of boundaries) {
      const end = boundary.index + 1; // 边界后的句子开始新块
      const chunkSentences = sentences.slice(start, end);

      if (chunkSentences.length > 0) {
        const chunk = {
          id: generateUUID(),
          content: chunkSentences.join(' '),
          sentences: chunkSentences,
          startIndex: start,
          endIndex: end,
          metadata: {
            sentenceCount: chunkSentences.length,
            characterCount: chunkSentences.join(' ').length,
            type: this.detectChunkType(chunkSentences.join(' '))
          }
        };
        chunks.push(chunk);
      }

      start = end;
    }

    // 添加最后一个块
    if (start < sentences.length) {
      const lastSentences = sentences.slice(start);
      chunks.push({
        id: generateUUID(),
        content: lastSentences.join(' '),
        sentences: lastSentences,
        startIndex: start,
        endIndex: sentences.length,
        metadata: {
          sentenceCount: lastSentences.length,
          characterCount: lastSentences.join(' ').length,
          type: this.detectChunkType(lastSentences.join(' '))
        }
      });
    }

    return chunks;
  }

  /**
   * 检测块的类型
   */
  detectChunkType(content) {
    const trimmed = content.trim();

    // 代码块
    if (trimmed.startsWith('```') || /^\s{4}/.test(trimmed)) {
      return 'code';
    }

    // 引用块
    if (trimmed.startsWith('>')) {
      return 'quote';
    }

    // 列表
    if (/^[*\-+]\s/.test(trimmed) || /^\d+\.\s/.test(trimmed)) {
      return 'list';
    }

    // 标题
    if (/^#{1,6}\s/.test(trimmed)) {
      return 'heading';
    }

    // 表格
    if (trimmed.includes('|') && trimmed.split('\n').every(line => line.includes('|'))) {
      return 'table';
    }

    // 图片
    if (/^!\[.*\]\(.*\)/.test(trimmed)) {
      return 'image';
    }

    // 默认为段落
    return 'paragraph';
  }

  /**
   * 计算两个块之间的语义相似度
   */
  compareChunks(chunk1, chunk2) {
    return calculateSimilarity(chunk1.content, chunk2.content);
  }
}

// ==================== 智能分块器 ====================

/**
 * IntelligentChunker - 智能分块器
 * 结合结构和语义信息的混合分块策略
 */
class IntelligentChunker {
  constructor(options = {}) {
    this.semanticAnalyzer = new SemanticAnalyzer(options);
    this.tokenizer = new SentenceTokenizer();
    this.options = {
      ...options,
      preserveStructure: options.preserveStructure !== false,
      useSemanticAnalysis: options.useSemanticAnalysis !== false,
      minBlockSize: options.minBlockSize || 100,
      maxBlockSize: options.maxBlockSize || 1500,
      overlapRatio: options.overlapRatio || 0.1
    };
  }

  /**
   * 智能分块主方法
   * 结合结构分析和语义分析
   */
  chunk(markdown, options = {}) {
    const config = { ...this.options, ...options };

    // 首先进行结构化分块（保留 Markdown 结构）
    const structuralBlocks = this.structuralChunking(markdown);

    // 如果启用语义分析，对每个结构块进一步细分
    if (config.useSemanticAnalysis) {
      return this.semanticRefinement(structuralBlocks, config);
    }

    return structuralBlocks;
  }

  /**
   * 结构化分块
   * 保留 Markdown 原有结构
   */
  structuralChunking(markdown) {
    const lines = markdown.split('\n');
    const blocks = [];
    let currentBlock = [];
    let position = 0;
    let codeBlockDepth = 0; // 代码块嵌套深度

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const trimmed = line.trim();

      // 检测代码块开始/结束
      if (trimmed.startsWith('```')) {
        if (codeBlockDepth === 0) {
          // 开始新代码块
          if (currentBlock.length > 0) {
            blocks.push(this.createBlockFromLines(currentBlock, position++));
            currentBlock = [];
          }
          currentBlock.push(line);
          codeBlockDepth++;
          continue;
        } else {
          // 结束代码块
          currentBlock.push(line);
          blocks.push(this.createBlockFromLines(currentBlock, position++));
          currentBlock = [];
          codeBlockDepth--;
          continue;
        }
      }

      // 在代码块内，所有行都添加到当前块
      if (codeBlockDepth > 0) {
        currentBlock.push(line);
        continue;
      }

      // 检测空行（块分隔符）
      if (trimmed === '') {
        if (currentBlock.length > 0) {
          blocks.push(this.createBlockFromLines(currentBlock, position++));
          currentBlock = [];
        }
        continue;
      }

      // 检测一级标题（主要章节分隔）
      if (trimmed.startsWith('# ') && currentBlock.length > 0) {
        blocks.push(this.createBlockFromLines(currentBlock, position++));
        currentBlock = [line];
        continue;
      }

      // 添加到当前块
      currentBlock.push(line);
    }

    // 处理最后一个块
    if (currentBlock.length > 0) {
      blocks.push(this.createBlockFromLines(currentBlock, position++));
    }

    return blocks;
  }

  /**
   * 从行列表创建块对象
   */
  createBlockFromLines(lines, position) {
    const content = lines.join('\n').trim();
    const firstLine = lines[0] || '';

    return {
      id: generateUUID(),
      content: content,
      rawLines: lines,
      metadata: {
        position: position,
        created_at: new Date(),
        type: this.detectBlockType(firstLine, content),
        lineCount: lines.length,
        characterCount: content.length,
        language: this.detectLanguage(content)
      }
    };
  }

  /**
   * 语义细化
   * 对过大的结构块进行语义细分
   */
  semanticRefinement(structuralBlocks, config) {
    const refinedBlocks = [];

    for (const block of structuralBlocks) {
      // 如果块大小合理，直接保留
      if (block.metadata.characterCount <= config.maxBlockSize) {
        refinedBlocks.push(block);
        continue;
      }

      // 块过大，进行语义分析细分
      const analysis = this.semanticAnalyzer.analyzeDocument(block.content);

      // 将语义块转换为块对象
      for (const semanticChunk of analysis.chunks) {
        refinedBlocks.push({
          id: generateUUID(),
          content: semanticChunk.content,
          metadata: {
            position: refinedBlocks.length,
            created_at: new Date(),
            type: semanticChunk.metadata.type,
            characterCount: semanticChunk.metadata.characterCount,
            sentenceCount: semanticChunk.metadata.sentenceCount,
            parentId: block.id,
            semanticSplit: true
          }
        });
      }
    }

    return refinedBlocks;
  }

  /**
   * 检测块类型
   */
  detectBlockType(firstLine, fullContent) {
    const trimmed = firstLine.trim();

    if (trimmed.startsWith('```')) return 'code';
    if (trimmed.match(/^#{1,6}\s+/)) return 'heading';
    if (trimmed.match(/^[*\-+]\s+/) || trimmed.match(/^\d+\.\s+/)) return 'list';
    if (trimmed.startsWith('>')) return 'quote';
    if (trimmed.match(/^[*\-_]{3,}$/)) return 'divider';
    if (trimmed.match(/^!\[.*\]\(.*\)$/)) return 'image';
    if (trimmed.includes('|') && fullContent.includes('|')) return 'table';

    return 'paragraph';
  }

  /**
   * 检测代码语言
   */
  detectLanguage(content) {
    const match = content.match(/^```(\w+)/);
    return match ? match[1] : null;
  }
}

// ==================== 上下文保留器 ====================

/**
 * ContextPreserver - 上下文保留器
 * 为分块添加上下文重叠和元数据
 */
class ContextPreserver {
  constructor(options = {}) {
    this.options = {
      overlapRatio: options.overlapRatio || 0.1,  // 10% 重叠
      minOverlapSentences: options.minOverlapSentences || 1,
      addMetadata: options.addMetadata !== false,
      addRelationships: options.addRelationships !== false
    };
  }

  /**
   * 为块添加上下文重叠
   */
  addOverlap(blocks) {
    if (blocks.length <= 1) return blocks;

    const overlappedBlocks = [];

    for (let i = 0; i < blocks.length; i++) {
      const block = blocks[i];
      const blockContent = this.getBlockSentences(block);
      const overlapSentences = [];

      // 添加前一个块的重叠
      if (i > 0) {
        const prevBlock = blocks[i - 1];
        const prevSentences = this.getBlockSentences(prevBlock);
        const overlapCount = Math.max(
          this.options.minOverlapSentences,
          Math.floor(prevSentences.length * this.options.overlapRatio)
        );
        const prevOverlap = prevSentences.slice(-overlapCount);
        overlapSentences.push(...prevOverlap);
      }

      // 添加当前块的完整内容
      overlapSentences.push(...blockContent);

      // 添加后一个块的重叠（预览）
      if (i < blocks.length - 1) {
        const nextBlock = blocks[i + 1];
        const nextSentences = this.getBlockSentences(nextBlock);
        const overlapCount = Math.max(
          this.options.minOverlapSentences,
          Math.floor(nextSentences.length * this.options.overlapRatio)
        );
        const nextOverlap = nextSentences.slice(0, overlapCount);
        overlapSentences.push(...nextOverlap);
      }

      overlappedBlocks.push({
        ...block,
        content: overlapSentences.join(' '),
        metadata: {
          ...block.metadata,
          hasOverlap: true,
          originalContent: block.content
        }
      });
    }

    return overlappedBlocks;
  }

  /**
   * 获取块的句子列表
   */
  getBlockSentences(block) {
    const tokenizer = new SentenceTokenizer();
    return tokenizer.tokenize(block.content);
  }

  /**
   * 为块添加元数据
   */
  enrichMetadata(blocks, originalDocument = null) {
    return blocks.map((block, index) => ({
      ...block,
      metadata: {
        ...block.metadata,
        chunkIndex: index,
        totalChunks: blocks.length,
        previousChunkId: index > 0 ? blocks[index - 1].id : null,
        nextChunkId: index < blocks.length - 1 ? blocks[index + 1].id : null,
        documentTitle: originalDocument?.title || null,
        enriched_at: new Date()
      }
    }));
  }

  /**
   * 建立块之间的关系
   */
  establishRelationships(blocks) {
    const relationships = [];

    for (let i = 0; i < blocks.length; i++) {
      const current = blocks[i];

      // 与前一个块的关系
      if (i > 0) {
        const prev = blocks[i - 1];
        const similarity = calculateSimilarity(current.content, prev.content);
        relationships.push({
          from: prev.id,
          to: current.id,
          type: 'sequential',
          strength: similarity,
          metadata: {
            position: i,
            direction: 'forward'
          }
        });
      }

      // 查找语义相关的其他块
      for (let j = i + 1; j < blocks.length; j++) {
        const other = blocks[j];
        const similarity = calculateSimilarity(current.content, other.content);

        // 如果相似度较高，建立语义关系
        if (similarity > 0.3) {
          relationships.push({
            from: current.id,
            to: other.id,
            type: 'semantic',
            strength: similarity,
            metadata: {
              position: j,
              direction: 'jump'
            }
          });
        }
      }
    }

    return relationships;
  }
}

// ==================== 导出 ====================

export {
  generateUUID,
  SentenceTokenizer,
  SemanticAnalyzer,
  IntelligentChunker,
  ContextPreserver,
  calculateSimilarity,
  isSemanticallyRelated
};

// 默认导出智能分块器（主要入口）
export default IntelligentChunker;
