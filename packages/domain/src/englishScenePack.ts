export interface EnglishScenePack {
  version: 1;
  id: string;
  title: string;
  scene: string;
  request?: string;
  level: string;
  source: {
    kind: 'anything-scene' | 'ad-hoc-request';
    path?: string;
    repo?: string;
  };
  queries: string[];
  examples: EnglishScenePackExample[];
  warnings: string[];
  studyPackPath?: string;
  createdAt: string;
  updatedAt: string;
}

export interface EnglishScenePackExample {
  query: string;
  text: string;
  channelId: string;
  videoId: string;
  sourceId: string;
  title?: string;
  start: number;
  end?: number;
  youtubeTimestampUrl: string;
  youtubeEmbedUrl: string;
  startSeconds: number;
  captionKind?: string;
  captionLanguage: 'en';
}

export interface EnglishScenePackSummary {
  id: string;
  title: string;
  scene: string;
  request?: string;
  queryCount: number;
  exampleCount: number;
  updatedAt: string;
}
