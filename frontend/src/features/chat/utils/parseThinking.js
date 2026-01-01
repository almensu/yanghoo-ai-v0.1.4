export default function parseThinking(content) {
  if (!content) return { thinkingSegments: [], reply: '' };
  const regex = /<think>([\s\S]*?)<\/think>/g;
  const segments = [];
  let m;
  while ((m = regex.exec(content)) !== null) {
    segments.push((m[1] || '').trim());
  }
  let reply = content;
  reply = reply.replace(regex, '').trim();
  return { thinkingSegments: segments, reply };
}

