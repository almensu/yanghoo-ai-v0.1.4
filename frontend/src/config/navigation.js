import {
  ListTodo, FlaskConical, Play, Subtitles, FileText,
  List, Youtube, Captions, Camera, Blocks,
  MousePointerClick, FileInput
} from 'lucide-react';

const navigationConfig = [
  {
    id: 'workspace',
    label: '工作台',
    items: [
      {
        id: 'task-list',
        label: '任务列表',
        path: '/',
        icon: ListTodo,
        group: 'workspace',
        priority: 1,
        devOnly: false,
        hidden: false,
        description: '导入媒体、管理任务、进入 Studio',
      },
    ],
  },
  {
    id: 'dev',
    label: '开发测试',
    icon: FlaskConical,
    collapsible: true,
    defaultCollapsed: true,
    items: [
      { id: 'test-video-player', label: '视频播放器', path: '/test/video-player', icon: Play, group: 'dev', priority: 1, devOnly: true, hidden: false, description: 'VideoPlayer 组件测试' },
      { id: 'test-vtt-previewer', label: '字幕预览', path: '/test/vtt-previewer', icon: Subtitles, group: 'dev', priority: 2, devOnly: true, hidden: false, description: 'VTT 字幕预览测试' },
      { id: 'test-markdown', label: 'Markdown 查看器', path: '/test/markdown', icon: FileText, group: 'dev', priority: 3, devOnly: true, hidden: false, description: 'Markdown 渲染测试' },
      { id: 'test-markdownlist', label: 'Markdown 列表', path: '/test/markdownlist', icon: List, group: 'dev', priority: 4, devOnly: true, hidden: false, description: 'Markdown 列表测试' },
      { id: 'test-youtube-timestamp', label: 'YouTube 时间戳', path: '/test/youtube-timestamp', icon: Youtube, group: 'dev', priority: 5, devOnly: true, hidden: false, description: 'YouTube 嵌入+时间戳测试' },
      { id: 'test-ass-subtitle', label: 'ASS 字幕', path: '/test/ass-subtitle', icon: Captions, group: 'dev', priority: 6, devOnly: true, hidden: false, description: 'ASS 字幕渲染测试' },
      { id: 'test-keyframe-clip', label: '关键帧剪辑', path: '/test/keyframe-clip', icon: Camera, group: 'dev', priority: 7, devOnly: true, hidden: false, description: '关键帧剪辑面板测试' },
      { id: 'test-block-editor', label: '块编辑器', path: '/test/block-editor', icon: Blocks, group: 'dev', priority: 8, devOnly: true, hidden: false, description: '块编辑器测试' },
      { id: 'test-block-drag-to-project', label: '拖拽到项目', path: '/test/block-drag-to-project', icon: MousePointerClick, group: 'dev', priority: 9, devOnly: true, hidden: false, description: '块拖拽到项目篮测试' },
      { id: 'test-markdown-to-project', label: 'Markdown 到项目', path: '/test/markdown-to-project', icon: FileInput, group: 'dev', priority: 10, devOnly: true, hidden: false, description: 'Markdown 到项目篮测试' },
    ],
  },
];

export default navigationConfig;
