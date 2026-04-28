import { Source } from '@yanghoo/domain';
import { nanoid } from 'nanoid';

export class XiaohongshuSourceAdapter {
  async capture(url: string): Promise<Source> {
    // Typical format: https://www.xiaohongshu.com/explore/ID
    const postIdMatch = url.match(/\/explore\/([a-zA-Z0-9]+)/);
    const postId = postIdMatch ? postIdMatch[1] : (url.split('/').filter(Boolean).pop() || nanoid());

    console.log(`[XiaohongshuAdapter] Capturing URL: ${url} (Post ID: ${postId})`);

    return {
      id: `xhs-${postId}`,
      sourceClass: 'short_video',
      platform: 'xiaohongshu',
      url,
      title: `Xiaohongshu Post ${postId}`,
      author: 'XHS User',
      capturedAt: new Date().toISOString(),
      metadata: {
        postId
      }
    };
  }
}

export const xiaohongshuAdapter = new XiaohongshuSourceAdapter();
