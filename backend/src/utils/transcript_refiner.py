import re
from typing import List, Dict

class TranscriptRefiner:
    """
    基于宝玉 (Baoyu) 方法论的字幕清洗引擎。
    实现字符级时间戳线性映射与语意断句。
    """

    def __init__(self):
        # 中英文末尾标点正则
        self.sentence_end_regex = re.compile(r'([^.?!…。？！]+[.?!…。？！]*)')

    def refine(self, raw_snippets: List[Dict]) -> List[Dict]:
        """
        处理流程：
        1. 展平所有片段，建立字符与时间戳的映射表。
        2. 合并全文本，并执行 CJK 优化。
        3. 按标点断句。
        4. 【新增】兜底断句：如果句子过长或存在显著停顿，强制切分。
        5. 映射回精确的起止时间。
        """
        if not raw_snippets:
            return []

        full_text = ""
        char_metadata = [] 

        for snippet in raw_snippets:
            text = snippet.get('text', '')
            start = snippet.get('start', 0.0)
            duration = snippet.get('duration', 0.0)
            
            text = " ".join(text.split())
            if not text:
                continue
                
            if full_text and full_text[-1].isalnum() and text[0].isalnum():
                full_text += " "
                char_metadata.append({'start': start, 'duration': duration, 'total': len(text), 'offset': 0})

            for i, char in enumerate(text):
                char_metadata.append({'start': start, 'duration': duration, 'total': len(text), 'offset': i})
            full_text += text

        # CJK 优化
        def is_cjk(char): return '\u4e00' <= char <= '\u9fff'
        refined_full_text = ""
        refined_char_metadata = []
        i = 0
        while i < len(full_text):
            char = full_text[i]
            if char == ' ' and i > 0 and i < len(full_text) - 1:
                if is_cjk(full_text[i-1]) and is_cjk(full_text[i+1]):
                    i += 1
                    continue
            refined_full_text += char
            refined_char_metadata.append(char_metadata[i])
            i += 1
        full_text = refined_full_text
        char_metadata = refined_char_metadata

        # 1. 执行正则断句
        initial_sentences = []
        matches = list(self.sentence_end_regex.finditer(full_text))
        
        if not matches:
            if full_text:
                initial_sentences.append({'text': full_text, 'start_idx': 0, 'end_idx': len(full_text)-1})
        else:
            for match in matches:
                initial_sentences.append({'text': match.group(), 'start_idx': match.start(), 'end_idx': match.end()-1})

        # 2. 兜底策略：处理没有标点或超长的情况
        final_sentences = []
        MAX_CHARS = 160 

        for s in initial_sentences:
            s_text = s['text']
            s_start_idx = s['start_idx']
            s_end_idx = s['end_idx']
            
            if len(s_text) <= MAX_CHARS:
                final_sentences.append(s)
                continue
            
            # 如果超长，按长度和空格强制切分
            cursor = s_start_idx
            while cursor <= s_end_idx:
                remaining_len = s_end_idx - cursor + 1
                if remaining_len <= MAX_CHARS:
                    final_sentences.append({
                        'text': full_text[cursor:s_end_idx+1],
                        'start_idx': cursor,
                        'end_idx': s_end_idx
                    })
                    break
                
                # 在 MAX_CHARS 范围内找最后一个空格
                search_limit = cursor + MAX_CHARS
                split_at = full_text.rfind(' ', cursor, search_limit)
                
                if split_at == -1 or split_at <= cursor:
                    # 没找到空格，硬切
                    split_at = search_limit
                
                final_sentences.append({
                    'text': full_text[cursor:split_at].strip(),
                    'start_idx': cursor,
                    'end_idx': min(split_at, s_end_idx)
                })
                cursor = split_at + 1

        # 3. 映射回时间戳
        def get_char_time(idx, is_end=False):
            meta = char_metadata[idx]
            # 基础线性插值公式
            # 起点: offset / total
            # 终点: (offset + 1) / total
            offset_factor = (meta['offset'] + 1) if is_end else meta['offset']
            return meta['start'] + (meta['duration'] * offset_factor / meta['total'])

        results = []
        for s in final_sentences:
            start_time = get_char_time(s['start_idx'], is_end=False)
            end_time = get_char_time(s['end_idx'], is_end=True)
            
            results.append({
                'text': s['text'].strip(),
                'start': round(start_time, 3),
                'end': round(end_time, 3)
            })

        return results

    def format_to_vtt_timestamp(self, seconds: float) -> str:
        """将秒数转换为 VTT 时间戳格式 HH:MM:SS.mmm"""
        h = int(seconds // 3600)
        m = int((seconds % 3600) // 60)
        s = seconds % 60
        return f"{h:02d}:{m:02d}:{s:06.3f}"
