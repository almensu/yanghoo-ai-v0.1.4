import { ListTodo } from 'lucide-react';

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
];

export default navigationConfig;
