# @yanghoo/source-adapters

Responsibility: Adapting external platforms (YouTube, Xiaoyuzhou, etc.) into the internal `Source` domain model.

## Planned Adapters
- youtubeSourceAdapter
- xiaoyuzhouSourceAdapter
- applePodcastSourceAdapter
- douyinSourceAdapter
- xiaohongshuSourceAdapter
- xSourceAdapter
- webpageSourceAdapter

## Forbidden Dependencies
- Must not depend on `apps/` or other adapter packages.
- Must only depend on `@yanghoo/domain`.
