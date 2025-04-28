import logging
import re

logger = logging.getLogger(__name__)

# 正则表达式用于匹配 VTT 时间戳行
# 例如：00:00:08.400 --> 00:00:13.430
VTT_TIMESTAMP_REGEX = re.compile(r"^\d{2}:\d{2}:\d{2}\.\d{3}\s*-->\s*\d{2}:\d{2}:\d{2}\.\d{3}")

def normalize_vtt_content(vtt_content: str) -> str:
    """
    规范化 VTT 文件内容字符串，确保符合基本的空行规则。
    - 确保 WEBVTT 头及其后的空行。
    - 确保每个 cue (时间戳行) 之前有空行。
    - 移除多余的空行。

    Args:
        vtt_content: 原始 VTT 文件内容的字符串。

    Returns:
        规范化后的 VTT 文件内容的字符串。
    """
    if not vtt_content:
        return "WEBVTT\n\n" # 返回一个最小有效 VTT 结构

    lines = vtt_content.replace('\r\n', '\n').split('\n')
    fixed_lines = []
    warnings = [] # 用于记录修复信息

    # 1. 处理文件头
    header_found = False
    if lines and lines[0].strip().upper() == "WEBVTT":
        fixed_lines.append(lines[0]) # 保留原始头
        header_found = True
        if len(lines) == 1 or lines[1].strip() != "":
            warnings.append("Added missing blank line after WEBVTT header.")
            fixed_lines.append("")
        else:
            fixed_lines.append(lines[1]) # 保留已有的空行
    else:
        warnings.append("Added missing WEBVTT header and blank line.")
        fixed_lines.append("WEBVTT")
        fixed_lines.append("")
    
    # 确定开始处理内容的索引
    start_index = 0
    if header_found:
        start_index = 2 if len(fixed_lines) >= 2 else 1

    # 2. 处理剩余行，确保 cue 前有空行
    for i in range(start_index, len(lines)):
        line = lines[i]
        trimmed_line = line.strip()

        # 跳过原始文件中的空行，后面会根据需要添加
        if trimmed_line == '':
            continue 
            
        # 保留非时间戳的非空行 (文本, NOTE, STYLE 等)
        if not VTT_TIMESTAMP_REGEX.match(trimmed_line):
             # 避免在文件顶部（紧随头和空行之后）添加不必要的空行
             if not fixed_lines or fixed_lines[-1].strip() != "" or len(fixed_lines) <= 2:
                fixed_lines.append(line)
             # 如果前面是 cue 文本，现在遇到另一个非空行（可能是多行 cue），也直接添加
             elif fixed_lines and fixed_lines[-1].strip() != "":
                 fixed_lines.append(line)
             # 其他情况（如 NOTE/STYLE 之前需要空行）暂不处理，保持简单
             else:
                 warnings.append(f"Potentially unexpected non-cue line structure near: {line}")
                 fixed_lines.append(line) # 仍然添加
             continue

        # 处理时间戳行 (isCueTime)
        # 确保时间戳行之前有一个空行
        if fixed_lines and fixed_lines[-1].strip() != "":
            warnings.append(f"Added missing blank line before cue at time: {trimmed_line.split('-->')[0].strip()}")
            fixed_lines.append("")
        
        fixed_lines.append(line) # 添加时间戳行

    # 移除末尾可能产生的多余空行
    while fixed_lines and fixed_lines[-1].strip() == "":
        fixed_lines.pop()

    # 记录所有警告信息
    if warnings:
        # 只记录前几个和总数，避免日志过长
        summary = "; ".join(warnings[:3])
        if len(warnings) > 3:
            summary += f" (and {len(warnings) - 3} more formatting adjustments)"
        logger.warning(f"VTT Normalization: {summary}")

    # 返回修复后的内容，确保末尾有一个换行符
    return "\n".join(fixed_lines) + "\n" 