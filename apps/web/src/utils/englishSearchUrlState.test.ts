// @ts-nocheck
import { describe, it, expect, vi } from 'vitest';
import {
  parseEnglishSearchState,
  serializeEnglishSearchState,
  updateUrl,
  type EnglishSearchState
} from './englishSearchUrlState';

describe('englishSearchUrlState', () => {
  describe('parseEnglishSearchState', () => {
    it('should parse basic query', () => {
      const params = new URLSearchParams('view=english-search&q=Linux');
      const state = parseEnglishSearchState(params);
      expect(state).toEqual({ q: 'Linux' });
    });

    it('should parse full state', () => {
      const params = new URLSearchParams(
        'view=english-search&q=Linux&limit=50&diversity=one_per_video&sort=variety&captionKind=manual&category=Tech&tag=OS&channels=ch1,ch2&scenePack=p1'
      );
      const state = parseEnglishSearchState(params);
      expect(state).toEqual({
        q: 'Linux',
        limit: 50,
        diversity: 'one_per_video',
        sort: 'variety',
        captionKind: 'manual',
        category: 'Tech',
        tag: 'OS',
        channels: ['ch1', 'ch2'],
        scenePack: 'p1'
      });
    });

    it('should ignore invalid enum values', () => {
      const params = new URLSearchParams('view=english-search&limit=99&diversity=invalid&sort=unknown');
      const state = parseEnglishSearchState(params);
      expect(state).toEqual({});
    });

    it('should handle empty channels', () => {
      const params = new URLSearchParams('view=english-search&channels=');
      const state = parseEnglishSearchState(params);
      expect(state.channels).toBeUndefined();
    });
  });

  describe('serializeEnglishSearchState', () => {
    it('should serialize basic state', () => {
      const state: Partial<EnglishSearchState> = { q: 'Linux' };
      const params = serializeEnglishSearchState(state);
      expect(params.get('view')).toBe('english-search');
      expect(params.get('q')).toBe('Linux');
      expect(params.toString()).toBe('view=english-search&q=Linux');
    });

    it('should serialize full state', () => {
      const state: Partial<EnglishSearchState> = {
        q: 'Linux',
        limit: 50,
        diversity: 'one_per_video',
        sort: 'variety',
        captionKind: 'manual',
        category: 'Tech',
        tag: 'OS',
        channels: ['ch1', 'ch2'],
        scenePack: 'p1'
      };
      const params = serializeEnglishSearchState(state);
      expect(params.get('view')).toBe('english-search');
      expect(params.get('q')).toBe('Linux');
      expect(params.get('limit')).toBe('50');
      expect(params.get('diversity')).toBe('one_per_video');
      expect(params.get('sort')).toBe('variety');
      expect(params.get('captionKind')).toBe('manual');
      expect(params.get('category')).toBe('Tech');
      expect(params.get('tag')).toBe('OS');
      expect(params.get('channels')).toBe('ch1,ch2');
      expect(params.get('scenePack')).toBe('p1');
    });

    it('should omit default values', () => {
      const state: Partial<EnglishSearchState> = {
        q: 'Linux',
        limit: 20,
        diversity: 'balanced',
        sort: 'recent',
        captionKind: 'all'
      };
      const params = serializeEnglishSearchState(state);
      expect(params.toString()).toBe('view=english-search&q=Linux');
    });

    it('should include q when scenePack is present if q is provided', () => {
      const state: Partial<EnglishSearchState> = {
        q: 'Linux',
        scenePack: 'p1'
      };
      const params = serializeEnglishSearchState(state);
      expect(params.get('scenePack')).toBe('p1');
      expect(params.get('q')).toBe('Linux');
    });
  });

  describe('updateUrl', () => {
    it('should call history.replaceState by default', () => {
      const replaceState = vi.fn();
      vi.stubGlobal('window', {
        location: { href: 'http://localhost/' },
        history: { replaceState, pushState: vi.fn() }
      });

      const params = new URLSearchParams('view=english-search&q=Linux');
      updateUrl(params);

      expect(replaceState).toHaveBeenCalledWith(null, '', 'http://localhost/?view=english-search&q=Linux');
    });
  });
});
