import type {
  EnglishSearchCaptionKind,
  EnglishSearchDiversity,
  EnglishSearchSort
} from '../api/client';

export interface EnglishSearchState {
  view: 'english-search';
  q?: string;
  limit?: number;
  diversity?: EnglishSearchDiversity;
  sort?: EnglishSearchSort;
  captionKind?: EnglishSearchCaptionKind;
  category?: string;
  tag?: string;
  channels?: string[];
  scenePack?: string;
}

export function parseEnglishSearchState(params: URLSearchParams): Partial<EnglishSearchState> {
  const state: Partial<EnglishSearchState> = {};

  const q = params.get('q');
  if (q) state.q = q;

  const limit = params.get('limit');
  if (limit) {
    const n = parseInt(limit, 10);
    if ([20, 50, 100].includes(n)) state.limit = n as 20 | 50 | 100;
  }

  const diversity = params.get('diversity');
  if (diversity && ['balanced', 'all', 'one_per_video'].includes(diversity)) {
    state.diversity = diversity as EnglishSearchDiversity;
  }

  const sort = params.get('sort');
  if (sort && ['recent', 'variety'].includes(sort)) {
    state.sort = sort as EnglishSearchSort;
  }

  const captionKind = params.get('captionKind');
  if (captionKind && ['all', 'manual', 'auto'].includes(captionKind)) {
    state.captionKind = captionKind as EnglishSearchCaptionKind;
  }

  const category = params.get('category');
  if (category) state.category = category;

  const tag = params.get('tag');
  if (tag) state.tag = tag;

  const channels = params.get('channels');
  if (channels) {
    state.channels = channels.split(',').map(s => s.trim()).filter(Boolean);
  }

  const scenePack = params.get('scenePack');
  if (scenePack) state.scenePack = scenePack;

  return state;
}

export function serializeEnglishSearchState(state: Partial<EnglishSearchState>): URLSearchParams {
  const params = new URLSearchParams();
  params.set('view', 'english-search');

  if (state.scenePack) {
    params.set('scenePack', state.scenePack);
    // When scenePack is present, q is optional but can be kept if desired.
    // The plan says "may omit q" and "scenePack wins".
    if (state.q) params.set('q', state.q);
  } else if (state.q) {
    params.set('q', state.q);
  }

  if (state.limit && state.limit !== 20) {
    params.set('limit', state.limit.toString());
  }

  if (state.diversity && state.diversity !== 'balanced') {
    params.set('diversity', state.diversity);
  }

  if (state.sort && state.sort !== 'recent') {
    params.set('sort', state.sort);
  }

  if (state.captionKind && state.captionKind !== 'all') {
    params.set('captionKind', state.captionKind);
  }

  if (state.category) {
    params.set('category', state.category);
  }

  if (state.tag) {
    params.set('tag', state.tag);
  }

  if (state.channels && state.channels.length > 0) {
    params.set('channels', state.channels.join(','));
  }

  return params;
}

export function updateUrl(params: URLSearchParams, replace = true) {
  const url = new URL(window.location.href);
  url.search = params.toString();
  if (replace) {
    window.history.replaceState(null, '', url.toString());
  } else {
    window.history.pushState(null, '', url.toString());
  }
}
