import { 
  EnglishScenePack, 
  EnglishScenePackExample, 
  EnglishScenePackSummary 
} from '@yanghoo/domain';
import { englishScenePackStorage } from '@yanghoo/storage';

export async function importEnglishScenePackUseCase(params: {
  sceneBrief: any;
  evidencePack: any;
  studyPackPath?: string;
  request?: string;
}): Promise<EnglishScenePack> {
  const { sceneBrief, evidencePack, studyPackPath, request } = params;

  if (sceneBrief.kind !== 'scene-brief') {
    throw new Error('Invalid scene-brief JSON');
  }
  if (evidencePack.kind !== 'yanghoo-evidence-pack') {
    throw new Error('Invalid evidence-pack JSON');
  }

  const packId = sceneBrief.id;
  const now = new Date().toISOString();

  const examples: EnglishScenePackExample[] = (evidencePack.examples || []).map((ex: any) => {
    // Basic validation of required fields
    if (!ex.videoId || !ex.channelId || !ex.text || ex.start === undefined) {
      throw new Error(`Invalid example in evidence pack for query: ${ex.query}`);
    }

    const startSeconds = Math.floor(ex.start);
    const videoId = ex.videoId;
    
    return {
      query: ex.query,
      text: ex.text,
      channelId: ex.channelId,
      videoId: videoId,
      sourceId: ex.sourceId || `yt-${videoId}`,
      title: ex.title || ex.videoTitle || ex.channelTitle,
      start: ex.start,
      end: ex.end,
      youtubeTimestampUrl: ex.youtubeTimestampUrl || `https://www.youtube.com/watch?v=${videoId}&t=${startSeconds}s`,
      youtubeEmbedUrl: `https://www.youtube.com/embed/${videoId}?start=${startSeconds}`,
      startSeconds,
      captionKind: ex.captionKind,
      captionLanguage: 'en'
    };
  });

  const pack: EnglishScenePack = {
    version: 1,
    id: packId,
    title: sceneBrief.scene || packId,
    scene: sceneBrief.scene || packId,
    request: request,
    level: sceneBrief.level || 'L2',
    source: {
      kind: 'anything-scene',
      path: sceneBrief.source?.path,
      repo: sceneBrief.source?.repo
    },
    queries: sceneBrief.queries || [],
    examples,
    warnings: evidencePack.warnings || [],
    studyPackPath,
    createdAt: now,
    updatedAt: now
  };

  // Upsert pack
  const existing = await englishScenePackStorage.readPack(packId);
  if (existing) {
    pack.createdAt = existing.createdAt;
  }
  
  await englishScenePackStorage.writePack(pack);

  // Update index
  const indexFile = await englishScenePackStorage.readIndex();
  const summary: EnglishScenePackSummary = {
    id: pack.id,
    title: pack.title,
    scene: pack.scene,
    request: pack.request,
    queryCount: pack.queries.length,
    exampleCount: pack.examples.length,
    updatedAt: pack.updatedAt
  };

  const otherItems = indexFile.items.filter(i => i.id !== packId);
  indexFile.items = [...otherItems, summary].sort((a, b) => 
    new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
  );
  indexFile.updatedAt = now;
  
  await englishScenePackStorage.writeIndex(indexFile);

  return pack;
}
